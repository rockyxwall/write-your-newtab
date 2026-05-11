Add-Type -AssemblyName System.Drawing

$sourcePath = "public/icon/example/128.png"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found at $sourcePath"
    exit
}

function Create-BrandIcon {
    param (
        [int]$size,
        [string]$outputPath
    )

    # Load source into memory to avoid file locking
    $srcStream = New-Object System.IO.FileStream($sourcePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
    $srcImg = [System.Drawing.Image]::FromStream($srcStream)
    $srcStream.Close()
    $srcStream.Dispose()

    $newImg = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($newImg)
    
    # Setup high quality resizing
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Draw resized image
    $g.DrawImage($srcImg, 0, 0, $size, $size)
    
    # Convert all non-transparent pixels to black
    for ($x = 0; $x -lt $newImg.Width; $x++) {
        for ($y = 0; $y -lt $newImg.Height; $y++) {
            $pixel = $newImg.GetPixel($x, $y)
            if ($pixel.A -gt 0) {
                # Preserve original alpha but force color to black
                $newColor = [System.Drawing.Color]::FromArgb($pixel.A, 0, 0, 0)
                $newImg.SetPixel($x, $y, $newColor)
            }
        }
    }
    
    # Dispose source before saving to avoid lock if outputPath == sourcePath
    $srcImg.Dispose()

    $newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $newImg.Dispose()
    Write-Host "Generated: $outputPath ($size x $size)"
}

$sizes = @(16, 32, 48, 96, 128)

foreach ($size in $sizes) {
    Create-BrandIcon -size $size -outputPath "public/icon/$size.png"
}
