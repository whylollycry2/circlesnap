# CircleSnap 🎯

A fast-paced browser click game built with vanilla HTML, CSS, and JavaScript. Circles appear at random positions on screen — click them before they vanish. Miss too many and it's over.

## How to play

1. Choose a difficulty level
2. Click **START**
3. Click each circle before it disappears
4. Clicking outside a circle costs a life
5. Reach **20 points** to win, lose all lives to lose

## Difficulty levels

| Level  | Circle lifetime | Spawn rate | Lives | Circle size |
|--------|----------------|------------|-------|-------------|
| Łatwy  | 2.8s           | 1.8s       | 5     | Large       |
| Średni | 2.0s           | 1.5s       | 3     | Medium      |
| Trudny | 1.2s           | 1.2s       | 3     | Small       |
| Insane | 0.75s          | 0.9s       | 2     | Tiny        |

## Project structure

```
circlesnap/
├── index.html      # Markup and screen layouts
├── style/
├───── app.css      # Styles, animations, and CSS variables
├── script/
├───── scripts.js   # Game logic, state management, DOM interactions
└── README.md
```

## Running locally

No build step needed. Just open `index.html` in any modern browser:

```bash
# Option A — double-click index.html in your file manager

# Option B — serve locally with VS Code Live Server extension

# Option C — Python one-liner
python -m http.server 8080
# then open http://localhost:8080
```

## Features

- 4 difficulty levels with distinct timing and circle sizes
- Animated circle spawn, hit, and miss effects
- Live timer bar per circle
- Floating `+1` / `✕` feedback on every click
- Best score saved per difficulty via `localStorage`
- Accuracy stat on the end screen
- Fully responsive — adapts to any window size

## Requirements

- Any modern browser (Chrome, Firefox, Edge, Safari)
- Internet connection for Google Fonts (optional — falls back to system sans-serif)