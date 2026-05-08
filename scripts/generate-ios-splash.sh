#!/usr/bin/env sh
set -eu

# Generates favicons, Apple touch icons, PWA PNG icons, and iOS splash screens.
# Requires: rsvg-convert (librsvg) and ImageMagick (`magick`).

SRC="public/pwa-512x512.svg"
BG="#020617"
ICON_1024="/tmp/score-icon-1024.png"
SPLASH_LOGO="/tmp/score-ios-splash-logo.png"
SPLASH_LINKS="public/splash/ios-splash-links.html"

command -v rsvg-convert >/dev/null 2>&1 || {
  printf '%s\n' "Missing dependency: rsvg-convert" >&2
  exit 1
}

command -v magick >/dev/null 2>&1 || {
  printf '%s\n' "Missing dependency: magick" >&2
  exit 1
}

mkdir -p public/splash

# Render the source SVG once with librsvg. This preserves SVG text better than sharp in some environments.
rsvg-convert -w 1024 -h 1024 "$SRC" -o "$ICON_1024"

# Favicons.
magick "$ICON_1024" -resize 16x16 public/favicon-16x16.png
magick "$ICON_1024" -resize 32x32 public/favicon-32x32.png

# Apple touch icons.
magick "$ICON_1024" -resize 180x180 public/apple-touch-icon.png
magick "$ICON_1024" -resize 167x167 public/apple-touch-icon-167.png
magick "$ICON_1024" -resize 152x152 public/apple-touch-icon-152.png
magick "$ICON_1024" -resize 120x120 public/apple-touch-icon-120.png

# PWA manifest icons.
magick "$ICON_1024" -resize 192x192 public/icon-192.png
magick "$ICON_1024" -resize 512x512 public/icon-512.png

# Splash logo used on iOS startup images.
magick "$ICON_1024" -resize 512x512 "$SPLASH_LOGO"
: > "$SPLASH_LINKS"

gen() {
  size="$1"
  dpr="$2"
  width="${size%x*}"
  height="${size#*x}"
  name="ios-$size.png"
  orientation="portrait"

  if [ "$width" -gt "$height" ]; then
    orientation="landscape"
    css_width=$((height / dpr))
    css_height=$((width / dpr))
  else
    css_width=$((width / dpr))
    css_height=$((height / dpr))
  fi

  magick "$SPLASH_LOGO" -background "$BG" -gravity center -extent "$size" "public/splash/$name"
  printf '<link rel="apple-touch-startup-image" href="/splash/%s" media="(device-width: %spx) and (device-height: %spx) and (-webkit-device-pixel-ratio: %s) and (orientation: %s)" />\n' \
    "$name" "$css_width" "$css_height" "$dpr" "$orientation" >> "$SPLASH_LINKS"
}

# iPhone.
gen 1290x2796 3
gen 2796x1290 3
gen 1179x2556 3
gen 2556x1179 3
gen 1284x2778 3
gen 2778x1284 3
gen 1170x2532 3
gen 2532x1170 3
gen 1125x2436 3
gen 2436x1125 3
gen 1242x2688 3
gen 2688x1242 3
gen 828x1792 2
gen 1792x828 2
gen 1242x2208 3
gen 2208x1242 3
gen 750x1334 2
gen 1334x750 2
gen 640x1136 2
gen 1136x640 2

# iPad.
gen 2048x2732 2
gen 2732x2048 2
gen 1668x2388 2
gen 2388x1668 2
gen 1640x2360 2
gen 2360x1640 2
gen 1536x2048 2
gen 2048x1536 2

printf '%s\n' "Generated favicon, PWA icons, Apple touch icons, and iOS splash screens."
