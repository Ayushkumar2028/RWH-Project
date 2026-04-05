from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import warnings

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "INDIA_HYDROLOGY_FINAL_LABELED.parquet"
MODEL_FILE = BASE_DIR / "hydro_ultimate_rf_model.pkl"

FEATURES = [
    "annual_avg_mm",
    "recent_10yr_avg_mm",
    "cv_reliability",
    "avg_max_dry_days",
    "p95_daily_mm",
    "peak_daily_mm",
    "trend_dry_days_per_year",
    "trend_rainy_days_per_year",
    "trend_sdii_intensity",
    "trend_p95_intensity",
    "trend_peak_intensity",
    "design_15min_filter_intensity_mm",
    "design_15min_overflow_intensity_mm",
    "avg_sand_pct",
    "avg_clay_pct",
    "ELEVATION_MEAN",
    "RELIEF_M",
    "RUGGEDNESS_TRI",
    "SLOPE_DEG",
    "CURVATURE",
]

_DF_CACHE = None
_MODEL_BUNDLE_CACHE = None


def load_system():
    global _DF_CACHE, _MODEL_BUNDLE_CACHE

    if _DF_CACHE is None or _MODEL_BUNDLE_CACHE is None:
        _DF_CACHE = pd.read_parquet(DATA_FILE)
        _MODEL_BUNDLE_CACHE = joblib.load(MODEL_FILE)

    return _DF_CACHE, _MODEL_BUNDLE_CACHE


def get_nearest_grid(target_lat, target_lon, df):
    distances = np.sqrt(
        (df["LATITUDE"] - target_lat) ** 2 + (df["LONGITUDE"] - target_lon) ** 2
    )
    nearest_idx = distances.idxmin()
    return df.loc[nearest_idx]


def consult_location(target_lat, target_lon, rooftop_area=150.0):
    df, bundle = load_system()

    model = bundle["model"]
    scaler = bundle["scaler"]
    label_map = bundle["label_map"]

    grid = get_nearest_grid(target_lat, target_lon, df)

# 🔥 Use correct features from scaler
    model_features = scaler.feature_names_in_

    X_input = grid[model_features].to_frame().T

# Scale
    X_scaled = scaler.transform(X_input)

# Predict
    predicted_class = model.predict(X_scaled)[0]

# Map label
    predicted_label = label_map.get(predicted_class, str(predicted_class))

    # Extract useful real-world variables
    rain = float(grid["recent_10yr_avg_mm"])
    peak_storm = float(grid["peak_daily_mm"])
    dry_days = float(grid["avg_max_dry_days"])
    clay = float(grid["avg_clay_pct"])
    sand = float(grid["avg_sand_pct"])
    slope = float(grid["SLOPE_DEG"])
    rugged = float(grid["RUGGEDNESS_TRI"])

    # Rooftop harvest estimate
    runoff_coefficient = 0.85
    harvest_liters = round(rain * float(rooftop_area) * runoff_coefficient, 2)

    # Tank recommendation
    recommended_tank_size = (
        "2000 liters" if rooftop_area < 50 else
        "5000 liters" if rooftop_area < 120 else
        "10000 liters"
    )

    # Engineering interpretation based on actual model labels
    structure = "Custom Assessment Required"
    warning = "Standard operational parameters."
    recharge_feasibility = "Moderate"

    if predicted_label == "High Potential":
        structure = "Standard Recharge Pit with Desilting Chamber"
        recharge_feasibility = "High"

        if peak_storm > 150:
            warning = (
                f"HIGH POTENTIAL with flash-flood risk: extreme historical storm "
                f"({peak_storm:.0f} mm/day). Upsize overflow pipes by 30%."
            )
        else:
            warning = (
                f"Excellent recharge conditions. Sand content: {sand:.1f}%, "
                f"slope: {slope:.1f}°."
            )

    elif predicted_label == "Moderate Suitability":
        structure = "Hybrid System (Filter -> Tank -> Soak Pit)"
        recharge_feasibility = "Moderate"
        warning = (
            f"Moderate suitability. Longest dry spell is {dry_days:.0f} days. "
            f"Tank sizing should prioritize longer dry periods."
        )

    elif predicted_label == "Water Stressed":
        structure = "Storage Tank + Controlled Recharge"
        recharge_feasibility = "Low"
        warning = (
            f"Water stressed zone. Recharge performance may be limited. "
            f"Clay: {clay:.1f}%, Sand: {sand:.1f}%."
        )

    elif predicted_label == "Critical Scarcity":
        structure = "Above-Ground Cistern / Conservation Storage"
        recharge_feasibility = "Low"
        warning = (
            f"Critical scarcity zone. Prioritize storage over infiltration. "
            f"Peak storm: {peak_storm:.0f} mm/day, slope: {slope:.1f}°."
        )

    return {
        "hydrology_zone": predicted_label,
        "annual_potential": harvest_liters,
        "recommended_tank_size": recommended_tank_size,
        "recharge_feasibility": recharge_feasibility,
        "structure_type": structure,
        "rainfall_estimate": f"{rain:.0f} mm/year",
        "engineering_note": warning,
        "soil_sand_pct": round(sand, 2),
        "soil_clay_pct": round(clay, 2),
        "slope_deg": round(slope, 2),
        "ruggedness_tri": round(rugged, 2),
        "grid_latitude": round(float(grid["LATITUDE"]), 4),
        "grid_longitude": round(float(grid["LONGITUDE"]), 4),
        "max_dry_days": round(dry_days, 2),
        "peak_daily_mm": round(peak_storm, 2),
    }


if __name__ == "__main__":
    try:
        result = consult_location(29.6, 74.3, rooftop_area=150)
        print(result)
    except FileNotFoundError:
        print("Error: Dataset or model file not found in ml_model folder.")