# Pierwszy ekran Evolution Body Lab: czysty błękit (gładka, lana żywica) po lewej, prawdziwa kora/drewno ze skanu
# po prawej, styk w różowym złocie. Wzór Daniela (03.10.2026). Skan: Poly Haven „rough_wood” (CC0), 4K.
# Blender + RTX:  blender -b -P kora_foto.py -- 2400 1350 512 wyjscie.png GPU 2000 "<katalog tekstur>"
import sys, math, os, bpy

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
W, H, SPP, OUT = int(A[0]), int(A[1]), int(A[2]), A[3]
URZ = (A[4] if len(A) > 4 else 'CPU').upper()
SIATKA = int(A[5]) if len(A) > 5 else 1200
TEX = A[6] if len(A) > 6 else r'D:\IMPERIUM\3d\zasoby\polyhaven\rough_wood\textures'

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
if URZ == 'GPU':
    pref = bpy.context.preferences.addons['cycles'].preferences
    for typ in ('OPTIX', 'CUDA'):
        try:
            pref.compute_device_type = typ; pref.get_devices()
            karty = [d for d in pref.devices if d.type == typ]
            if karty:
                for d in pref.devices: d.use = (d.type == typ)
                sc.cycles.device = 'GPU'; print('RENDER NA', typ, [d.name for d in karty]); break
        except TypeError:
            pass
sc.cycles.samples = SPP; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = OUT

def lin(hexc):
    h = hexc.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + .055) / 1.055) ** 2.4) for x in c) + (1.0,)
def plik(fragment):
    for f in os.listdir(TEX):
        if fragment in f: return os.path.join(TEX, f)
    raise FileNotFoundError(fragment + ' w ' + TEX)

