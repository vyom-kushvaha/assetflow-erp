# AssetFlow ERP

**AssetFlow** is an Enterprise Asset & Resource Management System designed with a robust, modular architecture. This repository contains the production-ready boilerplate layout, configuring both backend and frontend layers to enable seamless expansion.

---

## Technical Stack

* **Backend**: Node.js, Express.js, SQLite (designed using MVC with service layer architecture)
* **Frontend**: Bootstrap 5, Vanilla JavaScript, Vite (dev server & asset bundler)
* **Orchestration**: Docker Compose (Optional)

---

## Directory Structure

```
assetflow-erp/
├── backend/                  # Backend Node.js API Service
│   ├── src/                  # Source files
│   │   ├── config/           # Application config & variables loaders
│   │   ├── controllers/      # MVC Controllers
│   │   ├── middleware/       # Custom Express middleware
│   │   ├── models/           # SQLite abstraction & query wrappers
│   │   ├── routes/           # Routing declarations
│   │   ├── services/         # Business services logic
│   │   ├── utils/            # Shared utility functions
│   │   ├── database/         # Database scheme, migrations, seeds
│   │   │   ├── migrations/
│   │   │   ├── schema/
│   │   │   └── seed/
│   │   ├── validations/      # Request validation schemas
│   │   ├── constants/        # Fixed application constants
│   │   ├── app.js            # Express setup & global middleware binding
│   │   └── server.js         # HTTP Server listener & entry point
│   ├── uploads/              # Uploaded static assets storage
│   ├── tests/                # Automated testing suites
│   ├── package.json          # Node manifest
│   ├── .env.example          # Environment variables template
│   └── README.md             # Backend documentation
│
├── frontend/                 # Frontend SPA Client application
│   ├── public/               # Global static public files (favicons, manifest)
│   ├── src/                  # Client source code
│   │   ├── assets/           # UI media assets
│   │   ├── components/       # Core UI widgets
│   │   ├── layouts/          # Screen structures (Header, Sidebar)
│   │   ├── pages/            # View pages rendering target templates
│   │   ├── services/         # API HTTP communication client
│   │   ├── utils/            # Front utilities (formatters, dates)
│   │   ├── hooks/            # Front application logic/state observers
│   │   ├── styles/           # CSS files (Bootstrap override config)
│   │   ├── router/           # Client-side router module (HTML5 History API)
│   │   └── main.js           # Frontend entry, loads bootstrap and boots router
│   ├── package.json          # Frontend packages
│   └── README.md             # Frontend documentation
│
├── docs/                     # Project technical documentation
├── docker-compose.yml        # Multi-container Orchestration (Optional)
├── .gitignore                # Root git exclusions configuration
└── README.md                 # Project Overview (This file)
```

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
* [npm](https://www.npmjs.com/) (included with Node.js)
* [Docker](https://www.docker.com/) (Optional, if running via containers)

### Setup & Run Locally

#### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
The API server will launch at: [http://localhost:5000](http://localhost:5000)

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The client dashboard app will launch at: [http://localhost:5173](http://localhost:5173)

---

### Setup & Run using Docker Compose
Alternatively, launch both backend and frontend applications instantly using docker-compose:
```bash
docker-compose up --build
```
* **Frontend Client**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
