# Portfolio Backend

Node.js and Express API for the portfolio contact form.

## Gmail setup

1. Enable 2-Step Verification on the Google account that will send contact messages.
2. Create a Google App Password for this backend. Use the 16-character app password, not the account password.
3. Use that Gmail address for `SMTP_USER` and `CONTACT_TO` (or set `CONTACT_TO` to the address where you want to receive messages).
4. Keep `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, and `SMTP_SECURE=true`.

Never commit `.env` or share the App Password. `.env` is ignored by Git.

## Deploy on Render

Create or update a Render **Web Service** for this repository:

1. Set **Root Directory** to `backend`.
2. Set **Build Command** to `npm install`.
3. Set **Start Command** to `npm start`.
4. In the service's **Environment** settings, add:
   - `CLIENT_ORIGIN`: the exact public frontend origin, such as `https://your-site.example` (no path or trailing slash).
   - `CONTACT_TO`: the inbox that should receive messages.
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `465`
   - `SMTP_SECURE`: `true`
   - `SMTP_USER`: the Gmail address used for sending
   - `SMTP_PASS`: the Gmail App Password
5. Deploy the service. The frontend currently sends production submissions to `https://portfolio-backend-hd55.onrender.com/api/contact`; use that Render service URL, or update `API_URL` in the frontend if Render assigns a different URL.
6. Visit `https://your-render-service.onrender.com/api/health`. A healthy service responds with `{"success":true,"status":"ok"}`.

If the frontend uses both `www` and non-`www` domains, list both origins in `CLIENT_ORIGIN`, separated by commas.

## Run locally

1. Copy `.env.example` to `.env` and fill in the Gmail settings above. Set `CLIENT_ORIGIN` to the local frontend origin.
2. From this directory, run `npm install` and then `npm start`.
3. Serve the frontend at `http://localhost:5500` or `http://127.0.0.1:5500` so its contact form targets the local API.

The API listens on port `3001` by default.

## API endpoints

- `GET /api/health`
- `POST /api/contact`
