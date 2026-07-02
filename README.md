# Kevin Junger — Portfolio

Persönliche Portfolio-Website zur Bewerbung um einen Ausbildungsplatz als
**Fachinformatiker für Systemintegration**.

🔗 **Live-Website:** https://kevoshable.github.io/portfolio/

---

## Über das Projekt

Eine moderne, animierte Single-Page-Website — komplett handgebaut mit
**HTML, CSS und JavaScript**, ganz ohne Frameworks oder Build-Tools.
Der Fokus liegt auf sauberem Code, flüssigen Animationen und einem klaren,
professionellen Auftritt.

### Features

- 🎨 Dunkles, modernes Design mit Cyan-Violett-Akzent
- ✨ Interaktive Partikel-Konstellation im Hintergrund (Canvas)
- ⌨️ Schreibmaschinen-Effekt für die Rollenbezeichnung
- 📜 Scroll-Reveal-Animationen (IntersectionObserver)
- 🔢 Hochzählende Statistiken
- 🖱️ Maus-reaktive Karten und Cursor-Glow
- 📱 Voll responsiv inkl. mobilem Menü
- ♿ Berücksichtigt `prefers-reduced-motion`

## Technik

| Bereich      | Verwendet                          |
|--------------|------------------------------------|
| Struktur     | HTML5 (semantisch)                 |
| Styling      | CSS3 (Custom Properties, Grid, Flexbox) |
| Interaktion  | Vanilla JavaScript (ES6+)          |
| Grafik       | Canvas 2D API                      |
| Schriften    | Sora, Inter, JetBrains Mono        |

## Lokal starten

Keine Installation nötig — einfach `index.html` im Browser öffnen.
Oder mit einem kleinen lokalen Server:

```bash
# Python
python -m http.server 8000

# Node
npx serve
```

Dann `http://localhost:8000` aufrufen.

## Struktur

```
Portfolio/
├── index.html    # Inhalt & Struktur
├── styles.css    # komplettes Design
├── script.js     # Animationen & Interaktion
└── README.md
```

---

© Kevin Junger · Mit Neugier gebaut.
