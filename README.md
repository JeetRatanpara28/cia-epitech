# CIA — Consolidate, Investigate & Administrate

Full-stack inventory management platform. Node.js/Express REST API with a React frontend, containerised with Docker.

## Project structure

```
cia-epitech/
├── back_student/     Express API (port 3000)
└── front_student/    React app  (port 8080)
```

## Stack

**Backend**
- Node.js / Express / TypeScript
- TypeORM + MySQL (SQLite for local dev)
- JWT authentication (HS256, 15 min expiry)
- bcrypt (cost 12), class-validator, Helmet, Morgan

**Frontend**
- React / Redux / TypeScript
- Bootstrap 4
- Axios + js-cookie

---

## Quick start with Docker

```bash
# Backend
cd back_student
cp .env.example .env
# Set JWT_SECRET, DB_PASS, CORS_ORIGINS — DB_HOST must be set to: db
docker-compose up --build -d

# Frontend (separate terminal)
cd front_student
cp .env.example .env        # set REACT_APP_API_URL
docker-compose up --build -d
```

- API → `http://localhost:3000`
- App → `http://localhost:8080`

## Quick start without Docker (local dev / SQLite)

```bash
# Backend
cd back_student
yarn install
yarn start

# Frontend
cd front_student
yarn install
yarn start       # runs on http://localhost:3000 (React dev server default)
```

> Note: without Docker the frontend dev server runs on port `3000`, not `8080`.

---

## First admin account

An admin account is seeded automatically on first run via migration. No manual setup needed.

---

## API routes

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/auth/me` | user | Current user info |
| POST | `/auth/change-password` | user | Change own password |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/user` | admin | List all users |
| GET | `/user/:id` | admin | Get user by id |
| POST | `/user` | admin | Create user |
| PATCH | `/user/:id` | admin | Edit user |
| DELETE | `/user/:id` | admin | Delete user |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/product` | user | List products |
| GET | `/product/:id` | user | Get product |
| POST | `/product` | admin | Create product |
| PATCH | `/product/:id` | admin | Edit product |
| DELETE | `/product/:id` | admin | Delete product |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/order` | admin | List all orders |
| POST | `/order` | user | Place order |

---

## Environment variables

### Backend (`back_student/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | yes | Min 32 chars. Generate: `openssl rand -base64 48` |
| `DB_TYPE` | no | `sqlite` for local dev, omit for MySQL |
| `DB_HOST` | yes (MySQL) | Database host — use `db` when running with docker-compose |
| `DB_USER` | yes (MySQL) | Database user |
| `DB_PASS` | yes (MySQL) | Database password |
| `DB_NAME` | yes (MySQL) | Database name |
| `CORS_ORIGINS` | yes | Comma-separated allowed origins |
| `ADMIN_API_TOKEN` | yes | Token to access `/api-docs` and `/swagger-stats` |

### Frontend (`front_student/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | yes | Backend URL e.g. `http://localhost:3000` |

---

## CI/CD

GitHub Actions pipeline on push to `main`:

1. Type-check backend, build frontend
2. Build and push Docker images to Amazon ECR
3. Deploy to EC2 via SSH using `docker compose pull && up`

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `AWS_REGION` | ECR region |
| `ECR_REGISTRY` | ECR registry URL |
| `ECR_REPO_BACKEND` | ECR repo name for backend image |
| `ECR_REPO_FRONTEND` | ECR repo name for frontend image |
| `EC2_HOST` | EC2 instance IP or hostname |
| `EC2_USER` | EC2 SSH username |
| `EC2_SSH_KEY` | EC2 private SSH key |
| `REACT_APP_API_URL` | Public backend URL used at build time |
| `PROD_JWT_SECRET` | Production JWT secret |
| `PROD_DB_USER` | Production DB user |
| `PROD_DB_PASS` | Production DB password |
| `PROD_DB_NAME` | Production DB name |
| `PROD_CORS_ORIGINS` | Production allowed origins |
| `PROD_ADMIN_API_TOKEN` | Production admin token |

---

## Security

- All containers run as non-root `service-web` user
- JWT tokens expire after 15 minutes
- Passwords require minimum 12 chars with uppercase, lowercase, digit and symbol
- Rate limiting on `/auth/login` and `/auth/register` — 10 requests/min per IP
- CORS restricted to whitelisted origins via `CORS_ORIGINS`
- Role is re-fetched from the database on every authenticated request
- Admins cannot delete their own account or the last admin account
- Swagger UI and request stats gated behind `X-Admin-Token` header
