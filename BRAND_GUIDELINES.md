# Brand Guidelines · Clínica Miró

> Documento maestro de identidad visual y verbal.
> Este archivo es la **fuente única de verdad** para colores, tipografía, componentes y voz del ecosistema Clínica Miró + HUMANA.AI.
>
> **Versión:** 1.0 · Junio 2026
> **Mantenedor:** Dr. Carlos Montoya · Director Clínico
> **Alcance:** clinicamiro.cl · miro-dx-console · HUMANA.AI (9 apps) · materiales impresos · redes

---

## 0. Filosofía

> **"Ladran, Sancho. Señal que cabalgamos."**

Clínica Miró es una marca clínica **premium pero accesible**, sustentada en **30+ años de experiencia clínica** y un ecosistema propietario de IA odontológica. La identidad visual debe transmitir:

- **Solidez clínica** (no parecemos startup ligera)
- **Sofisticación técnica** (somos tecnología real, no marketing dental)
- **Confianza humana** (al final hay un doctor mirándote a los ojos)
- **Evidencia, no opinión** (todo nuestro tono refleja esto)

Si una decisión de diseño no refuerza al menos uno de estos cuatro pilares, no va.

---

## 1. Color

### 1.1 Paleta primaria (uso libre, brand-safe)

| Token | HEX | Uso |
|---|---|---|
| `--ink-darkest` | `#090B0B` | Headlines, títulos grandes, texto principal sobre fondo claro |
| `--ink-dark` | `#1C2121` | Body text sobre fondo claro |
| `--paper` | `#FFFFFF` | Fondo primario |
| `--paper-alt` | `#F5F5F5` | Fondo alterno (secciones), cards |
| `--bronze` | `#D3A436` | **Acento único.** CTAs, outlines, separadores, iconos. **NUNCA en texto largo.** |

### 1.2 Paleta extendida (uso técnico, documentada)

Estos colores son **derivaciones controladas** de la paleta primaria. Cada uno tiene un caso de uso específico. No se inventan nuevos.

#### Negros expresivos (hero, dark sections)

| Token | HEX | Uso |
|---|---|---|
| `--ink-true` | `#000000` | Solo body background del landing (fondo absoluto) |
| `--ink-warmer-1` | `#020201` | Centro de gradientes radiales sobre fondo oscuro |
| `--ink-warmer-2` | `#0A0805` | Anillos exteriores de gradientes |
| `--ink-warmer-3` | `#0A0D0D` | Cards sobre fondo oscuro |
| `--ink-warmer-4` | `#101414` | Inputs sobre fondo oscuro |
| `--bronze-shadow` | `#1A1208` | Gradient shadow del logo Miró (canvas) |
| `--bronze-deep` | `#3A2810` | Gradient core cálido bajo el logo |

#### Texto sobre fondo oscuro (no usar blanco puro nunca)

| Token | HEX | Uso |
|---|---|---|
| `--ash-100` | `#E8E6E0` | Headlines sobre dark — blanco "quemado", nunca `#FFFFFF` |
| `--ash-200` | `#D9D6CE` | Subhead sobre dark |
| `--ash-300` | `#C9C6BE` | Body sobre dark |
| `--ash-400` | `#9A9790` | Captions, metadata sobre dark |
| `--ash-500` | `#6A6F6F` | Disabled, hint, separadores sobre dark |

> **Por qué no blanco puro sobre negro:** `#FFFFFF` sobre `#000` genera vibración óptica y se ve "barato" en pantallas modernas. Usamos siempre `#E8E6E0` para hero text — se ve premium, calmo, editorial.

#### Bronce — variantes (solo para sombras y glows del logo)

| Token | HEX | Uso |
|---|---|---|
| `--bronze-dark` | `#B5891C` | Versión oscura del bronce (hover de outlines, bordes secundarios) |
| `--bronze-bright` | `#E8C065` | Highlight del logo Miró (pasada superior con glow) |

