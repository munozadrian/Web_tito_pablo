import re
import os

html_path = '/Users/adrianmunoz/Desktop/Antigravity/Web_tito_pablo/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Manual mapping based on what we see in grep
mapping = {
    "Crónicas_de_Lain_final_sin letras.jpg": "cronicas_de_lain_final_sin_letras.jpg",
    "logo camiseta montse.jpg": "logo_camiseta_montse.jpg",
    "La batalla de Hërdrag -v2.jpg": "la_batalla_de_herdrag_-v2.jpg",
    "portada con nombre.png": "portada_con_nombre.png",
    "Cronicas-de-Lahn.png": "cronicas-de-lahn.png",
    "Crónicas_de_Lain_final_sin letras_recortado.jpg": "cronicas_de_lain_final_sin_letras_recortado.jpg",
    "LAHN .jpg": "lahn_.jpg",
    "2libro_18.jpg": "2libro_18.jpg",
    "ilustracion para el libro.jpg": "ilustracion_para_el_libro.jpg"
}

for old, new in mapping.items():
    html = html.replace(f'Imagenes/{old}', f'Imagenes/{new}')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML updated.")
