from django.db import models

class Assessment(models.Model):
    location_name = models.CharField(max_length=500, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    polygon_coordinates = models.JSONField()
    rooftop_area = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    annual_potential = models.FloatField(null=True, blank=True)
    recommended_tank_size = models.CharField(max_length=100, blank=True)
    recharge_feasibility = models.CharField(max_length=100, blank=True)
    structure_type = models.CharField(max_length=200, blank=True)
    rainfall_estimate = models.CharField(max_length=100, blank=True)

    hydrology_zone = models.CharField(max_length=100, blank=True)
    engineering_note = models.TextField(blank=True)

    soil_sand_pct = models.FloatField(null=True, blank=True)
    soil_clay_pct = models.FloatField(null=True, blank=True)
    slope_deg = models.FloatField(null=True, blank=True)
    ruggedness_tri = models.FloatField(null=True, blank=True)

    grid_latitude = models.FloatField(null=True, blank=True)
    grid_longitude = models.FloatField(null=True, blank=True)
    max_dry_days = models.FloatField(null=True, blank=True)
    peak_daily_mm = models.FloatField(null=True, blank=True)

    pdf_report = models.FileField(upload_to="reports/", null=True, blank=True)

    def __str__(self):
        return f"Assessment #{self.id} - {self.location_name or 'Unknown Location'}"