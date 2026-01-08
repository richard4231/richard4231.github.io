"""Lecturer management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


@router.get("")
async def list_lecturers(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    department_id: UUID | None = None,
) -> dict:
    """List all lecturers with pagination and filters."""
    return {"message": "List lecturers - implementation pending"}


@router.get("/{lecturer_id}")
async def get_lecturer(
    lecturer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get lecturer by ID."""
    return {"message": f"Get lecturer {lecturer_id} - implementation pending"}


@router.get("/{lecturer_id}/modules")
async def get_lecturer_modules(
    lecturer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get modules taught by lecturer."""
    return {"message": f"Lecturer {lecturer_id} modules - implementation pending"}


@router.get("/{lecturer_id}/learning-opportunities")
async def get_lecturer_learning_opportunities(
    lecturer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get learning opportunities for this lecturer."""
    return {"message": f"Lecturer {lecturer_id} LOs - implementation pending"}