#### Colores funcionales (alertas, estados clínicos)

| Token | HEX | Uso |
|---|---|---|
| `--ok` | `#00E5A0` | Confianza alta, estados OK, hallazgos sin patología |
| `--warn` | `#FFA500` | Confianza media, "a evaluar", precaución clínica |
| `--alert` | `#FF6B35` | Hallazgos críticos (uso muy restringido) |

#### Brand externos (no son de Miró, son marcas terceras)

| HEX | Uso |
|---|---|
| `#25D366` | WhatsApp (FAB y CTAs WhatsApp **solamente**) |

> **Importante:** los colores de Mac terminal traffic-lights (`#FF5F56` rojo, `#FFBD2E` ámbar, `#27C93F` verde) **solo** pueden aparecer dentro de un componente "terminal-style" (ej: la consola MIRO.DX). Nunca en landing ni materiales clínicos.

### 1.3 Reglas de oro del color

✅ **HACER:**
- El bronce `#D3A436` es **el único acento**. Si necesitas otro "acento", probablemente no lo necesitas.
- Headlines siempre en `#090B0B` sobre fondo claro o `#E8E6E0` sobre fondo oscuro.
- Para "gris" siempre usar tokens (`--ink-dark` para texto, `--ash-XXX` para dark mode). Nunca `#888`, `#666`, etc.
- Bronce sobre fondo oscuro: subir a `--bronze-bright` `#E8C065` solo en glows e iluminaciones.

❌ **NO HACER:**
- Bronce en bloques de texto largo. Está prohibido. Usa bronce solo en: CTAs, micro-titulares (eyebrows ALL CAPS), bordes, separadores, iconos.
- Más de un acento. Si propones azul, verde o púrpura: la respuesta es no.
- Blanco puro `#FFFFFF` sobre fondo oscuro. Usa `--ash-100` `#E8E6E0`.
- Negro puro `#000000` para texto sobre fondo claro. Usa `--ink-darkest` `#090B0B`.
- Gradientes multicolor o "creativos". Los únicos gradientes permitidos son negro→negro-cálido (radial) y bronce→bronce (lineal sutil) en hover de CTAs.

---

## 2. Tipografía

### 2.1 Fuentes

| Rol | Fuente | Pesos | Fallback |
|---|---|---|---|
| Display | **Montserrat** | 900 únicamente | `Arial Black, sans-serif` |
| Body | **Outfit** | 300, 400, 500, 600, 700 | `system-ui, -apple-system, sans-serif` |
| Mono | **JetBrains Mono** (opcional) | 400, 500, 700 | `'Courier New', monospace` |

> **Por qué Montserrat 900:** los pesos finos (300-700) son comunes. Montserrat 900 con `letter-spacing` apretado da el "carácter editorial premium" angular que diferencia a Miró.
>
> **Por qué Outfit:** humanista, generoso en altura-x, rinde bien en español (acentos), excelente legibilidad a 16-18px que es nuestro rango body.

### 2.2 Escala tipográfica

| Token | Tamaño | Peso | Letter-spacing | Uso |
|---|---|---|---|---|
| `--type-display-xl` | `clamp(3.5rem, 8vw, 7.5rem)` | 900 Montserrat UPPERCASE | `-0.02em` | Hero gancho (1 vez por página) |
| `--type-display-lg` | `clamp(2.5rem, 5vw, 4.5rem)` | 900 Montserrat UPPERCASE | `-0.02em` | H1 secciones grandes |
| `--type-display-md` | `clamp(1.75rem, 3vw, 2.75rem)` | 900 Montserrat UPPERCASE | `-0.01em` | H2 / sub-secciones |
| `--type-display-sm` | `1.25rem` | 900 Montserrat UPPERCASE | `0` | H3, títulos de cards |
| `--type-body-lg` | `1.125rem` (18px) | 400 Outfit | normal | Body destacado, párrafos hero |
| `--type-body` | `1rem` (16px) | 400 Outfit | normal | **Body estándar. NUNCA bajar de esto.** |
| `--type-body-sm` | `0.9375rem` (15px) | 400 Outfit | normal | Solo en cards densas, no para body de párrafos |
| `--type-caption` | `0.875rem` (14px) | 500 Outfit | `0.02em` | Metadata, labels secundarios |
| `--type-eyebrow` | `0.75rem` (12px) | 700 Outfit UPPERCASE | `0.12em` | Eyebrows tipo "VERIFIED · 30 AÑOS" |
| `--type-mono` | `0.75rem` (12px) | 500 Mono UPPERCASE | `0.08em` | Tags técnicas (ej: "MIRO.DX v1.2"), badges |

