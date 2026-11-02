# Generates raw voice lines with Windows text-to-speech.
# Output: audio-src/raw/<id>.wav (22.05 kHz, 16-bit, mono)
Add-Type -AssemblyName System.Speech

$out = Join-Path $PSScriptRoot "..\audio-src\raw"
New-Item -ItemType Directory -Force $out | Out-Null

# id, voice, rate (-10..10), text
$lines = @(
  @("n1", "Microsoft Zira Desktop", -2, "Lumi looked up at the moon... and noticed something strange."),
  @("l1", "Microsoft Zira Desktop", -1, "Oh no! One little star is missing!"),
  @("l2", "Microsoft Zira Desktop", -1, "I think I know where it went!"),
  @("b1", "Microsoft David Desktop", -3, "Lumi! Look!"),
  @("b2", "Microsoft David Desktop", -3, "Together!"),
  @("l3", "Microsoft Zira Desktop", -2, "You don't have to be big... to make a difference."),
  @("n2", "Microsoft Zira Desktop", -2, "And from that night on... Lumi always looked up.")
)

$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($l in $lines) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SelectVoice($l[1])
  $s.Rate = $l[2]
  $s.SetOutputToWaveFile((Join-Path $out "$($l[0]).wav"), $fmt)
  $s.Speak($l[3])
  $s.Dispose()
}
"done"
