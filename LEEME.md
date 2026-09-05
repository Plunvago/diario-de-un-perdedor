# El hombre que aprendió a ser mirado — sitio

**Una sola página** con scroll continuo. Estática, sin build.

## Cómo verlo

```bash
cd sitio-libro
npx serve .
```

Abrir la dirección que muestre (ej. `http://localhost:3000`). No sirve abrir el
archivo con doble clic (`file://`): usar siempre un servidor.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Toda la página: Inicio, El libro (3 partes + 3 relatos), El autor, En papel. |
| `style.css` | Estilos. Paleta y acentos documentados al inicio. |
| `app.js` | Motion: GSAP revela el contenido al hacer scroll, parallax de las fotos, Ken Burns del hero, firma dibujándose. Sin motion si `prefers-reduced-motion`. |
| `vendor/` | GSAP y ScrollTrigger, incluidos (no dependen de internet). No borrar. |
| `assets/` | Imágenes. |

## Diseño

- **Cabecera**: marca en dos niveles (nombre + título del libro en cursiva
  dorada) con una inicial "J" en un sello circular, y navegación en Playfair
  itálica con subrayado que crece al pasar el mouse o al estar activa.
- **Firma animada**: `assets/firma.svg` (trazado de potrace, formas rellenas,
  limpiado de metadatos) se carga con `fetch` en `app.js` y se inyecta dentro de
  la foto del Inicio. El SVG son contornos rellenos, no trazos de pluma, así que
  no se "dibuja" un stroke: al cargar la página GSAP anima una **máscara CSS**
  (un degradado de borde suave que barre de izquierda a derecha, el sentido
  natural de la escritura) sobre `.hero__signature`, variando `--r` de 0 a 1 en
  ~2,2 s. Al terminar, la máscara se retira. Con movimiento reducido aparece ya
  escrita, sin barrido. Tinta oscura con un halo claro para que se lea sobre
  zonas claras y oscuras de la foto. Posición y tamaño en `.hero__signature` en
  `style.css`.
- **Relato visual**: la página no es una lista de secciones, es un recorrido.
  Inicio y cada uno de los tres Libros son una "escena": foto dramática en
  duotono + numeral + título enorme en mayúsculas que se solapa con el borde de
  la foto, y debajo el texto sobre fondo crema. El color del duotono seduce el
  arco del libro: más apagado y frío en la Revelación (Libro I), dorado medio en
  El otro (Libro II), cobre vívido y cálido en El fruto (Libro III). Se define en
  `style.css` con `--duo-a` / `--duo-b` por escena (`.duo--revelacion`,
  `.duo--encuentro`, `.duo--fruto`, `.duo--hero`).
- **Fondo claro y luminoso** (crema cálida `#f7f0e1`) en el resto de la página,
  porque el libro trata sobre la luz. Texto marrón oscuro. Dos acentos:
  - **Dorado ocre `#a9741a`** = la luz. Filetes, subrayados de enlace, ancla activa.
  - **Verde musgo `#63602f`** = la cordillera. Acento reservado.
- **Franja de la casa de barro**: bajo el Inicio, una tira de 12 fotos a todo el
  ancho (`.filmstrip`, 6 columnas en escritorio, 3 en móvil). Las 6 primeras:
  `montana-3/2/6/1/7/4`. Las 6 nuevas: `nieve-domo`, `valle`, `rincon-estufa`,
  `nieve-cerco`, `burro`, `cama` (con `onerror` a fotos de montaña mientras no
  existan los archivos).
- **"Sobre el autor"**: layout a dos columnas. Foto de Jorge sobre la roca
  (`assets/cordillera.jpg`) con el borde difuminado en los cuatro cantos (sin
  marco duro ni sombra) y corrección de color G2 (`.fig--g2`: menos saturación +
  algo de calidez para integrar el cielo azul). Detrás, `assets/autor-fondo.jpg`
  como fondo traslúcido (opacidad ~0.38) con tinte duotono musgo→dorado y
  fundido a crema arriba y abajo.
- **Fotos de la montaña**: "En papel" usa `montana-6` como fondo traslúcido
  (~0.12). En Inicio y en cada Libro las fotos son la imagen dramática de la
  escena (duotono, a página ancha).
- El retrato de Inicio es a página completa por diseño (referencia Xenith:
  retrato + capa de color + tipografía audaz), igual que la foto de cada Libro.
- Tipografía Playfair Display + Lora (Google Fonts; sin conexión cae a serif del
  sistema). Los títulos de escena usan Playfair 800, mayúsculas.

Contacto: `realismoluminico@gmail.com`. Amazon: `amazon.com/dp/B0HDJPJHCG`.

## Qué falta antes de publicar

1. Al publicar en un dominio, pasar `og:image` a URL absoluta.
