# Rendery RTX (Image de synthèse)

Wszystkie pliki w tym katalogu to **obrazy wygenerowane lokalnie na RTX 5080 Daniela (ComfyUI)**. Na stronie każdy musi mieć
plakietkę „Image de synthèse”. To nie są zdjęcia prawdziwego gabinetu ani prawdziwych urządzeń; bez ludzi, bez logo, bez napisów.
Nigdy jako „przed i po”. Po otwarciu gabinetu zastąpić prawdziwymi zdjęciami.

## Modele i licencje

| Model | Do czego | Licencja | Źródło |
|---|---|---|---|
| Z-Image Turbo (Tongyi-MAI), bf16 + Qwen3-4B + VAE `ae` | wszystkie wybrane kadry | Apache-2.0 | huggingface.co/Comfy-Org/z_image_turbo |
| FLUX.1 [schnell] fp8 (Black Forest Labs) | tylko porównanie, żaden kadr nie wybrany | Apache-2.0 | huggingface.co/Comfy-Org/flux1-schnell |
| Wan 2.2 TI2V 5B + UMT5-XXL fp8 + Wan 2.2 VAE (Alibaba) | wideo image-to-video | Apache-2.0 | huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged |

Ustawienia Z-Image: 9 kroków, cfg 1, sampler res_multistep / simple, shift 3 (ModelSamplingAuraFlow), 1536×1024 lub 1024×1536.
Workflow JSON (API ComfyUI) dla każdego kadru: `D:\CLAUDE CODE\evolution-body-lab\rtx\workflow\<nazwa>.json` (poza repo).
Kadry `ems-*` mają drobny retusz (cv2.inpaint): usunięte mikro-metki z pseudo-napisami na kołnierzu kombinezonu i na ramce panelu.

## Pliki

| Plik | Scena | Rozmiar | Seed | Kadr źródłowy |
|---|---|---|---|---|
| `ems-1.webp` | a) stacja EMS | 1536×1024, WebP q85, 68 KB | 302 | `a_ems_v2_poz_z2` |
| `ems-2.webp` | a) stacja EMS | 1536×1024, WebP q85, 78 KB | 304 | `a_ems_v2_poz_z4` |
| `ems-pion-1.webp` | a) stacja EMS | 1000×1500, WebP q85, 66 KB | 402 | `a_ems_v2_pion_z2` |
| `ems-pion-2.webp` | a) stacja EMS | 1000×1500, WebP q85, 75 KB | 401 | `a_ems_v2_pion_z1` |
| `krio-1.webp` | b) kriolipoliza | 1536×1024, WebP q85, 54 KB | 302 | `b_krio_v2_poz_z2` |
| `krio-2.webp` | b) kriolipoliza | 1536×1024, WebP q85, 53 KB | 301 | `b_krio_v2_poz_z1` |
| `krio-pion-1.webp` | b) kriolipoliza | 1000×1500, WebP q85, 42 KB | 402 | `b_krio_v2_pion_z2` |
| `krio-pion-2.webp` | b) kriolipoliza | 1000×1500, WebP q85, 47 KB | 401 | `b_krio_v2_pion_z1` |
| `kabina-1.webp` | c) kabina zabiegowa | 1536×1024, WebP q85, 116 KB | 41 | `c_kabina_poz_z4` |
| `kabina-2.webp` | c) kabina zabiegowa | 1536×1024, WebP q85, 113 KB | 11 | `c_kabina_poz_z1` |
| `kabina-pion-1.webp` | c) kabina zabiegowa | 1000×1500, WebP q85, 102 KB | 101 | `c_kabina_pion_z1` |
| `kabina-pion-2.webp` | c) kabina zabiegowa | 1000×1500, WebP q85, 96 KB | 202 | `c_kabina_pion_z2` |
| `recepcja-1.webp` | d) recepcja (puste miejsce na logo) | 1536×1024, WebP q85, 83 KB | 23 | `d_recepcja_poz_z2` |
| `recepcja-2.webp` | d) recepcja (puste miejsce na logo) | 1536×1024, WebP q85, 70 KB | 37 | `d_recepcja_poz_z3` |
| `makro-panel.webp` | e) detale makro | 1536×1024, WebP q85, 66 KB | 502 | `e_makro_v3_poz_z2` |
| `makro-szron.webp` | e) detale makro | 1536×1024, WebP q85, 97 KB | 502 | `e_lod_v3_poz_z2` |
| `kabina-swiatlo.mp4 (+ kabina-swiatlo-plakat.webp)` | wideo: kabina, firanka i światło (pętla 3,4 s) | 1280×704, H.264, 24 kl./s, bez dźwięku, 568 KB (plakat 69 KB) | 2027 | `c_kabina_poz_z4` |
| `krio-mgla.mp4 (+ krio-mgla-plakat.webp)` | wideo: kriolipoliza, zimna mgiełka i oddychające światło (pętla 3,4 s) | 1280×704, H.264, 24 kl./s, bez dźwięku, 174 KB (plakat 24 KB) | 3031 | `b_krio_v2_poz_z2` |

## Prompty (Z-Image, seed w tabeli wyżej)

**ems-1.webp, ems-2.webp, ems-pion-1.webp, ems-pion-2.webp**

