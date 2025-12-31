# HTML Hangman

A lightweight, single-page Hangman game built with plain HTML, CSS and JavaScript.

Features
- Playable in the browser with keyboard or on-screen input
- Multi-language support: English, German, Greek and French
- No build tools required — just open the page and play

Getting started
1. Clone or download the repository.
2. Open `index.html` in your browser.

Quick local server (optional)
If you prefer to run a local HTTP server (recommended for some browsers):

```bash
# From project root
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Project structure
- `index.html` — main page and UI
- `app.js` — game logic
- `styles.css` — styling

How to play
- The game picks a hidden word and you guess letters.
- Correct guesses reveal letters; wrong guesses advance the hangman.
- Guess the word before the hangman is completed.

Contributing
- Fixes, improvements and new languages are welcome — open an issue or a pull request.

License
This project is provided as-is.

