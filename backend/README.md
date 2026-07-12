# AssetFlow ERP - Backend API Service

This is the backend service for the **AssetFlow** Enterprise Asset & Resource Management System. It is built using Node.js, Express.js, and SQLite.

## Directory Structure

```
backend/
├── src/
│   ├── config/          # Configurations (db, auth, integrations)
│   ├── controllers/     # Controller handlers parsing HTTP payloads
│   ├── middleware/      # Express middleware functions (auth, logs, error handlers)
│   ├── models/          # Database data-access patterns (SQLite wrappers)
│   ├── routes/          # API route definitions mapping to controllers
│   ├── services/        # Business logic abstraction layer
│   ├── utils/           # Helper scripts and utility functions
│   ├── database/        # SQLite migrations, schema configuration, and seeding scripts
│   │   ├── migrations/
│   │   ├── schema/
│   │   └── seed/
│   ├── validations/     # Request payload validation rules (Joi/Zod structure)
│   ├── constants/       # App-wide constants (status codes, errors, messages)
│   ├── app.js           # Core Express App configuration
│   └── server.js        # Server instantiation and event hook listeners
├── uploads/             # Directory for file uploads
├── tests/               # Test suites (unit/integration)
├── package.json         # Node manifest and script actions
├── .env.example         # Template configuration settings
└── README.md            # Self documentation
```

## Quick Start

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Update configuration parameters within `.env` as required.

### 3. Development
Launch local development server (reloads on changes using `nodemon`):
```bash
npm run dev
```

### 4. Production Run
Launch standard production instance:
```bash
npm start
```
