# Render sceny „Łupek z żywicą” na RTX Daniela i wysyłka obrazu do repo.
# Uruchom w PowerShell:  powershell -ExecutionPolicy Bypass -File .\render_rtx.ps1
# Wymaga: git (zalogowany do GitHuba), Blender 4.2+ (skrypt doinstaluje przez winget, jeśli brak).
param(
  [string]$Repo   = "D:\CLAUDE CODE\evolution-body-lab-strona",
  [string]$Galaz  = "dekorator-palety-2",
  [int]$Szer = 2400, [int]$Wys = 1350, [int]$Probki = 512, [int]$Siatka = 1600
)
$ErrorActionPreference = "Stop"

# 1. Repo: pobierz albo zaktualizuj
if (-not (Test-Path "$Repo\.git")) {
  git clone https://github.com/DANIEL240989/evolution-body-lab-strona $Repo
}
git -C $Repo fetch origin $Galaz
git -C $Repo checkout $Galaz
git -C $Repo pull --ff-only origin $Galaz

# 2. Blender: znajdź najnowszy, w razie braku zainstaluj
$blender = Get-ChildItem "C:\Program Files\Blender Foundation\*\blender.exe" -ErrorAction SilentlyContinue |
  Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
if (-not $blender) {
  winget install --id BlenderFoundation.Blender -e --accept-source-agreements --accept-package-agreements
  $blender = Get-ChildItem "C:\Program Files\Blender Foundation\*\blender.exe" |
    Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
}
Write-Host "Blender: $blender"
nvidia-smi --query-gpu=name,memory.total --format=csv

# 3. Render: komputer 16:9 i telefon 9:16
$scena = "$Repo\narzedzia\blender\lupek_scena.py"
$wyj   = "$Repo\img\materialy"
New-Item -ItemType Directory -Force $wyj | Out-Null
$czas = Measure-Command {
  & $blender -b -P $scena -- $Szer $Wys $Probki "$wyj\lupek-3d-pc.png" GPU $Siatka
  & $blender -b -P $scena -- 1080 1920 $Probki "$wyj\lupek-3d-tel.png" GPU $Siatka
}
Write-Host ("Czas renderu: {0:N1} min" -f $czas.TotalMinutes)

# 4. Wyślij obrazy do repo (Claude je stamtąd weźmie i wepnie)
git -C $Repo add "img/materialy/lupek-3d-pc.png" "img/materialy/lupek-3d-tel.png"
git -C $Repo commit -m "Render RTX: łupek z żywicą i różowym złotem ($Szer x $Wys, $Probki próbek)"
git -C $Repo push origin $Galaz
Write-Host "Gotowe. Napisz Claude: render wysłany."