### 2.3 Reglas de tipografía

✅ **HACER:**
- Body de **párrafos** siempre `--type-body` (16px) o mayor.
- Montserrat 900 SIEMPRE en UPPERCASE (es su fuerza visual).
- Eyebrows con `letter-spacing: 0.12em` mínimo (es lo que les da el look editorial).
- Outfit para todo lo que no sea display: el contraste de pesos (400 body / 700 énfasis) hace el trabajo.

❌ **NO HACER:**
- Montserrat en pesos menores a 900. Si necesitas algo "menos pesado", usa Outfit 700.
- Body de párrafos en 14px o menos. Eso es para captions/labels, no para que la gente LEA.
- Montserrat en minúsculas. Pierde su carácter.
- Mezclar tres tipografías en una pantalla. Display + body es la regla.
- Line-height menor a 1.5 en body. Por defecto `1.6` para body, `1.05` para display.

---

## 3. Spacing & Layout

### 3.1 Escala de espaciado (base 4px)

| Token | px | Uso |
|---|---|---|
| `--s-1` | 4px | Gaps internos de iconos |
| `--s-2` | 8px | Padding inputs, gaps mini |
| `--s-3` | 12px | Padding sm, gaps medianos |
| `--s-4` | 16px | Padding base, gap entre elementos relacionados |
| `--s-5` | 24px | Gap entre secciones internas de un componente |
| `--s-6` | 32px | Gap entre componentes |
| `--s-7` | 48px | Padding hero vertical pequeño |
| `--s-8` | 64px | Section padding mínimo |
| `--s-9` | 96px | Section padding cómodo |
| `--s-10` | 128px | Hero padding generoso |

### 3.2 Grid

- **Container max-width:** `1180px`
- **Container padding:** `clamp(20px, 5vw, 48px)`
- **Columnas:** Sistema fluido, no grid 12-col rígido. Usar `clamp()` y `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` para responsividad sin breakpoints duros.

### 3.3 Border-radius

| Token | Valor | Uso |
|---|---|---|
| `--r-sm` | `2px` | Badges, tags |
| `--r-md` | `3px` | Buttons, inputs |
| `--r-lg` | `8px` | Cards |
| `--r-xl` | `16px` | Modales, hero containers |
| `--r-full` | `9999px` | Avatares, pills |

> **Filosofía:** radios sutiles (2-8px). Nada redondo y "amistoso" tipo startup B2C. Somos clínicos.

---

## 4. Componentes

### 4.1 Botones

#### Primary CTA (fondo claro)
```css
background: #D3A436;
color: #090B0B;
font: 700 16px Outfit;
text-transform: uppercase;
letter-spacing: 0.04em;
padding: 14px 28px;
border-radius: 3px;
border: none;
```

#### Primary CTA (fondo oscuro)
```css
background: #D3A436;
color: #090B0B;
/* mismo que arriba */
&:hover { background: #E8C065; box-shadow: 0 0 22px rgba(211,164,54,0.35); }
```

#### Secondary CTA (outline)
```css
background: transparent;
color: #090B0B; /* o --ash-100 sobre dark */
border: 1.5px solid #D3A436;
/* tipografía igual al primary */
```

