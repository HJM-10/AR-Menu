from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routers import analytics, audit_logs, auth, carts, deal_items, deals, feedback
from app.routers import inventory, menu_categories, menu_items, orders, payments
from app.routers import qr_sessions, ratings, roles, users
from app.utils.response import error_response, success_response

settings = get_settings()

app = FastAPI(title=settings.app_name, version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.backend_cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(roles.router)
app.include_router(users.router)
app.include_router(menu_categories.router)
app.include_router(menu_items.router)
app.include_router(deals.router)
app.include_router(deal_items.router)
app.include_router(orders.router)
app.include_router(ratings.router)
app.include_router(feedback.router)
app.include_router(qr_sessions.router)
app.include_router(carts.router)
app.include_router(payments.router)
app.include_router(inventory.router)
app.include_router(analytics.router)
app.include_router(audit_logs.router)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(str(exc.detail), {"status_code": exc.status_code}),
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=error_response("Validation error", exc.errors()),
    )


@app.get("/health", tags=["system"])
def health_check() -> dict:
    return success_response(data={"status": "ok"})
