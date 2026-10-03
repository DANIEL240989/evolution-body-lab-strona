# Kora (srebrna, pionowe włókna) przechodząca w mozaikę świecącej żywicy (wzór Daniela, obraz z korą), żyłki różowego złota. Prawdziwa scena 3D w Blenderze (Cycles):
# geometria z przemieszczeniem (displacement), bez AI i bez zewnętrznych tekstur.
# Chmura (bpy z pip): python lupek_scena.py <szer> <wys> <probki> <wyjscie.png> [CPU|GPU] [siatka]
# Blender + RTX:      blender -b -P lupek_scena.py -- 2400 1350 512 lupek.png GPU 1600
# Na Windows: narzedzia/blender/render_rtx.ps1
import sys, math, bpy

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
W, H, SPP, OUT = int(A[0]), int(A[1]), int(A[2]), A[3]
URZ = (A[4] if len(A) > 4 else 'CPU').upper()
SIATKA = int(A[5]) if len(A) > 5 else 900

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
    if sc.cycles.device != 'GPU': print('UWAGA: brak GPU OPTIX/CUDA, render na CPU')
sc.cycles.samples = SPP; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = OUT

def lin(hexc):
    h = hexc.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + .055) / 1.055) ** 2.4) for x in c) + (1.0,)

