# AssetFlow ERP - Frontend Client Application

This is the frontend client for the **AssetFlow** Enterprise Asset & Resource Management System. It is built using Vanilla JavaScript, HTML5, Vite as the local development server/bundler, and styled using Bootstrap 5.

## Directory Structure

```
frontend/
├── public/              # Global static assets (favicons, manifest.json)
├── src/
│   ├── assets/          # Component static resources (images, icons)
│   ├── components/      # UI components (cards, tables, modal forms)
│   ├── layouts/         # Layout modules (sidebar, header, base grids)
│   ├── pages/           # Main route view modules
│   ├── services/        # Backend API integration clients
│   ├── utils/           # Client helper utilities (formatting, calculations)
│   ├── hooks/           # Custom reusable state or event handlers
│   ├── styles/          # Styling sheets (custom main.css override)
│   ├── router/          # Client-side router configuration
│   └── main.js          # Core entry point importing libraries and boots router
├── package.json         # Node manifest and build settings
├── README.md            # Client documentation guide
└── index.html           # Root HTML loader target
```

## Quick Start

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run Local Development Server
Boot Vite development server:
```bash
npm run dev
```

### 3. Production Build
Bundle client files for distribution:
```bash
npm run build
```
Production assets will be outputted to the `dist/` directory.

### 4. Preview Build
Locally preview production compilation output:
```bash
npm run preview
```
