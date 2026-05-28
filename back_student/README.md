# API_BACK_T_NSA

REST API used by the front_student app.

## Setup

1. Copy `.env.example` to `.env` and fill in real values:
   ```
   cp .env.example .env
   ```
   At minimum, set `JWT_SECRET` (32+ chars), `DB_USER`, `DB_PASS`.
   Generate a strong JWT secret with: `openssl rand -base64 48`.

2. Build and run with docker-compose:
   ```
   docker-compose build
   docker-compose up -d
   ```

3. The API listens on `localhost:3000`.

## First admin user

The bundled migration that auto-created an `admin:admin` account has been
removed. After the first deploy, register the first admin manually:

```
docker exec -it dev_db mysql -u root -p$DB_PASS dev_db -e \
  "INSERT INTO user (username, password, role, createdAt, updatedAt) \
   VALUES ('your-username', '<bcrypt-hash>', 'ADMIN', NOW(), NOW());"
```

Generate the bcrypt hash with cost 12 from a Node REPL:
```
node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
```

## Notes

- `/api-docs` (Swagger UI) and `/swagger-stats/ui` (request stats) are
  gated by `X-Admin-Token` matching `ADMIN_API_TOKEN`. If that env var is
  unset, both routes return 404.
- CORS is whitelisted via `CORS_ORIGINS` (comma-separated).
- All container processes run as the non-root `service-web` user.
