Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("public/icon/128.png")
$newImg = new-object System.Drawing.Bitmap(96, 96)
$g = [System.Drawing.Graphics]::FromImage($newImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 96, 96)
$newImg.Save("public/icon/96.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$img.Dispose()
$newImg.Dispose()
