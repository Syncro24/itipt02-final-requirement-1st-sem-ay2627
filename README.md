# E-Commerce Storefront

A mobile-friendly e-commerce storefront built with an Ionic/Angular frontend, a FastAPI backend, and a MariaDB/MySQL database. Users can create accounts and sign in, browse and search approved products, add products to a cart, adjust cart quantities, and edit their profile.

> Project status: checkout currently shows a success message in the frontend but does not create or process a real order.

## Tech stack

- Frontend: Angular 22, Ionic 9, TypeScript, SCSS, and Capacitor
- Backend: Python, FastAPI, Uvicorn, Pydantic, MySQL Connector/Python, and bcrypt
- Database: MariaDB/MySQL

## Repository layout

```text
.
├── backend/
│   └── backend.py       # FastAPI application and API endpoints
├── ecommerce_db.sql     # Database schema and sample data
└── frontend/
    ├── package.json     # Frontend dependencies and npm scripts
    └── src/app/
        ├── auth/        # Sign-in and sign-up
        ├── services/    # Shared HTTP API client
        └── shop/
            ├── home/    # Featured products
            ├── search/  # Product search and category filters
            ├── cart/    # Cart management
            ├── account/ # Profile and logout
            └── tab/     # Store navigation
```

## Prerequisites

- Python 3 and pip
- Node.js and npm
- A running MariaDB or MySQL server

## Setup and run

### 1. Set up the database

Create the database and import the provided schema/data:

```bash
mysql -u root -p -e "CREATE DATABASE ecommerce_db;"
mysql -u root -p ecommerce_db < ecommerce_db.sql
```

The SQL dump is designed for MariaDB/MySQL. If the database already exists, skip the creation step.

### 2. Start the backend

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn mysql-connector-python bcrypt
uvicorn backend.backend:backend_data --reload
```

The backend listens on `http://127.0.0.1:8000` by default. FastAPI docs are available at `http://127.0.0.1:8000/docs`.

The database connection is hard-coded in `backend/backend.py` for:
- Host: `localhost`
- User: `root`
- Password: empty string
- Database: `ecommerce_db`

Update it to match your local database config if needed.

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

The frontend API base URL is hard-coded in `frontend/src/app/services/api.ts` as `http://127.0.0.1:8000`.

## Available frontend scripts

From `frontend/`:

```bash
npm start
npm run build
npm test
npm run lint
```

## Main API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/items` | List approved products |
| POST | `/signup` | Create an account |
| POST | `/login` | Authenticate an account |
| GET | `/accounts/{user_id}` | Retrieve a profile |
| PUT | `/accounts/{user_id}` | Update a profile |
| GET | `/cart/{user_id}` | Retrieve a user's cart |
| POST | `/cart` | Add a product to a cart |
| PUT | `/cart/{cart_item_id}` | Update cart quantity |
| DELETE | `/cart/{cart_item_id}` | Remove a cart item |

## Notes

- The repository currently includes a Python virtual environment under `backend/`.
- CORS is enabled for all origins in the FastAPI backend; restrict this before production use.
- Database credentials and the API URL are currently set directly in code rather than environment variables.
- There is no backend dependency lockfile or requirements file included in the repo. Install the packages above in your own environment.