#### Ghost (texto solo, para acciones terciarias)
```css
background: transparent;
color: var(--ink-dark);
border: none;
text-decoration: underline;
text-underline-offset: 4px;
text-decoration-thickness: 1px;
text-decoration-color: rgba(211,164,54,0.4);
```

### 4.2 Inputs

```css
background: #FFFFFF;
border: 1px solid rgba(28,33,33,0.15);
border-radius: 3px;
padding: 14px 16px;
font: 400 16px Outfit;
&:focus { border-color: #D3A436; outline: none; box-shadow: 0 0 0 3px rgba(211,164,54,0.15); }
```

> **Mínimo 16px en input** para evitar zoom forzado en iOS.

### 4.3 Cards

```css
background: #FFFFFF; /* o --ink-warmer-3 sobre dark */
border: 1px solid rgba(28,33,33,0.08);
border-radius: 8px;
padding: 24px;
```

Sin sombras pesadas. Sin glassmorphism. La separación viene del color y el spacing, no del drop-shadow.

---

## 5. Iconografía

- **Estilo:** Stroke 1.5px, esquinas square (no rounded), tamaño base 20-24px.
- **Color:** `currentColor` (heredan del texto). El bronce SOLO en iconos que son CTAs visuales.
- **Fuente sugerida:** Lucide o Phosphor (Regular weight). Nunca Material Icons (estética Google, no clínica).
- **Emojis:** evitados en interfaz core. Permitidos en banners contextuales puntuales (📸 IMAGEN REQUERIDA) y mensajes de WhatsApp.

---

## 6. Motion

### 6.1 Tokens

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entradas, hovers |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transiciones de estado |
| `--dur-fast` | `150ms` | Hover, micro-interactions |
| `--dur-base` | `300ms` | Reveals, panel transitions |
| `--dur-slow` | `600ms` | Scroll-driven reveals, hero |

### 6.2 Reglas

✅ **HACER:**
- Animaciones que **sirvan**: orientan la atención, conectan estados.
- Respetar `prefers-reduced-motion` SIEMPRE.
- Easings asimétricos (`ease-out` para entradas, `ease-in` para salidas).

❌ **NO HACER:**
- Animaciones decorativas sin propósito (texto "rebotando", parallax extremo).
- Loops infinitos perceptibles (excepto el glow del CTA "calidad OK" — propósito específico).
- Animaciones que tarden más de 800ms (excepto el canvas hero, propósito ambiental).

---

## 7. Voice & Tone

### 7.1 Cómo hablamos

| ✅ Sí | ❌ No |
|---|---|
| "Tu caso es único." | "¡Hola amigo!" |
| "Vamos a evaluar contigo." | "Te vamos a sorprender." |
| "Con evidencia, no con opinión." | "Somos los mejores." |
| "30+ años, 11.000+ implantes." | "Líderes en sonrisas." |
| "Imagen compatible con caries." | "Tienes una caries." |
| "Esto es una pre-evaluación orientativa." | "Diagnóstico definitivo." |

### 7.2 Lenguaje clínico responsable

En cualquier interfaz que muestre hallazgos generados por IA, **es obligatorio**:
- Usar lenguaje de hipótesis: "compatible con", "sugerente de", "se observa lo que parece"
- Mostrar disclaimer claro: "Pre-evaluación orientativa. No reemplaza diagnóstico clínico. Ley 20.584."
- Indicar grado de confianza (alta/media) y limitación clínica de cada hallazgo.
- Nunca afirmar diagnósticos definitivos sin examen + radiografía.

### 7.3 Idioma

- **Default:** español de Chile, formal pero cercano (segunda persona tú).
- **Internacional:** español neutro o inglés clínico.
- **Lema corporativo:** "Ladran, Sancho. Señal que cabalgamos." — uso interno y editorial, no en CTAs.

---

