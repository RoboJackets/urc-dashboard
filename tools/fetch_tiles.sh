#!/bin/bash
# Pre-cache OSM tiles for the URC competition area into public/static/map.
# Run BEFORE competition (no internet at MDRS). Usage: ./tools/fetch_tiles.sh [zoom_max]
#
# Competition area (rules 1.e.xiii): ~38.411N..38.425N, -110.786E..-110.768E
LAT_MIN=38.408; LAT_MAX=38.428
LON_MIN=-110.790; LON_MAX=-110.764
ZMIN=12; ZMAX=${1:-17}
OUT=public/static/map

deg2num() { # lat lon zoom -> x y  (python for math)
  python3 - "$1" "$2" "$3" <<'EOF'
import math, sys
lat, lon, z = map(float, sys.argv[1:4])
n = 2 ** int(z)
x = int((lon + 180.0) / 360.0 * n)
y = int((1.0 - math.log(math.tan(math.radians(lat)) + 1/math.cos(math.radians(lat))) / math.pi) / 2.0 * n)
print(x, y)
EOF
}

for z in $(seq $ZMIN $ZMAX); do
  read -r x_min y_max <<< "$(deg2num $LAT_MIN $LON_MIN $z)"
  read -r x_max y_min <<< "$(deg2num $LAT_MAX $LON_MAX $z)"
  for x in $(seq $x_min $x_max); do
    for y in $(seq $y_min $y_max); do
      f="$OUT/$z/$x/$y.png"
      [ -f "$f" ] && continue
      mkdir -p "$(dirname "$f")"
      curl -sf -A "urc-dashboard-tile-fetch" "https://tile.openstreetmap.org/$z/$x/$y.png" -o "$f" \
        || echo "miss $z/$x/$y"
      sleep 0.15  # be polite to the tile server
    done
  done
done
echo "done. tiles in $OUT"
