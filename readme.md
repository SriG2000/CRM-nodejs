# CRM Drip Campaign Builder

This project provides a full-stack drip campaign builder with an Angular frontend and a Node.js/Express backend. The frontend reproduces the React drip campaign UI in Angular, while the backend exposes APIs for managing email templates, time intervals, and persisting campaign configurations.

## Project Structure

```
.
├── frontend/   # Angular 17 application
└── server/     # Node.js Express API
```

## Prerequisites

- Node.js 18 or later
- npm 9 or later

## Getting Started

### Backend (Express API)

```bash
cd server
npm install
npm run dev   # starts the API on http://localhost:4000 with hot reload
# or
npm start     # starts the API without hot reload
```

Available endpoints:

- `GET /api/templates` – list available email templates.
- `POST /api/templates` – add a new template (`name`, `description`, `content`).
- `GET /api/time-intervals` – list selectable wait times between drips.
- `GET /api/campaigns` – list saved campaigns for the current session.
- `POST /api/campaigns` – save a new campaign.

### Frontend (Angular Application)

```bash
cd frontend
npm install
npm start
```

The Angular development server proxies API requests to `http://localhost:4000` (configured via `proxy.conf.json`). Ensure the backend is running before using the UI.

To build the Angular app for production:

```bash
npm run build
```

The compiled files are output to `frontend/dist/frontend`.

## Deployment Notes

- Deploy the backend to any Node-compatible host (Heroku, Render, etc.).
- Build the Angular app (`npm run build`) and serve the static files from a static host (Netlify, Vercel, S3, etc.) or behind the Node server.
- Update the frontend API base URL as needed (adjust the proxy or configure environment files for production).

## License

MIT
