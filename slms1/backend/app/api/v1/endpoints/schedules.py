"""Schedule management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


@router.get("")
async def list_schedules(
    db: AsyncSession = Depends(get_db),
    academic_period_id: UUID | None = None,
    room_id: UUID | None = None,
    day_of_week: int | None = Query(None, ge=1, le=7),
) -> dict:
    """List schedules with filters."""
    return {"message": "List schedules - implementation pending"}


@router.get("/conflicts")
async def check_conflicts(
    db: AsyncSession = Depends(get_db),
    room_id: UUID | None = None,
    lecturer_id: UUID | None = None,
    academic_period_id: UUID | None = None,
) -> dict:
    """Check for scheduling conflicts."""
    return {"message": "Check conflicts - implementation pending"}
