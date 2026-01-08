"""Audit logging models for nDSG/GDPR compliance."""

from datetime import date, datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import Date, DateTime, String, Text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from uuid import uuid4


class AuditAction(str, Enum):
    """Audit log action types."""

    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    CONSENT = "consent"


class AuditLog(Base):
    """Audit log for tracking all data access and modifications."""

    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    # Who
    user_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    user_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    # What
    action: Mapped[AuditAction] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)

    # Details
    old_values: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    new_values: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # When
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    # Retention (nDSG compliance)
    retention_until: Mapped[date | None] = mapped_column(Date, nullable=True)


class DataProcessingRecord(Base):
    """Data processing activity records (GDPR Article 30)."""

    __tablename__ = "data_processing_records"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    processing_activity: Mapped[str] = mapped_column(String(200), nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    legal_basis: Mapped[str] = mapped_column(String(100), nullable=False)  # consent, contract, legal_obligation
    data_categories: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    data_subjects: Mapped[str] = mapped_column(String(100), nullable=False)  # students, lecturers, staff
    recipients: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    retention_period: Mapped[str] = mapped_column(String(100), nullable=False)
    security_measures: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ConsentRecord(Base):
    """User consent records for data processing."""

    __tablename__ = "consent_records"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    consent_type: Mapped[str] = mapped_column(String(100), nullable=False)  # data_processing, marketing, analytics
    consent_given: Mapped[bool] = mapped_column(nullable=False)
    consent_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    withdrawn_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
