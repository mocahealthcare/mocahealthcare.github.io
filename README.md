# MOCA UI Prototype

A bilingual React prototype for a digital MOCA-style cognitive assessment flow.

This project is built with `React`, `TypeScript`, `Vite`, and `Tailwind CSS`, and is currently deployed with GitHub Pages.

## Live Site

[https://mocahealthcare.github.io/](https://mocahealthcare.github.io/)

## Overview

This prototype focuses on turning common MOCA interaction patterns into a browser-based experience, including:

- Trail Making
- Cube Copy
- Clock Drawing
- Naming
- Memory
- Attention
- Serial 7s
- Sentence Repetition
- Verbal Fluency
- Abstraction
- Delayed Recall
- Orientation
- Result Summary

The interface supports both English and Chinese, with English set as the default startup language.

## Current Features

- Bilingual UI: English and Chinese
- Responsive single-page assessment flow
- Default entry on `Trail Making`
- Guided `1 -> A -> 2` visual hint in Trail Making
- Drawing canvas for `Cube Copy` and `Clock Drawing`
- Result summary screen
- GitHub Pages deployment via GitHub Actions

## Tech Stack

- `React 18`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `framer-motion`
- `lucide-react`

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

## Project Structure

```text
.
├── src/
│   ├── App.tsx
│   ├── MocaUiPrototype.tsx
│   ├── main.tsx
│   ├── index.css
│   └── components/ui/
├── .github/workflows/
├── index.html
├── package.json
└── vite.config.ts
```

## Deployment

This project is configured for GitHub Pages using GitHub Actions.

The deployment workflow lives in:

[`/.github/workflows/deploy-pages.yml`](/Users/junzhou/Project/AutoMOCA/moca_codex/.github/workflows/deploy-pages.yml)

When code is pushed to `main`, GitHub Actions will:

1. Install dependencies
2. Build the project
3. Publish the contents of `dist/` to GitHub Pages

## Notes

- This is a UI prototype, not a validated clinical product.
- Some scoring and review logic are intentionally simplified for demonstration.
- The result screen should be treated as a prototype summary view, not a diagnostic conclusion.

## Future Improvements

- Add structured scoring logic across all tasks
- Improve clinician-facing review workflows
- Add audio input and speech recognition for verbal tasks
- Persist answers across sessions
- Export structured reports

## License

Internal prototype / project-specific usage unless otherwise specified.
