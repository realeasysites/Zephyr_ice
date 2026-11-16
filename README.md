# Zephyr Ice — website

Handcrafted Hawaiian shave ice · 129 Spring St, Portland, ME · built by [Real Easy Sites](https://getrealeasysites.com).

Node 20 + Express + SQLite. One-page site with a "build your cup" flavor builder, live Facebook feed, cart/event booking form, and a password-only requests dashboard at `/admin`.

## Run locally

```bash
npm install
ADMIN_PASSWORD=pick-one npm start   # http://localhost:3000
```

## Render (Web Service)

- Build: `npm install` · Start: `npm start` · Node 20 (pinned via `.node-version`)
- Add a **persistent disk** mounted at `/var/data` and set `DATA_DIR=/var/data` so requests survive deploys.

| Env var | Needed | What it does |
|---|---|---|
| `ADMIN_PASSWORD` | yes | Dashboard password. Login is disabled until it's set. |
| `SESSION_SECRET` | recommended | Any long random string; keeps you signed in across restarts. |
| `DATA_DIR` | recommended | Where the SQLite file lives (use the disk path). |
| `NOTIFY_EMAIL` | optional | Inbox that gets an email for each new request. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | optional | Email sending (e.g. Gmail app password). |

## Photos — drop these into `public/img/`

Every slot shows a soft color card until its file exists, then the photo appears automatically.

| File | Where it shows |
|---|---|
| `logo.png` | Header logo + social share (OG) image |
| `story-1.jpg` | Our story, tall photo (Julie & Don) |
| `story-2.jpg` | Our story, square photo (making the ice) |
| `gallery-1.jpg` … `gallery-5.jpg` | Photo strip (5 = the shop, 3 = the cart, wide) |
