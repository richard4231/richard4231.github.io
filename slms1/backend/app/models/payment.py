"""Payment models."""

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class PaymentStatus(str, Enum):
    """Payment status."""

    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    """Payment methods."""

    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    EINZAHLUNGSSCHEIN = "einzahlungsschein"  # Swiss payment slip
    TWINT = "twint"


class PaymentType(BaseModel):
    """Payment type configuration."""

    __tablename__ = "payment_types"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name_de: Mapped[str] = mapped_column(String(100), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(100), nullable=True)
    name_en: Mapped[str | None] = mapped_column(String(100), nullable=True)
    default_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    payments: Mapped[list["Payment"]] = relationship(back_populates="payment_type")


class Payment(BaseModel):
    """Student payment record."""

    __tablename__ = "payments"

    student_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )
    payment_type_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("payment_types.id"),
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="CHF")

    # Reference
    academic_period_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("academic_periods.id"),
        nullable=True,
    )
    reference_number: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)

    # Status
    status: Mapped[PaymentStatus] = mapped_column(String(20), default=PaymentStatus.PENDING)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    paid_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Payment details
    payment_method: Mapped[PaymentMethod | None] = mapped_column(String(50), nullable=True)
    transaction_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="payments")
    payment_type: Mapped["PaymentType"] = relationship(back_populates="payments")
    academic_period: Mapped["AcademicPeriod | None"] = relationship()


# Forward references
from app.models.student import Student  # noqa: E402
from app.models.learning_opportunity import AcademicPeriod  # noqa: E402
