# Project Ibis AR Menu Ordering Backend

Production-style FastAPI backend for Project Ibis: a single-restaurant AR menu,
ordering, operations, and admin system.

## Stack

- FastAPI
- PostgreSQL
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- JWT auth with role-based access control
- Soft delete on main tables
- Wrapped JSON responses

## Setup

```bash
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
psql "$DATABASE_URL" -f database_seed.sql
uvicorn app.main:app --reload
```

API docs are available at `http://localhost:8000/docs`.

## Roles

- `customer`: browse, order, cart, pay, rate, submit feedback.
- `content_admin`: categories, menu items, AR/3D URLs, deals, deal items, ratings, feedback.
- `order_manager`: orders, order status, payments, inventory operations.
- `super_admin`: users, roles, content, orders, restore operations, audit logs.

## Key Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /roles`
- `GET /categories`
- `GET /menu-items`
- `POST /carts`
- `POST /orders`
- `PATCH /orders/{order_id}/status`
- `POST /payments`
- `POST /ratings`
- `POST /feedback`
- `POST /analytics/ar-views`
- `GET /audit-logs`
