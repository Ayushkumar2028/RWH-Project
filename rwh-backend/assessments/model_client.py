from ml_model.consult_expert import consult_location


def get_polygon_centroid(polygon):
    lat = sum(point["lat"] for point in polygon) / len(polygon)
    lng = sum(point["lng"] for point in polygon) / len(polygon)
    return lat, lng


def predict_rwh(data):
    polygon = data.get("polygon_coordinates", [])
    rooftop_area = float(data.get("rooftop_area", 0))

    if not polygon:
        raise ValueError("Polygon coordinates are required")

    centroid_lat, centroid_lng = get_polygon_centroid(polygon)

    result = consult_location(
        target_lat=centroid_lat,
        target_lon=centroid_lng,
        rooftop_area=rooftop_area
    )

    print("REAL MODEL CALLED")
    print("Model result:", result)

    return result