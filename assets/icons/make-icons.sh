# MacOS: https://stackoverflow.com/a/20703594

for prefix in app installer; do
    iconset="$prefix"-icon.iconset
    input_img="$prefix"-icon-1024.png

    mkdir "$iconset"

    sips -z 16 16     "$input_img" --out "$iconset"/icon_16x16.png
    sips -z 32 32     "$input_img" --out "$iconset"/icon_16x16@2x.png
    sips -z 32 32     "$input_img" --out "$iconset"/icon_32x32.png
    sips -z 64 64     "$input_img" --out "$iconset"/icon_32x32@2x.png
    sips -z 128 128   "$input_img" --out "$iconset"/icon_128x128.png
    sips -z 256 256   "$input_img" --out "$iconset"/icon_128x128@2x.png
    sips -z 256 256   "$input_img" --out "$iconset"/icon_256x256.png
    sips -z 512 512   "$input_img" --out "$iconset"/icon_256x256@2x.png
    sips -z 512 512   "$input_img" --out "$iconset"/icon_512x512.png
    cp "$input_img" "$iconset"/icon_512x512@2x.png

    iconutil -c icns "$iconset"
    rm -R "$iconset"
done


# Windows: https://superuser.com/a/1012535 

magick app-icon-1024.png -define icon:auto-resize=256,128,48,32,16 app-icon.ico
magick installer-icon-1024.png -define icon:auto-resize=256,128,48,32,16 installer-icon.ico


# Linux:

magick app-icon-1024.png -resize 512x512 app-icon-512.png
magick installer-icon-1024.png -resize 512x512 installer-icon-512.png
