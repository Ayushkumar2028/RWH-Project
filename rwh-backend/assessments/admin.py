from django.contrib import admin
from .models import Assessment

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "location_name",
        "rooftop_area",
        "annual_potential",
        "recommended_tank_size",
        "created_at",
    )