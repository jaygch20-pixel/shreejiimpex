# Shreeji Impex website

Full-stack public B2B textile website with a React/Vite frontend and an Express/MongoDB API. Visitors can browse published content and send enquiries without creating an account. JWT authentication is limited to admin routes.

## Requirements

- Node.js 20.0+ (a current maintained Node.js release is recommended)
- npm
- MongoDB Atlas account/cluster for a shared deployment, or another MongoDB URI for local development
- Optional: Cloudinary account for hosted media; without it, uploads are stored under `backend/uploads`
- Optional: SMTP account for enquiry notification emails
- For production image delivery: Cloudinary (recommended) or another image CDN with equivalent resizing/format support

## Install

Run these commands from PowerShell in the project directory:

```powershell
Set-Location "C:\Users\hp\Desktop\shreejiimpex website\backend"
npm install

Set-Location "C:\Users\hp\Desktop\shreejiimpex website\frontend"
npm install
```

## Configure environment

Create local environment files from the examples:

```powershell
Copy-Item "C:\Users\hp\Desktop\shreejiimpex website\backend\.env.example" "C:\Users\hp\Desktop\shreejiimpex website\backend\.env"
Copy-Item "C:\Users\hp\Desktop\shreejiimpex website\frontend\.env.example" "C:\Users\hp\Desktop\shreejiimpex website\frontend\.env"
```

Edit `backend/.env`:

- `MONGODB_URI`: in MongoDB Atlas, create a database user, add the deployment machine's IP under Network Access, then copy the cluster connection URI. Replace the URI's user, password, cluster host, and database name with the values from your Atlas account. URL-encode special characters in the database password.
- `JWT_SECRET`: generate a unique secret and keep it private. For example, run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` and copy the output into the local `.env`. The server requires at least 32 characters.
- `ADMIN_NAME_SEED`, `ADMIN_EMAIL_SEED`, `ADMIN_PASSWORD_SEED`: set the initial admin identity and a unique password of at least 8 characters. The seed command will fail if the email or password is missing; no default admin credentials are provided.
- `FRONTEND_URL`: comma-separated allowed frontend origins if the site is hosted elsewhere.
- Cloudinary settings are optional, but set all three (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) together to enable hosted uploads. If left blank, uploaded files are stored locally in `backend/uploads`.
- SMTP settings are optional. Leave all email fields blank to disable notifications, or configure all of `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, and `ADMIN_EMAIL`.

Edit `frontend/.env` only if the API is hosted at another URL:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Never commit either `.env` file. The examples contain no working credentials or real company contact details.

## Seed data and create the first admin

After configuring a reachable MongoDB URI and the `ADMIN_*_SEED` variables:

```powershell
Set-Location "C:\Users\hp\Desktop\shreejiimpex website\backend"
npm run seed
```

The seed command creates the admin and sample catalog/content records. Sample records are explicitly marked and excluded from public pages until an admin replaces/edits and publishes verified company data. The seed does not send email or create a customer account.

## Run locally

Open two PowerShell terminals:

```powershell
Set-Location "C:\Users\hp\Desktop\shreejiimpex website\backend"
npm run dev
```

```powershell
Set-Location "C:\Users\hp\Desktop\shreejiimpex website\frontend"
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The public site is available without signing in. The current frontend does not contain an admin login page or dashboard; admin sign-in and content uploads are available only through the protected backend API.

Health check: `http://localhost:5000/health`.

## Local visual demo with sample data

To preview the site with fictional products and content, make sure the local MongoDB Windows service is running. This demo uses a separate database named `shreeji_impex_demo` on `127.0.0.1`; it does not seed or write to the MongoDB URI in `backend/.env`, including Atlas.

In the first PowerShell terminal:

```powershell
Set-Location "C:\Users\hp\Desktop\shreejiimpex website\backend"
npm run seed:demo
npm run dev:demo
```

In a second terminal:

