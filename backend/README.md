# Mega Paragon Forms API

This service receives the website recruitment and inquiry forms and forwards them to The Mega Paragon portal API. The portal owns the system database; this service does not create or store a separate database.

## Setup

```powershell
cd backend
npm install
npm start
```

The API runs on `http://localhost:3000` by default. Set `PORT` to use another port.

Create a root `.env` file with the API keys supplied by the development team:

```dotenv
INQUIRIES_API_KEY=your-inquiry-api-key
JOIN_TEAM_API_KEY=your-recruitment-api-key
```

The API keys must remain server-side and must not be committed to source control.

## Endpoints

### Health check

`GET /api/health`

### Recruitment

`POST /api/forms/join`

Content type: `multipart/form-data`

Fields:

- `name` required
- `email` required
- `phone` required
- `cv` optional PDF, DOC, or DOCX up to 10 MB
- `message` optional

### Inquiry

`POST /api/forms/inquiry`

Content type: `application/json`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+63 917 000 0000",
  "subject": "Life Insurance",
  "message": "I would like to request a consultation."
}
```

The backend maps the website's `name` field to the portal API's `full_name` field.

### Portal destinations

- Inquiry: `POST https://portal.themegaparagon.net/api/v1/website/inquiries`
- Recruitment: `POST https://portal.themegaparagon.net/api/v1/website/join-team`

## Integration notes

The frontend posts to `/api/forms/join` and `/api/forms/inquiry`, so deploy this API behind the same domain or configure a reverse proxy. If the API is hosted on another origin, update the frontend endpoint configuration and set `CORS_ORIGIN` to the approved frontend origin.

Use HTTPS, secrets management, rate limiting, spam protection, access logging, and a retention policy before production deployment.