world = bpy.data.worlds.new('swiat'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = lin('#04070D')
world.node_tree.nodes['Background'].inputs[1].default_value = 0.3

# gęsta siatka pod prawdziwy relief
bpy.ops.mesh.primitive_grid_add(x_subdivisions=SIATKA, y_subdivisions=int(SIATKA * 0.62), size=1)
plyta = bpy.context.object; plyta.scale = (19, 11.8, 1); bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.shade_smooth()

m = bpy.data.materials.new('lupek'); m.use_nodes = True
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
def zakres(v, a, b, c=0.0, d=1.0, gladko=True):
    n = node('ShaderNodeMapRange'); L.new(v, n.inputs[0])
    n.inputs[1].default_value, n.inputs[2].default_value = a, b
    n.inputs[3].default_value, n.inputs[4].default_value = c, d
    if gladko: n.interpolation_type = 'SMOOTHSTEP'
    return n.outputs[0]
def szum(vec, skala, detal=6, szorst=0.55):
    n = node('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = skala
    n.inputs['Detail'].default_value = detal; n.inputs['Roughness'].default_value = szorst
    L.new(vec, n.inputs['Vector']); return n
def rampa(v, punkty):
    r = node('ShaderNodeValToRGB'); e = r.color_ramp.elements
    e[0].position, e[0].color = punkty[0]; e[1].position, e[1].color = punkty[-1]
    for pos, kol in punkty[1:-1]: x = e.new(pos); x.color = kol
    L.new(v, r.inputs[0]); return r.outputs['Color']

tc = node('ShaderNodeTexCoord'); ob = tc.outputs['Object']
sep = node('ShaderNodeSeparateXYZ'); L.new(ob, sep.inputs[0])
# granica kora | żywica: postrzępiona, po skosie; żywica po PRAWEJ (tekst stoi na korze po lewej)
gr_sz = szum(ob, 0.9, 6, 0.6)
gr = M('ADD', M('ADD', sep.outputs['X'], M('MULTIPLY', sep.outputs['Y'], -0.35)), M('MULTIPLY', M('SUBTRACT', gr_sz.outputs['Fac'], 0.5), 3.2))
zyw_strefa = zakres(gr, 1.2, 1.9)                       # 0 kora, 1 mozaika żywicy
brzeg = M('SUBTRACT', 1.0, M('ABSOLUTE', M('SUBTRACT', M('MULTIPLY', zyw_strefa, 2.0), 1.0)))  # 1 na styku
# --- KORA: pionowe włókna i głębokie, długie bruzdy
wl_map = node('ShaderNodeMapping'); wl_map.inputs['Rotation'].default_value = (0, 0, math.radians(8))
wl_map.inputs['Scale'].default_value = (4.2, 0.3, 1); L.new(ob, wl_map.inputs['Vector'])
dz = szum(ob, 0.6, 4); mxv = node('ShaderNodeMix', data_type='VECTOR'); mxv.inputs['Factor'].default_value = 0.25
L.new(wl_map.outputs[0], mxv.inputs['A']); L.new(dz.outputs['Color'], mxv.inputs['B']); wv = mxv.outputs['Result']
wlokna = szum(wv, 1.7, 12, 0.7)
bruzdy_v = node('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); bruzdy_v.inputs['Scale'].default_value = 0.9
bm = node('ShaderNodeMapping'); bm.inputs['Scale'].default_value = (1.9, 0.28, 1); L.new(wv, bm.inputs['Vector'])
L.new(bm.outputs[0], bruzdy_v.inputs['Vector'])
bruzda = M('SUBTRACT', 1.0, zakres(bruzdy_v.outputs['Distance'], 0.0, 0.08))   # 1 w szczelinie kory
pop = node('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); pop.inputs['Scale'].default_value = 1.3
pm = node('ShaderNodeMapping'); pm.inputs['Scale'].default_value = (0.9, 2.4, 1); L.new(wv, pm.inputs['Vector']); L.new(pm.outputs[0], pop.inputs['Vector'])
poprz = M('MULTIPLY', M('SUBTRACT', 1.0, zakres(pop.outputs['Distance'], 0.0, 0.03)), M('GREATER_THAN', szum(ob, 1.2, 3).outputs['Fac'], 0.47))
bruzda = M('MAXIMUM', bruzda, poprz, clamp=True)
kora_h = M('SUBTRACT', M('MULTIPLY', wlokna.outputs['Fac'], 0.4), M('MULTIPLY', bruzda, 0.75))
# --- ŻYWICA: mozaika komórek z ciemnymi, wypukłymi spękaniami (jak zaschnięta glina)
mz = node('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); mz.inputs['Scale'].default_value = 1.8
mzm = node('ShaderNodeMix', data_type='VECTOR'); mzm.inputs['Factor'].default_value = 0.12
L.new(ob, mzm.inputs['A']); L.new(szum(ob, 1.5, 4).outputs['Color'], mzm.inputs['B']); L.new(mzm.outputs['Result'], mz.inputs['Vector'])
mz2 = node('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); mz2.inputs['Scale'].default_value = 7.5
L.new(mzm.outputs['Result'], mz2.inputs['Vector'])
spek = M('MAXIMUM', M('SUBTRACT', 1.0, zakres(mz.outputs['Distance'], 0.0, 0.05)), M('MULTIPLY', M('SUBTRACT', 1.0, zakres(mz2.outputs['Distance'], 0.0, 0.012)), 0.7))
komorka = M('SUBTRACT', 1.0, spek)                       # 1 = tafla żywicy
zyw_h = M('ADD', M('MULTIPLY', spek, 0.12), M('MULTIPLY', zakres(mz.outputs['Distance'], 0.0, 0.25), 0.08))
# --- połączenie
wys = node('ShaderNodeMix', data_type='FLOAT'); L.new(zyw_strefa, wys.inputs['Factor'])
L.new(kora_h, wys.inputs['A']); L.new(zyw_h, wys.inputs['B'])
disp = node('ShaderNodeDisplacement'); disp.inputs['Scale'].default_value = 0.38; disp.inputs['Midlevel'].default_value = 0.2
L.new(wys.outputs['Result'], disp.inputs['Height'])
# złoto: styk kory i żywicy + część spękań przy styku
zloto = M('MAXIMUM', M('GREATER_THAN', brzeg, 0.72), M('MULTIPLY', M('GREATER_THAN', spek, 0.8), M('GREATER_THAN', brzeg, 0.45)), clamp=True)
zywica = M('MULTIPLY', M('MULTIPLY', zyw_strefa, komorka), M('SUBTRACT', 1.0, zloto))
# kolory kory: srebrna szarość, czarne bruzdy, lekko chłodna
k_kora = rampa(wlokna.outputs['Fac'], [(0.2, lin('#16191D')), (0.45, lin('#5E646B')), (0.66, lin('#A7ADB3')), (0.85, lin('#E0E3E6'))])
ck = node('ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); L.new(bruzda, ck.inputs['Factor'])
L.new(k_kora, ck.inputs['A']); ck.inputs['B'].default_value = lin('#050607')
# spękania mozaiki: prawie czarne
cz = node('ShaderNodeMix', data_type='RGBA'); L.new(zyw_strefa, cz.inputs['Factor'])
L.new(ck.outputs['Result'], cz.inputs['A']); cz.inputs['B'].default_value = lin('#07090C')
kam = node('ShaderNodeBsdfPrincipled'); L.new(cz.outputs['Result'], kam.inputs['Base Color'])
L.new(zakres(wlokna.outputs['Fac'], 0.3, 0.9, 0.9, 0.55), kam.inputs['Roughness'])
# żywica: niebieska z turkusowym podtonem, świeci od środka komórki
gl = zakres(mz.outputs['Distance'], 0.0, 0.22)
k_zyw = rampa(gl, [(0.0, lin('#020A1E')), (0.55, lin('#0A3F96')), (1.0, lin('#1C7FD0'))])
zyw = node('ShaderNodeBsdfPrincipled'); L.new(k_zyw, zyw.inputs['Base Color'])
zyw.inputs['Roughness'].default_value = 0.04; zyw.inputs['Coat Weight'].default_value = 1.0; zyw.inputs['Coat Roughness'].default_value = 0.0
L.new(k_zyw, zyw.inputs['Emission Color']); L.new(zakres(gl, 0.0, 1.0, 0.15, 1.4), zyw.inputs['Emission Strength'])
zl = node('ShaderNodeBsdfPrincipled'); zl.inputs['Base Color'].default_value = lin('#E2A99A')
zl.inputs['Metallic'].default_value = 1.0; zl.inputs['Roughness'].default_value = 0.18
m1 = node('ShaderNodeMixShader'); L.new(zywica, m1.inputs[0]); L.new(kam.outputs[0], m1.inputs[1]); L.new(zyw.outputs[0], m1.inputs[2])
m2 = node('ShaderNodeMixShader'); L.new(zloto, m2.inputs[0]); L.new(m1.outputs[0], m2.inputs[1]); L.new(zl.outputs[0], m2.inputs[2])
out = node('ShaderNodeOutputMaterial'); L.new(m2.outputs[0], out.inputs['Surface']); L.new(disp.outputs[0], out.inputs['Displacement'])
plyta.data.materials.append(m)

def lampa(nazwa, loc, rot, moc, rozm, kol):
    d = bpy.data.lights.new(nazwa, 'AREA'); d.energy = moc; d.size = rozm; d.color = kol[:3]
    o = bpy.data.objects.new(nazwa, d); o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]
    sc.collection.objects.link(o)
lampa('klucz', (-8, 4, 3.2), (-62, 0, 245), 2200, 4, lin('#E6ECF4'))     # niskie, boczne: wydobywa relief
lampa('kontra', (10, 3, 2.0), (75, 0, 105), 900, 2.0, lin('#FFD9C8'))
lampa('gora', (3, 1, 8), (0, 0, 0), 300, 4, lin('#8FA8D8'))

kd = bpy.data.cameras.new('kam'); kd.lens = 50; kd.dof.use_dof = True; kd.dof.aperture_fstop = 3.2
ko = bpy.data.objects.new('kam', kd); sc.collection.objects.link(ko); sc.camera = ko
ko.location = (0.6, -6.8, 6.6); ko.rotation_euler = (math.radians(45), 0, math.radians(2))
cel = bpy.data.objects.new('ostrosc', None); cel.location = (2.6, 0.4, 0); sc.collection.objects.link(cel)
kd.dof.focus_object = cel

bpy.ops.render.render(write_still=True)
print('ZAPISANO', OUT)
