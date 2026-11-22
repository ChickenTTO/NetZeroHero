"""Generate local art textures from Natural Earth's public-domain land polygons.

Usage: python scripts/generate-globe-textures.py path/to/ne_110m_land.geojson
Requires Pillow. Runtime rendering never requests third-party assets.
"""
from pathlib import Path
import json
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

width, height = 2048, 1024
mask = Image.new('L', (width, height), 0)
draw = ImageDraw.Draw(mask)
data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
for feature in data['features']:
    geometry = feature['geometry']
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    for polygon in polygons:
        for index, ring in enumerate(polygon):
            points = [((lon + 180) / 360 * width, (90 - lat) / 180 * height) for lon, lat, *_ in ring]
            draw.polygon(points, fill=255 if index == 0 else 0)

mask = mask.filter(ImageFilter.GaussianBlur(.45))
ocean = Image.new('RGB', mask.size, '#183e35')
land = Image.new('RGB', mask.size, '#a9c5ad')
surface = Image.composite(land, ocean, mask).convert('RGBA')
grid = Image.new('RGBA', mask.size)
lines = ImageDraw.Draw(grid)
for x in range(0, width, 8):
    for y in range(0, height, 8):
        if mask.getpixel((x, y)) > 190:
            lines.ellipse((x, y, x+1.1, y+1.1), fill=(49, 98, 69, 28))
for index in range(1, 24):
    x = width * index / 24
    lines.line((x, 0, x, height), fill=(209, 235, 209, 18), width=1)
for index in range(1, 12):
    y = height * index / 12
    lines.line((0, y, width, y), fill=(209, 235, 209, 18), width=1)
surface = Image.alpha_composite(surface, grid).convert('RGB')
coast = ImageChops.subtract(mask.filter(ImageFilter.MaxFilter(3)), mask)
surface = Image.composite(Image.new('RGB', mask.size, '#accfb0'), surface, coast)
bump = mask.filter(ImageFilter.GaussianBlur(1.2))
roughness = Image.composite(Image.new('L', mask.size, 190), Image.new('L', mask.size, 100), mask)
output = Path(__file__).resolve().parents[1] / 'src/assets/globe'
output.mkdir(parents=True, exist_ok=True)
surface.save(output / 'surface.webp', quality=86, method=6)
bump.resize((1024, 512), Image.Resampling.LANCZOS).save(output / 'relief.webp', quality=88, method=6)
roughness.resize((512, 256), Image.Resampling.LANCZOS).save(output / 'roughness.webp', quality=80, method=6)
for path in output.glob('*.webp'):
    print(f'{path.name}: {path.stat().st_size:,} bytes')
