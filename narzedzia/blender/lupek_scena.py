# Łupek, kora i żywica świecąca jak lawa, żyłki różowego złota. Prawdziwa scena 3D w Blenderze (Cycles):
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
prawo = zakres(sep.outputs['X'], -2.0, 6.5)             # 0 pod tekstem, 1 po prawej
# kierunek warstw: łupek i kora idą po skosie
mp = node('ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, 0, math.radians(-32)); L.new(ob, mp.inputs['Vector'])
skos = mp.outputs[0]
dz = szum(ob, 0.45, 5)
mx = node('ShaderNodeMix', data_type='VECTOR'); mx.inputs['Factor'].default_value = 0.6
L.new(skos, mx.inputs['A']); L.new(dz.outputs['Color'], mx.inputs['B']); wsp = mx.outputs['Result']

# płyty łupka: komórki z własnym nachyleniem i wysokością
kom = node('ShaderNodeTexVoronoi', feature='F1'); kom.inputs['Scale'].default_value = 0.85; L.new(wsp, kom.inputs['Vector'])
kraw = node('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); kraw.inputs['Scale'].default_value = 0.85; L.new(wsp, kraw.inputs['Vector'])
e = kraw.outputs['Distance']
plyty_h = M('MULTIPLY', node('ShaderNodeSeparateColor').outputs[0], 1.0)  # zastąpione niżej
sepc = node('ShaderNodeSeparateColor'); L.new(kom.outputs['Color'], sepc.inputs[0])
plyty_h = M('MULTIPLY', sepc.outputs[0], 0.55)
# warstwy łupka: tarasy (schodki) z rozciągniętego szumu
ws = node('ShaderNodeMapping'); ws.inputs['Scale'].default_value = (0.35, 2.2, 1); L.new(wsp, ws.inputs['Vector'])
wl = szum(ws.outputs[0], 1.1, 8, 0.6)
taras = M('DIVIDE', M('FLOOR', M('MULTIPLY', wl.outputs['Fac'], 9.0)), 9.0)
# włókna kory: długie, wąskie bruzdy wzdłuż skosu
kf = node('ShaderNodeMapping'); kf.inputs['Scale'].default_value = (0.25, 9.0, 1); L.new(wsp, kf.inputs['Vector'])
kora = szum(kf.outputs[0], 2.4, 12, 0.72)
bruzdy = zakres(kora.outputs['Fac'], 0.38, 0.62)
# szczeliny: szerokość rośnie w prawo, różna wzdłuż pęknięcia
sw = szum(wsp, 1.4, 3)
szer = M('ADD', M('MULTIPLY', M('MULTIPLY', sw.outputs['Fac'], 0.11), prawo), 0.004)
zywica = M('LESS_THAN', e, szer)
glebia = M('DIVIDE', e, M('MAXIMUM', szer, 0.001), clamp=True)   # 0 środek szczeliny, 1 brzeg
# drobne spękania (pajęczyna) na płytach po prawej
dr = node('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); dr.inputs['Scale'].default_value = 3.6; L.new(wsp, dr.inputs['Vector'])
dr_mask = M('GREATER_THAN', szum(wsp, 2.0, 2).outputs['Fac'], 0.55)
rysy = M('MULTIPLY', M('MULTIPLY', M('LESS_THAN', dr.outputs['Distance'], 0.009), dr_mask), M('GREATER_THAN', prawo, 0.3))
# złoto: obwódka szczeliny + rysy
zl_obw = M('SUBTRACT', M('LESS_THAN', e, M('ADD', szer, 0.018)), zywica)
zl_obw = M('MULTIPLY', zl_obw, M('GREATER_THAN', prawo, 0.08))
zloto = M('MAXIMUM', zl_obw, rysy, clamp=True)

# --- wysokość (prawdziwa geometria)
wys = M('ADD', M('MULTIPLY', plyty_h, 1.0), M('MULTIPLY', taras, 0.45))
wys = M('SUBTRACT', wys, M('MULTIPLY', bruzdy, 0.22))
wys = M('MULTIPLY', wys, zakres(e, 0.0, 0.16, 0.25, 1.0))                # krawędzie płyt opadają do szczeliny
wys = M('SUBTRACT', wys, M('MULTIPLY', zywica, 0.35))                     # żywica niżej
wys = M('ADD', wys, M('MULTIPLY', zloto, 0.05))
wys = M('MULTIPLY', wys, M('ADD', M('MULTIPLY', prawo, 0.6), 0.4))       # po lewej spokojniej
disp = node('ShaderNodeDisplacement'); disp.inputs['Scale'].default_value = 0.42; disp.inputs['Midlevel'].default_value = 0.4
L.new(wys, disp.inputs['Height'])

# --- kamień: łupek grafitowo-granatowy, popielate grzbiety kory, chmury marmuru
chm = szum(wsp, 0.7, 10, 0.6)
kol_lupek = rampa(chm.outputs['Fac'], [(0.25, lin('#04060B')), (0.5, lin('#0E1A2E')), (0.72, lin('#36588A'))])
kol_kora = rampa(kora.outputs['Fac'], [(0.3, lin('#05070A')), (0.6, lin('#3E454E')), (0.85, lin('#8F969E'))])
mk = node('ShaderNodeMix', data_type='RGBA', blend_type='OVERLAY')
L.new(M('MULTIPLY', zakres(wl.outputs['Fac'], 0.3, 0.8), 0.55), mk.inputs['Factor'])
L.new(kol_lupek, mk.inputs['A']); L.new(kol_kora, mk.inputs['B'])
ciem = node('ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY')
L.new(M('SUBTRACT', 1.0, M('ADD', M('MULTIPLY', prawo, 0.55), 0.25)), ciem.inputs['Factor'])
L.new(mk.outputs['Result'], ciem.inputs['A']); ciem.inputs['B'].default_value = lin('#20242C')
kam = node('ShaderNodeBsdfPrincipled'); L.new(ciem.outputs['Result'], kam.inputs['Base Color'])
L.new(zakres(kora.outputs['Fac'], 0.3, 0.8, 0.85, 0.45), kam.inputs['Roughness'])

# --- żywica jak lawa: świeci od środka szczeliny, szklista powierzchnia
k_zyw = rampa(glebia, [(0.0, lin('#3C8BFF')), (0.45, lin('#0F45C8')), (1.0, lin('#010614'))])
zyw = node('ShaderNodeBsdfPrincipled'); L.new(k_zyw, zyw.inputs['Base Color'])
zyw.inputs['Roughness'].default_value = 0.03; zyw.inputs['Coat Weight'].default_value = 1.0
zyw.inputs['Coat Roughness'].default_value = 0.0
L.new(k_zyw, zyw.inputs['Emission Color'])
L.new(M('MULTIPLY', zakres(glebia, 0.0, 0.9, 5.0, 0.2), M('POWER', prawo, 1.6)), zyw.inputs['Emission Strength'])  # po lewej nie świeci

# --- różowe złoto
zl = node('ShaderNodeBsdfPrincipled'); zl.inputs['Base Color'].default_value = lin('#DDA394')
zl.inputs['Metallic'].default_value = 1.0; zl.inputs['Roughness'].default_value = 0.17

m1 = node('ShaderNodeMixShader'); L.new(zywica, m1.inputs[0]); L.new(kam.outputs[0], m1.inputs[1]); L.new(zyw.outputs[0], m1.inputs[2])
m2 = node('ShaderNodeMixShader'); L.new(zloto, m2.inputs[0]); L.new(m1.outputs[0], m2.inputs[1]); L.new(zl.outputs[0], m2.inputs[2])
out = node('ShaderNodeOutputMaterial'); L.new(m2.outputs[0], out.inputs['Surface']); L.new(disp.outputs[0], out.inputs['Displacement'])
plyta.data.materials.append(m)

def lampa(nazwa, loc, rot, moc, rozm, kol):
    d = bpy.data.lights.new(nazwa, 'AREA'); d.energy = moc; d.size = rozm; d.color = kol[:3]
    o = bpy.data.objects.new(nazwa, d); o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]
    sc.collection.objects.link(o)
lampa('klucz', (-7, 6, 4.5), (-55, 0, 230), 2600, 5, lin('#AFC2E6'))     # niskie, boczne: wydobywa relief
lampa('kontra', (10, 3, 2.0), (75, 0, 105), 900, 2.0, lin('#FFD9C8'))
lampa('gora', (3, 1, 8), (0, 0, 0), 300, 4, lin('#8FA8D8'))

kd = bpy.data.cameras.new('kam'); kd.lens = 50; kd.dof.use_dof = True; kd.dof.aperture_fstop = 3.2
ko = bpy.data.objects.new('kam', kd); sc.collection.objects.link(ko); sc.camera = ko
ko.location = (0.6, -6.8, 6.6); ko.rotation_euler = (math.radians(45), 0, math.radians(2))
cel = bpy.data.objects.new('ostrosc', None); cel.location = (2.6, 0.4, 0); sc.collection.objects.link(cel)
kd.dof.focus_object = cel

bpy.ops.render.render(write_still=True)
print('ZAPISANO', OUT)
