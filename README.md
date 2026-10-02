# Mega Paragon Website

HTML, CSS and browser JavaScript with a Node.js portal proxy.

## Run locally or on Node hosting

Requires Node.js 20 or later.

1. Run `npm ci --prefix backend`.
2. Copy `.env.example` to `.env` in the repository root and fill in your portal keys.
3. Run `node serve.js` from the root, or `npm start --prefix backend`.
4. Visit http://localhost:8080/home and http://localhost:8080/careers.

The browser sends join uploads to `/api/join`, inquiries to `/api/inquiry`, and announcement requests to `/api/announcements`. The server reads `.env`, adds the appropriate API key, and forwards requests to the fixed portal endpoints. CV uploads retain their multipart boundary and bytes. Requests have a 10 MB body limit and a 30 second portal timeout.

Only website pages and CSS, JS, and assets are served publicly. Root configuration and backend files are blocked. Never commit real API keys; rotate any previously shared keys.

## Deployment

The production host must run this Node process and route the website domain to it. Uploading files to Apache public_html with .htaccess alone does not run Node or provide these API routes. Keep private configuration outside any Apache public document root when using an additional web server.