world = bpy.data.worlds.new('swiat'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = lin('#0A0F18')
world.node_tree.nodes['Background'].inputs[1].default_value = 0.25

bpy.ops.mesh.primitive_grid_add(x_subdivisions=SIATKA, y_subdivisions=int(SIATKA * 0.6), size=1)
plyta = bpy.context.object; plyta.scale = (12, 7.2, 1); bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.shade_smooth()

m = bpy.data.materials.new('kora_blekit'); m.use_nodes = True
try: m.displacement_method = 'BOTH'
except AttributeError: m.cycles.displacement_method = 'BOTH'
nt = m.node_tree; N = nt.nodes; L = nt.links
for n in list(N): N.remove(n)
def node(t, **kw):
    n = N.new(t)
    for k, v in kw.items(): setattr(n, k, v)
    return n
def M(op, a, b=None, clamp=False):
    n = node('ShaderNodeMath', operation=op); n.use_clamp = clamp
    for i, v in enumerate((a, b)):
        if v is None: continue
        if isinstance(v, (int, float)): n.inputs[i].default_value = v
        else: L.new(v, n.inputs[i])
    return n.outputs[0]
def zakres(v, a, b, c=0.0, d=1.0):
    n = node('ShaderNodeMapRange'); L.new(v, n.inputs[0]); n.interpolation_type = 'SMOOTHSTEP'
    n.inputs[1].default_value, n.inputs[2].default_value = a, b
    n.inputs[3].default_value, n.inputs[4].default_value = c, d
    return n.outputs[0]

tc = node('ShaderNodeTexCoord'); ob = tc.outputs['Object']
sep = node('ShaderNodeSeparateXYZ'); L.new(ob, sep.inputs[0])
# skan drewna: słoje pionowo, jeden kafel 4K na ok. 4,5 jednostki szerokości
mp = node('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.17, 0.17, 1)
L.new(ob, mp.inputs['Vector'])
def obraz(frag, kolor=True):
    t = node('ShaderNodeTexImage'); t.image = bpy.data.images.load(plik(frag))
    if not kolor: t.image.colorspace_settings.name = 'Non-Color'
    t.extension = 'REPEAT'; L.new(mp.outputs[0], t.inputs['Vector']); return t
t_diff, t_nor, t_disp = obraz('_diff_'), obraz('_nor_gl_', False), obraz('_disp_', False)
try: t_rough = obraz('_rough_', False)
except FileNotFoundError: t_rough = None
disp_v = t_disp.outputs['Color']
dsep = node('ShaderNodeSeparateColor'); L.new(disp_v, dsep.inputs[0]); dw = dsep.outputs[0]

# granica: postrzępiona, żywica wpływa w głębsze pęknięcia drewna przy styku
sz = node('ShaderNodeTexNoise'); sz.inputs['Scale'].default_value = 0.35; sz.inputs['Detail'].default_value = 5
L.new(ob, sz.inputs['Vector'])
pole = M('ADD', M('ADD', sep.outputs['X'], 0.6), M('MULTIPLY', M('SUBTRACT', sz.outputs['Fac'], 0.5), 2.2))
w_pek = M('MULTIPLY', M('SUBTRACT', 1.0, zakres(pole, 0.0, 1.6)), M('LESS_THAN', dw, 0.32))   # żywica w pęknięciach przy styku
zywica = M('MAXIMUM', M('LESS_THAN', pole, 0.0), w_pek, clamp=True)
# różowe złoto: cienka obwódka tam, gdzie żywica spotyka drewno
obw = M('SUBTRACT', M('MAXIMUM', M('LESS_THAN', pole, 0.11), M('MULTIPLY', M('SUBTRACT', 1.0, zakres(pole, 0.0, 1.7)), M('LESS_THAN', dw, 0.36)), clamp=True), zywica)
# kintsugi: różowe złoto w najgłębszych pęknięciach drewna, tylko w części desek
kz_maska = node('ShaderNodeTexNoise'); kz_maska.inputs['Scale'].default_value = 0.5; L.new(ob, kz_maska.inputs['Vector'])
kintsugi = M('MULTIPLY', M('LESS_THAN', dw, 0.3), M('GREATER_THAN', kz_maska.outputs['Fac'], 0.45))
kintsugi = M('MULTIPLY', kintsugi, M('SUBTRACT', 1.0, zywica))
zloto = M('MAXIMUM', obw, kintsugi, clamp=True)

# drewno: skan odbarwiony do grafitu ze srebrnymi grzbietami (jak wzór), bez brązu
hs = node('ShaderNodeHueSaturation'); hs.inputs['Saturation'].default_value = 0.06; hs.inputs['Value'].default_value = 1.25
L.new(t_diff.outputs['Color'], hs.inputs['Color'])
bc = node('ShaderNodeBrightContrast'); bc.inputs['Bright'].default_value = 0.0; bc.inputs['Contrast'].default_value = 0.22
L.new(hs.outputs['Color'], bc.inputs['Color'])
chl = node('ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); chl.inputs['Factor'].default_value = 0.55
L.new(bc.outputs['Color'], chl.inputs['A']); chl.inputs['B'].default_value = lin('#B8C4D6')
drewno = node('ShaderNodeBsdfPrincipled'); L.new(chl.outputs['Result'], drewno.inputs['Base Color'])
if t_rough: L.new(t_rough.outputs['Color'], drewno.inputs['Roughness'])
else: drewno.inputs['Roughness'].default_value = 0.75
nmap = node('ShaderNodeNormalMap'); nmap.inputs['Strength'].default_value = 1.4; L.new(t_nor.outputs['Color'], nmap.inputs['Color'])
L.new(nmap.outputs['Normal'], drewno.inputs['Normal'])

# czysty błękit: gładka, lana żywica, głęboki lazur z lekkim przejściem, połysk lakieru
gb = node('ShaderNodeTexNoise'); gb.inputs['Scale'].default_value = 0.3; gb.inputs['Detail'].default_value = 1; L.new(ob, gb.inputs['Vector'])
rb = node('ShaderNodeValToRGB'); e = rb.color_ramp.elements
e[0].position, e[0].color = 0.25, lin('#031F5C'); e[1].position, e[1].color = 0.8, lin('#1458B8')
gl_b = M('ADD', M('MULTIPLY', gb.outputs['Fac'], 0.6), M('MULTIPLY', zakres(pole, -2.5, 0.0), 0.5))
L.new(gl_b, rb.inputs[0])
blekit = node('ShaderNodeBsdfPrincipled'); L.new(rb.outputs['Color'], blekit.inputs['Base Color'])
blekit.inputs['Roughness'].default_value = 0.08; blekit.inputs['Coat Weight'].default_value = 1.0
blekit.inputs['Coat Roughness'].default_value = 0.02
L.new(rb.outputs['Color'], blekit.inputs['Emission Color']); blekit.inputs['Emission Strength'].default_value = 0.04

zl = node('ShaderNodeBsdfPrincipled'); zl.inputs['Base Color'].default_value = lin('#E8B3A6')
zl.inputs['Metallic'].default_value = 1.0; zl.inputs['Roughness'].default_value = 0.16
zl.inputs['Emission Color'].default_value = lin('#F2B9A8'); zl.inputs['Emission Strength'].default_value = 0.9   # złoto świeci delikatnie, czytelne także w cieniu

m1 = node('ShaderNodeMixShader'); L.new(zywica, m1.inputs[0]); L.new(drewno.outputs[0], m1.inputs[1]); L.new(blekit.outputs[0], m1.inputs[2])
m2 = node('ShaderNodeMixShader'); L.new(zloto, m2.inputs[0]); L.new(m1.outputs[0], m2.inputs[1]); L.new(zl.outputs[0], m2.inputs[2])

# wysokość: drewno ze skanu, żywica wylana płasko poniżej grzbietów drewna (cień krawędzi pada na błękit)
wys = node('ShaderNodeMix', data_type='FLOAT'); L.new(zywica, wys.inputs['Factor'])
L.new(M('ADD', dw, M('MULTIPLY', zloto, 0.12)), wys.inputs['A']); wys.inputs['B'].default_value = 0.42
disp = node('ShaderNodeDisplacement'); disp.inputs['Scale'].default_value = 0.16; disp.inputs['Midlevel'].default_value = 0.5
L.new(wys.outputs['Result'], disp.inputs['Height'])
out = node('ShaderNodeOutputMaterial'); L.new(m2.outputs[0], out.inputs['Surface']); L.new(disp.outputs[0], out.inputs['Displacement'])
plyta.data.materials.append(m)

def lampa(nazwa, loc, rot, moc, rozm, kol):
    d = bpy.data.lights.new(nazwa, 'AREA'); d.energy = moc; d.size = rozm; d.color = kol[:3]
    o = bpy.data.objects.new(nazwa, d); o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]
    sc.collection.objects.link(o)
lampa('klucz', (-5, 5, 5), (-45, 0, 225), 1800, 6, lin('#EEF2F8'))      # miękkie, z lewej góry
lampa('kontra', (8, 1, 1.4), (80, 0, 100), 2200, 1.5, lin('#FFE0D2'))   # nisko z prawej: relief drewna i blik złota
lampa('wypelnienie', (0, -6, 4), (55, 0, 0), 220, 8, lin('#9FB8E8'))
lampa('zlota_krawedz', (-6, 2.5, 0.8), (84, 0, -110), 900, 0.8, lin('#FFE6DA'))   # nisko z lewej: blik na złotej krawędzi

kd = bpy.data.cameras.new('kam'); kd.lens = 65; kd.dof.use_dof = True; kd.dof.aperture_fstop = 4.0
ko = bpy.data.objects.new('kam', kd); sc.collection.objects.link(ko); sc.camera = ko
ko.location = (0.3, -5.6, 5.4); ko.rotation_euler = (math.radians(44), 0, 0)
cel = bpy.data.objects.new('ostrosc', None); cel.location = (0.4, 0.2, 0); sc.collection.objects.link(cel)
kd.dof.focus_object = cel

bpy.ops.render.render(write_still=True)
print('ZAPISANO', OUT)
