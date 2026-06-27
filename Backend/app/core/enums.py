from enum import Enum


class UserRole(str, Enum):
    customer = "customer"
    content_admin = "content_admin"
    order_manager = "order_manager"
    super_admin = "super_admin"


class QRSessionStatus(str, Enum):
    active = "active"
    expired = "expired"
    closed = "closed"


class CartStatus(str, Enum):
    active = "active"
    checked_out = "checked_out"
    abandoned = "abandoned"


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    served = "served"
    cancelled = "cancelled"


class PaymentStatus(str, Enum):
    pending = "pending"
    authorized = "authorized"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class AuditAction(str, Enum):
    create = "create"
    update = "update"
    delete = "delete"
