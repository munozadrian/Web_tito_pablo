import os
import re

html_path = '/Users/adrianmunoz/Desktop/Antigravity/Web_tito_pablo/index.html'
img_dir = '/Users/adrianmunoz/Desktop/Antigravity/Web_tito_pablo/Imagenes'

# Read HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

def make_safe(name):
    # Remove accents
    name = name.replace('ó', 'o').replace('ó', 'o') # Handle both NFC and NFD
    name = name.replace('ë', 'e').replace('ë', 'e')
    # Lowercase
    name = name.lower()
    # Replace spaces with underscores
    name = re.sub(r'\s+', '_', name)
    # Remove other weird chars
    name = re.sub(r'[^a-z0-9_\-\.]', '', name)
    return name

files = os.listdir(img_dir)

for filename in files:
    if filename == '.DS_Store': continue
    
    safe_name = make_safe(filename)
    
    # Rename file
    old_path = os.path.join(img_dir, filename)
    new_path = os.path.join(img_dir, safe_name)
    if old_path != new_path:
        os.rename(old_path, new_path)
        print(f"Renamed: '{filename}' -> '{safe_name}'")
    
    # Replace in HTML (we need to be careful with exact matches, but since we are just replacing the filename part)
    # We will find "Imagenes/{original}" and replace with "Imagenes/{safe_name}"
    # Wait, the HTML might not perfectly match the filesystem filename due to NFD/NFC or missing space.
    # Let's do a more robust replace.
    # We will search for all <img src="Imagenes/... "> in HTML and map them.

