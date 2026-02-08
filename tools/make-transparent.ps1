# Make PNG background transparent using corner pixel color
Add-Type -AssemblyName System.Drawing

$path = Join-Path $PSScriptRoot "assets\spartan.png"
$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $path))

# Clone to 32bpp ARGB so we have alpha channel
$rect = [System.Drawing.Rectangle]::new(0, 0, $bmp.Width, $bmp.Height)
$out = $bmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background color = top-left pixel; use tolerance for similar shades
$bg = $bmp.GetPixel(0, 0)
$tolerance = 35

for ($y = 0; $y -lt $out.Height; $y++) {
    for ($x = 0; $x -lt $out.Width; $x++) {
        $c = $out.GetPixel($x, $y)
        $dr = [Math]::Abs($c.R - $bg.R)
        $dg = [Math]::Abs($c.G - $bg.G)
        $db = [Math]::Abs($c.B - $bg.B)
        if ($dr -le $tolerance -and $dg -le $tolerance -and $db -le $tolerance) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
        }
    }
}

$tempPath = [System.IO.Path]::GetTempFileName() + ".png"
$out.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
$bmp.Dispose()
Move-Item -Path $tempPath -Destination $path -Force
Write-Host "Done. Background set to transparent: $path"
