"""API v1 router aggregating all endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    students,
    lecturers,
    modules,
    learning_opportunities,
    assessments,
    rooms,
    schedules,
    admin,
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Core resources
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(lecturers.router, prefix="/lecturers", tags=["Lecturers"])
api_router.include_router(modules.router, prefix="/modules", tags=["Modules"])
api_router.include_router(
    learning_opportunities.router,
    prefix="/learning-opportunities",
    tags=["Learning Opportunities"],
)
api_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["Schedules"])

# Admin
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
