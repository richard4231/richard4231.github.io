"""User and authentication models."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Table, Column
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModel, TimestampMixin


class UserType(str, Enum):
    """User type enumeration."""

    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"


class User(BaseModel):
    """Base user model linked to SWITCH edu-ID."""

    __tablename__ = "users"

    # SWITCH edu-ID identifiers
    eduid_subject: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    eduid_unique_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    # Basic info
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(5), default="de")
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Type and status
    user_type: Mapped[UserType] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    roles: Mapped[list["Role"]] = relationship(
        secondary="user_roles",
        back_populates="users",
        lazy="selectin",
    )
    student: Mapped["Student | None"] = relationship(back_populates="user", uselist=False)
    lecturer: Mapped["Lecturer | None"] = relationship(back_populates="user", uselist=False)

    @property
    def full_name(self) -> str:
        """Return full name."""
        return f"{self.first_name} {self.last_name}"


class Role(Base, TimestampMixin):
    """Role model for RBAC."""

    __tablename__ = "roles"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    users: Mapped[list["User"]] = relationship(
        secondary="user_roles",
        back_populates="roles",
    )
    permissions: Mapped[list["Permission"]] = relationship(
        secondary="role_permissions",
        back_populates="roles",
        lazy="selectin",
    )


class Permission(Base, TimestampMixin):
    """Permission model for fine-grained access control."""

    __tablename__ = "permissions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    roles: Mapped[list["Role"]] = relationship(
        secondary="role_permissions",
        back_populates="permissions",
    )


# Association tables
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", PGUUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("granted_at", DateTime(timezone=True), server_default="now()"),
    Column("granted_by", PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True),
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", PGUUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", PGUUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


# Forward references for type hints
from app.models.student import Student  # noqa: E402
from app.models.lecturer import Lecturer  # noqa: E402
