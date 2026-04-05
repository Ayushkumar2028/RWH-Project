from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Assessment
from .serializers import AssessmentSerializer
from .model_client import predict_rwh
from .pdf_utils import generate_assessment_pdf


@api_view(['GET'])
def health_check(request):
    return Response({"message": "Backend is running"})


@api_view(['POST'])
def create_assessment(request):
    data = request.data

    polygon_coordinates = data.get("polygon_coordinates", [])
    rooftop_area = data.get("rooftop_area", 0)

    if not polygon_coordinates or len(polygon_coordinates) < 3:
        return Response(
            {"error": "A valid polygon with at least 3 points is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if float(rooftop_area) <= 0:
        return Response(
            {"error": "Rooftop area must be greater than 0."},
            status=status.HTTP_400_BAD_REQUEST
        )

    latitude = polygon_coordinates[0].get("lat")
    longitude = polygon_coordinates[0].get("lng")

    model_input = {
        "location_name": data.get("location_name", ""),
        "polygon_coordinates": polygon_coordinates,
        "rooftop_area": float(rooftop_area),
    }

    try:
        prediction = predict_rwh(model_input)
    except Exception as e:
        return Response(
            {"error": f"Model prediction failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    assessment = Assessment.objects.create(
        location_name=data.get("location_name", ""),
        latitude=latitude,
        longitude=longitude,
        polygon_coordinates=polygon_coordinates,
        rooftop_area=float(rooftop_area),
        annual_potential=prediction.get("annual_potential"),
        recommended_tank_size=prediction.get("recommended_tank_size", ""),
        recharge_feasibility=prediction.get("recharge_feasibility", ""),
        structure_type=prediction.get("structure_type", ""),
        rainfall_estimate=prediction.get("rainfall_estimate", ""),
        hydrology_zone=prediction.get("hydrology_zone", ""),
        engineering_note=prediction.get("engineering_note", ""),
        soil_sand_pct=prediction.get("soil_sand_pct"),
        soil_clay_pct=prediction.get("soil_clay_pct"),
        slope_deg=prediction.get("slope_deg"),
        ruggedness_tri=prediction.get("ruggedness_tri"),
        grid_latitude=prediction.get("grid_latitude"),
        grid_longitude=prediction.get("grid_longitude"),
        max_dry_days=prediction.get("max_dry_days"),
        peak_daily_mm=prediction.get("peak_daily_mm"),
    )

    generate_assessment_pdf(assessment)

    serializer = AssessmentSerializer(assessment, context={"request": request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)
    

@api_view(['GET'])
def assessment_detail(request, pk):
    try:
        assessment = Assessment.objects.get(pk=pk)
    except Assessment.DoesNotExist:
        return Response(
            {"error": "Assessment not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = AssessmentSerializer(assessment, context={"request": request})
    return Response(serializer.data)


@api_view(['POST'])
def regenerate_pdf(request, pk):
    try:
        assessment = Assessment.objects.get(pk=pk)
    except Assessment.DoesNotExist:
        return Response(
            {"error": "Assessment not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    generate_assessment_pdf(assessment)

    serializer = AssessmentSerializer(assessment, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)