> Close product photograph of a premium electrical muscle stimulation training device for a luxury body studio: a sleek matte black control unit with a blank black glass touchscreen and three knurled gold dials, on a slender brushed gold column stand, beside it a black sleeveless training suit vest with rose gold electrode pads hanging on a slim gold valet stand, black cables gently curved, polished black marble floor with reflections, one red rose lying on the marble. 85mm lens, dramatic low-key studio lighting, warm golden rim light, soft volumetric haze, deep black background, luxury editorial product photography, photorealistic, ultra detailed materials, shallow depth of field, completely unbranded, plain surfaces without any text, letters, numbers, icons or logos, no people

**krio-1.webp, krio-2.webp, krio-pion-1.webp, krio-pion-2.webp**

> Close product photograph of a premium body contouring cooling device for a luxury body studio: an elegant tall matte black sculpted tower with a blank black glass touchscreen, thin rose gold edge lines, two smooth white ceramic and rose gold cup-shaped applicator handpieces with frosted cold surfaces and coiled black hoses in side holders, faint cold frost vapour drifting downward from the applicators, polished black marble floor. 70mm lens, dramatic low-key studio lighting, warm golden rim light, soft volumetric haze, deep black background, luxury editorial product photography, photorealistic, ultra detailed materials, shallow depth of field, completely unbranded, plain surfaces without any text, letters, numbers, icons or logos, no people

**kabina-1.webp, kabina-2.webp, kabina-pion-1.webp, kabina-pion-2.webp**

> Wide interior photograph of an empty luxury aesthetic treatment room in Nice, French Riviera: a padded black leather treatment bed on a brushed gold base in the center, walls clad in black Nero Marquina marble with white veining, brushed gold trim and details, a large round mirror with a thin gold frame, a vase of fresh red roses on a black marble side table, warm indirect cove lighting, sheer linen curtain with soft Mediterranean daylight, folded white towels. Architectural interior photography, 24mm lens, luxury studio, matte black surfaces, polished 24k gold and rose gold accents, warm soft diffused light, high-end commercial photography, photorealistic, sharp focus, shallow depth of field, natural reflections, no people, no text, no letters, no logos, no labels

**recepcja-1.webp, recepcja-2.webp**

> Wide interior photograph of the empty reception and entrance of a luxury boutique body care studio in Nice: a curved reception desk in black marble with a thin gold inlay line, behind it a large plain blank matte black wall panel framed in brushed gold, completely empty, reserved for a logo, warm cove lighting, black marble floor, a tall vase of red roses on the desk, two velvet armchairs in deep black, soft daylight from a glass door. Architectural interior photography, 28mm lens, luxury studio, matte black surfaces, polished 24k gold and rose gold accents, warm soft diffused light, high-end commercial photography, photorealistic, sharp focus, shallow depth of field, natural reflections, no people, no text, no letters, no logos, no labels

**makro-panel.webp**

> Extreme macro photograph of the corner of a premium matte black aesthetic device: a knurled brushed 24k gold rotary dial, two polished black glass buttons without symbols, the edge of a deep black glass screen with a thin glowing rose gold light line, chamfered rose gold edge, tiny water droplets and delicate white frost crystals on the cold metal. 100mm macro lens, dramatic low-key lighting, warm golden rim light, deep black background, luxury editorial macro photography, photorealistic, ultra detailed, very shallow depth of field, completely unbranded, no text, no letters, no numbers, no icons, no logos, no people

**makro-szron.webp**

> Abstract macro photograph of a smooth rose gold metal cooling plate covered with delicate white frost and fine ice crystals, a few clear water droplets, thin wisps of cold vapour sinking along the surface, black glossy surface below reflecting warm gold light. 100mm macro lens, dramatic low-key lighting, warm golden rim light, deep black background, luxury editorial macro photography, photorealistic, ultra detailed, very shallow depth of field, completely unbranded, no text, no letters, no numbers, no icons, no logos, no people

## Wideo (Wan 2.2 TI2V 5B, 1280×704, 97 klatek 24 kl./s, 24 kroki, cfg 5, uni_pc)

**kabina-swiatlo.mp4 (+ kabina-swiatlo-plakat.webp)**

> Static locked-off camera, empty luxury treatment room with black marble walls, a black leather treatment bed on a gold base and red roses. The sheer white linen curtain sways very gently in a soft breeze, warm sunlight slowly shifts across the marble floor and the gold details glint softly. Slow, calm, serene, cinematic, photorealistic.

**krio-mgla.mp4 (+ krio-mgla-plakat.webp)**

> Static locked-off camera, still life product shot. The black device stays perfectly still and unchanged. Only a thin faint wisp of white cold vapour near the left applicator slowly drifts and dissolves close to the floor, and the warm golden backlight behind the device slowly breathes softly brighter and dimmer. Subtle reflections on the black marble. Minimal, slow, elegant motion, photorealistic.

## Mapa głębi

`img/glebia/monika-rys-glebia.webp`: mapa głębi rysunku Moniki (`img/monika-rys.webp`, plik Daniela), liczona
funkcjami `narzedzia/glebia_rtx.py` (Depth Anything V2 Large, RTX), poza kanałem alfa = 0, 1024×1536.
