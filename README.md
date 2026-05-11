# Poncio Landing Premium

Landing page estática lista para ejecutar en navegador o deployar en Vercel/Netlify como sitio estático.

## Estructura

```text
poncio-landing-premium/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   ├── img/
│   │   ├── logo-poncio.png
│   │   ├── favicon.png
│   │   ├── hero-poster.webp
│   │   └── team/*.webp
│   └── video/
│       ├── poncio-office-horizontal.mp4
│       └── poncio-office-vertical.mp4
└── README.md
```

## Cómo ejecutar

Opción directa: abrir `index.html` en el navegador.

Opción recomendada para validar videos, rutas y responsive:

```bash
cd poncio-landing-premium
python3 -m http.server 8080
```

Luego abrir `http://localhost:8080`.

## Incluye

- Landing single-page con 10 bloques del brief: navbar, hero, métricas, about, servicios, proceso, por qué Poncio, valores, equipo, contacto y footer.
- Logo real recibido y fotos del equipo optimizadas a WebP.
- Videos corporativos transcodificados a H.264 para mayor compatibilidad web.
- Animaciones integradas: reveal on scroll, contadores, línea de proceso, hover/tilt, botones magnéticos, barra de progreso, navegación mobile.
- CTA principal a WhatsApp y FAB fijo en mobile.
- Estilos organizados en CSS con variables de marca exactas.
- JavaScript sin dependencias externas.

## Pendientes externos

- Confirmar métricas finales antes del lanzamiento si Martín corrige los valores.
- Reemplazar o confirmar URLs oficiales de redes sociales si el cliente prefiere perfiles nuevos.
- Incorporar logo vertical del footer si el cliente lo entrega como archivo separado.