```powershell
Set-Location "C:\Users\hp\Desktop\shreejiimpex website\frontend"
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The preview flag is enabled only by the demo scripts, only in development mode, and only for requests from this computer. Other environments continue hiding sample data. A visible banner marks the website as a demo. The locally hosted Kitango-inspired product images are original SVG illustrations, not product photographs. All seeded product specifications, factory/process descriptions, company history, contact information, and business claims are fictional placeholders; do not share them as real company information.

The demo seed creates sample content even if no admin seed credentials are present. To also sign in to the local demo dashboard, set your own `ADMIN_NAME_SEED`, `ADMIN_EMAIL_SEED`, and a strong `ADMIN_PASSWORD_SEED` in `backend/.env` before running `npm run seed:demo`. The script hashes the password and creates the admin only in the local demo database. It never uses default admin credentials.

## Adding real product and company photos

The current public frontend does not include an admin dashboard or a photo-upload screen. The backend has protected admin upload APIs, but using them requires an API client such as Postman or a separately built admin interface. The demo images are local illustrations and are not changed by uploading to Cloudinary alone.

1. Prepare original JPG, PNG, or WebP photos. For quick page loads, resize close to the displayed size before upload: product/category images around 1200 px square, gallery images around 1600 × 1200 px. Aim for roughly 200–500 KB per photo where image quality allows; avoid uploading very large camera originals. Keep a safe copy of originals.
2. Create a Cloudinary account and copy its cloud name, API key, and API secret from the Cloudinary dashboard.
3. Configure all three `CLOUDINARY_*` variables in the backend environment. Keep the API secret on the backend only—never in `frontend/.env`, source code, or a public chat.
4. Configure the production `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`. Set `VITE_API_URL` in the frontend build environment to the deployed HTTPS API URL, then rebuild and deploy both services.
5. Set `ADMIN_NAME_SEED`, `ADMIN_EMAIL_SEED`, and a strong `ADMIN_PASSWORD_SEED` as backend environment variables and run `npm run seed` once to create the first admin. Do not share or commit those credentials.
6. Sign in through `POST /api/admin/auth/login` using the admin account, then send the returned JWT as `Authorization: Bearer <token>` on admin requests. Example upload endpoints are `POST /api/designs/admin` (multipart field `images`, up to 10 files), `POST /api/categories/admin` (multipart field `image`), and `POST /api/gallery/admin` (multipart field `image`). Product designs are saved as drafts and must be published through the protected publish endpoint before appearing publicly. Do not make upload routes public.
7. Verify the public image URLs on the deployed website and check phone-sized and desktop layouts. For a beginner-friendly workflow, add/build an admin upload screen before trying to manage photos yourself; the current frontend has none.

Cloudinary stores uploaded assets outside the application server and serves them from its image CDN. The backend limits design and manufacturing images to 1200 px, gallery/content images to 1600 × 1200 px, and applies automatic quality compression on upload. The frontend requests modern formats and appropriately sized Cloudinary variants where available, and defers below-the-fold images. These measures reduce transfer size, but actual loading time still depends on image dimensions, a visitor's device/network, and the CDN/deployment region.

## Admin and public features

- Public catalog, design details, categories, gallery, manufacturing information, company content, quotation enquiries, and custom artwork requests use public API routes and do not require authentication.
- Admin routes use JWT and bcrypt-backed credentials; there is no customer login/registration or public admin-registration endpoint.
- Protected backend APIs support managing designs and their images, categories, gallery, enquiries/quotation status, custom requests, published website content, manufacturing stages, and the admin password. The current frontend does not include the admin dashboard UI.
- Uploaded custom artwork accepts JPG, PNG, WebP, or PDF up to 20 MB. Other image uploads accept JPG, PNG, and WebP up to 10 MB.
- For production, configure durable media storage (Cloudinary or equivalent), HTTPS, a strong `JWT_SECRET`, Atlas network access restrictions, and a production `FRONTEND_URL`.

## Validation commands

```powershell
Set-Location "C:\Users\hp\Desktop\shreejiimpex website\backend"
npm test

Set-Location "C:\Users\hp\Desktop\shreejiimpex website\frontend"
npm run build
npm run lint
npx playwright install chromium
npm run test:e2e
```

Backend integration tests use MongoDB Memory Server and do not need Atlas credentials or Docker; the first run may download a MongoDB test binary. Browser tests use Playwright Chromium and stub the API boundary, while backend tests exercise persistence, admin protection, uploads, enquiries, and custom requests against an isolated database.