## 8. Do's & Don'ts visuales

### ✅ Esto SÍ

- Hero negro con tipografía Montserrat 900 enorme + acento bronce sutil + texto ash-100 (`#E8E6E0`).
- Secciones blancas (`#FFFFFF`) o alt (`#F5F5F5`) alternándose para ritmo visual.
- Bronce únicamente en CTAs, divisores, micro-acentos visuales (eyebrows, iconos).
- Métricas grandes con número en `--ink-darkest` y label pequeño en uppercase `--ash-500`.

### ❌ Esto NO

- Bronce en bloques de texto.
- Glassmorphism, neumorphism, soft shadows pronunciadas.
- Gradientes coloridos. Solo gradientes monocromos sutiles.
- Tipografías "tech bro" tipo Inter, Geist, Satoshi. Tenemos las nuestras.
- Stock photos genéricas de dentistas con dedos en V. Nunca.
- Iconos con relleno (filled). Siempre stroke.
- Animaciones que "rebotan" o que distraen.
- Textos en azul (por convención de links). Los links se subrayan en bronce desaturado.

---

## 9. Tokens CSS — listos para copiar

Archivo: `humana-tokens.css` (mantener sincronizado con este documento).

```css
:root {
  /* Color · Primary */
  --ink-darkest: #090B0B;
  --ink-dark: #1C2121;
  --paper: #FFFFFF;
  --paper-alt: #F5F5F5;
  --bronze: #D3A436;

  /* Color · Extended */
  --ink-true: #000000;
  --ink-warmer-1: #020201;
  --ink-warmer-2: #0A0805;
  --ink-warmer-3: #0A0D0D;
  --ink-warmer-4: #101414;
  --bronze-shadow: #1A1208;
  --bronze-deep: #3A2810;
  --bronze-dark: #B5891C;
  --bronze-bright: #E8C065;

  /* Color · Ash (texto sobre fondo oscuro) */
  --ash-100: #E8E6E0;
  --ash-200: #D9D6CE;
  --ash-300: #C9C6BE;
  --ash-400: #9A9790;
  --ash-500: #6A6F6F;

  /* Color · Functional */
  --ok: #00E5A0;
  --warn: #FFA500;
  --alert: #FF6B35;

  /* Type */
  --font-display: 'Montserrat', 'Arial Black', sans-serif;
  --font-body: 'Outfit', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* Spacing (base 4px) */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px;
  --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px; --s-10: 128px;

  /* Radius */
  --r-sm: 2px; --r-md: 3px; --r-lg: 8px; --r-xl: 16px; --r-full: 9999px;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --dur-fast: 150ms;
  --dur-base: 300ms;
  --dur-slow: 600ms;
}
```

---

## 10. Cómo usar este documento

### Para desarrolladores
1. Importar `humana-tokens.css` en cada repo del ecosistema.
2. **Nunca** hardcodear hex codes. Usar `var(--token)`.
3. Cuando necesites un valor fuera del sistema, **añadirlo aquí primero**, luego al `humana-tokens.css`, luego al código.

### Para diseñadores
1. Cualquier diseño debe poder construirse 100% con los tokens listados acá.
2. Si propones algo nuevo: justifícalo, valídalo con Director Clínico, documéntalo aquí.

### Para CACO y equipo
1. Este documento es el árbitro final en cualquier discusión visual.
2. Versionar cada cambio (semver-ish: 1.0 → 1.1 patch, 1.0 → 2.0 cambio mayor).
3. No expandir orgánicamente — periodicidad de revisión trimestral mínimo.

---

## Changelog

- **v1.0** (Jun 2026): documento inicial. Consolida paleta extendida derivada del uso real en clinicamiro.cl, miro-dx-console, scandent-humana. Formaliza prohibición de bronce en texto. Establece escala tipográfica con mínimo 16px en body. Codifica `--ash-100` como blanco-quemado obligatorio sobre dark.
