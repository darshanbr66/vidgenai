# Installs Lumi Studio's voice engine. Run once; it is safe to run again.
$ErrorActionPreference = 'Stop'
$engine = Join-Path $PSScriptRoot 'engine'
$model = Join-Path $engine 'model'
$venv = Join-Path $engine 'venv'
New-Item -ItemType Directory -Force $model | Out-Null

if (-not (Test-Path "$venv\Scripts\python.exe")) { & py -3.12 -m venv $venv }
& "$venv\Scripts\python.exe" -m pip install --quiet --disable-pip-version-check kokoro-onnx soundfile numpy scipy pillow

$base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0'
foreach ($file in 'kokoro-v1.0.onnx', 'voices-v1.0.bin') {
  $target = Join-Path $model $file
  if (-not (Test-Path $target)) {
    Write-Host "Downloading $file..."
    Invoke-WebRequest "$base/$file" -OutFile "$target.part"
    Move-Item "$target.part" $target
  }
}
Write-Host 'Voice engine is ready.'
