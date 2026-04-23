# PeopleGraph Production Deployment

This project can be deployed as a full stack using Docker Compose:
- `frontend` (Next.js)
- `backend` (FastAPI)
- `db` (Postgres)
- `nginx` (public entrypoint on port 80)

## 1) Prepare environment files

From project root:

```powershell
Copy-Item backend/.env.prod.example backend/.env.prod
Copy-Item frontend/.env.prod.example frontend/.env.prod
```

Edit:
- `backend/.env.prod`
  - set `SECRET_KEY`
  - set `POSTGRES_PASSWORD`
  - set `CORS_ORIGINS` with your real domain
  - set optional external API keys if used
- `frontend/.env.prod`
  - set `NEXT_PUBLIC_API_URL` to your public domain

## 2) Build and start

```powershell
docker compose -f docker-compose.prod.yml up --build -d
```

## 3) Verify services

```powershell
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

Expected:
- app homepage: `http://<server-ip>/`
- backend docs: `http://<server-ip>/docs`
- API base routed by nginx: `http://<server-ip>/api/...`

## 4) Seed demo data (optional)

```powershell
Invoke-RestMethod -Method POST -Uri "http://<server-ip>/api/v1/seed"
```

## 5) Stop / restart

```powershell
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## Notes

- Current nginx config is HTTP only. For HTTPS, put Cloudflare in front or switch to Caddy/Nginx+Certbot.
- Keep `.env.prod` files out of git.
