# AssetFlow — Enterprise Asset & Resource Management

A premium, production-styled ERP SaaS front-end for managing physical assets, people,
bookings, maintenance, audits and analytics. Built as a fully self-contained static app —
**no build step, no dependencies, no network required.**

## Run it
Open `index.html` in any modern browser. That's it.
(Optionally serve it: `python3 -m http.server` then visit the printed URL.)

## Highlights
- **Design system**: Oxford Navy + Copper palette, Inter type scale, 8px spacing grid,
  soft-shadow cards, rounded geometry, full **light/dark mode**.
- **Role-based navigation**: switch between Admin / Asset Manager / Department Head /
  Employee via the header avatar menu — the sidebar and accessible routes adapt live.
- **12 workspaces**: Dashboard, Organization Setup (Departments/Categories/Employees),
  Asset Directory + Details + Register, Allocation & Transfer, Resource Booking (calendar),
  Maintenance (drag-and-drop Kanban), Audit cycles, Reports, Notifications inbox, Profile.
- **Hand-built animated SVG charts**: line/area, bars, donut, horizontal bars, sparklines,
  heatmap — no chart library.
- **Real interactions**: slide-over drawers, modals, toasts, confirm dialogs, tooltips,
  tabs, pagination, calendar, Kanban DnD, QR modal, empty/hover states, reveal animations.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Entry shell |
| `styles.css` | Complete design system & components |
| `icons.js`   | Inline stroke icon set |
| `data.js`    | Realistic mock ERP dataset |
| `charts.js`  | SVG chart renderers |
| `pages.js`   | All page views + interaction handlers |
| `app.js`     | State, hash router, sidebar, header, theme, toasts, drawers |

_Demo data is illustrative. Switch roles from the top-right avatar._
