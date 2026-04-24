import re
from io import BytesIO
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth


def generate_assessment_pdf(assessment):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 20 * mm

    left_x = 18 * mm
    right_x = width - 18 * mm
    label_x = 22 * mm
    value_x = 75 * mm
    right_margin = 20 * mm
    max_value_width = width - value_x - right_margin

    def new_page():
        nonlocal y
        p.showPage()
        y = height - 20 * mm

    def ensure_space(min_y=25 * mm):
        nonlocal y
        if y < min_y:
            new_page()

    def wrap_text(text, font_name="Helvetica", font_size=11, max_width=150):
        text = str(text or "")
        words = text.split()
        if not words:
            return [""]

        lines = []
        current_line = words[0]

        for word in words[1:]:
            test_line = f"{current_line} {word}"
            if stringWidth(test_line, font_name, font_size) <= max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word

        lines.append(current_line)
        return lines

    def section_divider():
        nonlocal y
        ensure_space()
        p.setStrokeColor(colors.HexColor("#D1D5DB"))
        p.setLineWidth(0.6)
        p.line(left_x, y, right_x, y)
        y -= 4 * mm

    def title(text, size=18):
        nonlocal y
        ensure_space()
        p.setFont("Helvetica-Bold", size)
        p.setFillColor(colors.HexColor("#0F172A"))
        p.drawString(left_x, y, text)
        y -= 9 * mm

    def subtitle(text):
        nonlocal y
        ensure_space()
        p.setFont("Helvetica-Bold", 13)
        p.setFillColor(colors.HexColor("#1E3A8A"))
        p.drawString(left_x, y, text)
        y -= 7 * mm
        p.setFillColor(colors.black)

    def line(label, value):
        nonlocal y
        wrapped_lines = wrap_text(
            value,
            font_name="Helvetica",
            font_size=11,
            max_width=max_value_width
        )

        ensure_space((len(wrapped_lines) + 1) * 6 * mm)

        p.setFont("Helvetica-Bold", 11)
        p.setFillColor(colors.HexColor("#111827"))
        p.drawString(label_x, y, f"{label}:")

        p.setFont("Helvetica", 11)
        p.setFillColor(colors.black)
        p.drawString(value_x, y, wrapped_lines[0])

        for extra_line in wrapped_lines[1:]:
            y -= 6 * mm
            ensure_space()
            p.drawString(value_x, y, extra_line)

        y -= 6 * mm

    def paragraph(text, font_size=11, start_x=22 * mm, max_width=None, leading=14):
        nonlocal y
        if max_width is None:
            max_width = width - 42 * mm

        wrapped_lines = []

        for part in str(text or "").split("\n"):
            if part.strip():
                wrapped_lines.extend(
                    wrap_text(
                        part,
                        font_name="Helvetica",
                        font_size=font_size,
                        max_width=max_width
                    )
                )
            else:
                wrapped_lines.append("")

        needed_height = max(12 * mm, len(wrapped_lines) * 5 * mm + 5 * mm)
        ensure_space(needed_height + 20 * mm)

        text_obj = p.beginText(start_x, y)
        text_obj.setFont("Helvetica", font_size)
        text_obj.setLeading(leading)

        for line_text in wrapped_lines:
            text_obj.textLine(line_text)

        p.drawText(text_obj)
        y -= len(wrapped_lines) * 5 * mm + 5 * mm

    def to_number(value):
        if value is None:
            return 0.0

        if isinstance(value, (int, float)):
            return float(value)

        text = str(value).strip()
        match = re.search(r"[-+]?\d*\.?\d+", text)
        return float(match.group()) if match else 0.0

    def get_efficiency_summary():
        area = to_number(assessment.rooftop_area)
        rainfall = to_number(assessment.rainfall_estimate)
        recharge = str(assessment.recharge_feasibility or "").strip().lower()

        score = 0

        if area >= 150:
            score += 3
        elif area >= 80:
            score += 2
        elif area > 0:
            score += 1

        if rainfall >= 1000:
            score += 3
        elif rainfall >= 700:
            score += 2
        elif rainfall > 0:
            score += 1

        if recharge in ["high", "good", "very high", "feasible"]:
            score += 3
        elif recharge in ["moderate", "medium"]:
            score += 2
        elif recharge in ["low", "poor"]:
            score += 1

        if score >= 8:
            label = "High Efficiency"
            note = (
                "This rooftop is highly suitable for rainwater harvesting and "
                "has strong potential for efficient water collection and storage."
            )
            border_color = colors.HexColor("#16A34A")
            fill_color = colors.HexColor("#F0FDF4")
        elif score >= 5:
            label = "Moderate Efficiency"
            note = (
                "This rooftop has good rainwater harvesting potential, but overall "
                "performance may vary depending on local site conditions."
            )
            border_color = colors.HexColor("#D97706")
            fill_color = colors.HexColor("#FFFBEB")
        else:
            label = "Low Efficiency"
            note = (
                "This rooftop has limited rainwater harvesting efficiency. It may still "
                "be useful, but expected performance is lower."
            )
            border_color = colors.HexColor("#DC2626")
            fill_color = colors.HexColor("#FEF2F2")

        return label, note, border_color, fill_color

    def draw_highlight_box(title_text, main_value, description, border_color, fill_color):
        nonlocal y

        desc_lines = wrap_text(
            description,
            font_name="Helvetica",
            font_size=10,
            max_width=width - 52 * mm
        )

        box_height = 18 * mm + (len(desc_lines) * 5 * mm)
        ensure_space(box_height + 15 * mm)

        x = 18 * mm
        box_width = width - 36 * mm
        box_top = y
        box_bottom = y - box_height

        p.setFillColor(fill_color)
        p.setStrokeColor(border_color)
        p.setLineWidth(1.2)
        p.roundRect(x, box_bottom, box_width, box_height, 4 * mm, stroke=1, fill=1)

        p.setFillColor(border_color)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(x + 6 * mm, box_top - 7 * mm, title_text)

        p.setFillColor(colors.HexColor("#111827"))
        p.setFont("Helvetica-Bold", 15)
        p.drawString(x + 6 * mm, box_top - 14 * mm, main_value)

        text_y = box_top - 21 * mm
        p.setFillColor(colors.black)
        p.setFont("Helvetica", 10)

        for line_text in desc_lines:
            p.drawString(x + 6 * mm, text_y, line_text)
            text_y -= 4.5 * mm

        y = box_bottom - 6 * mm

    def draw_quick_summary():
        nonlocal y

        summary_items = [
            ("Annual Harvest Potential", f"{assessment.annual_potential} liters/year"),
            ("Recommended Tank Size", assessment.recommended_tank_size or "Not available"),
            ("Recharge Feasibility", assessment.recharge_feasibility or "Not available"),
            ("Suggested Structure", assessment.structure_type or "Not available"),
        ]

        row_height = 8 * mm
        box_height = 10 * mm + len(summary_items) * row_height

        ensure_space(box_height + 10 * mm)

        x = 18 * mm
        box_width = width - 36 * mm
        box_top = y
        box_bottom = y - box_height

        p.setFillColor(colors.HexColor("#F8FAFC"))
        p.setStrokeColor(colors.HexColor("#CBD5E1"))
        p.setLineWidth(0.8)
        p.roundRect(x, box_bottom, box_width, box_height, 3 * mm, stroke=1, fill=1)

        p.setFillColor(colors.HexColor("#0F172A"))
        p.setFont("Helvetica-Bold", 12)
        p.drawString(x + 5 * mm, box_top - 7 * mm, "Quick Summary")

        row_y = box_top - 15 * mm
        for label, value in summary_items:
            p.setFont("Helvetica-Bold", 10.5)
            p.setFillColor(colors.HexColor("#111827"))
            p.drawString(x + 5 * mm, row_y, f"{label}:")

            wrapped = wrap_text(
                value,
                font_name="Helvetica",
                font_size=10.5,
                max_width=box_width - 62 * mm
            )
            p.setFont("Helvetica", 10.5)
            p.setFillColor(colors.black)
            p.drawString(x + 58 * mm, row_y, wrapped[0])

            extra_y = row_y
            for extra in wrapped[1:]:
                extra_y -= 4.5 * mm
                p.drawString(x + 58 * mm, extra_y, extra)

            row_y -= row_height + (len(wrapped) - 1) * 4 * mm

        y = box_bottom - 6 * mm

    title("AI-Powered Rainwater Harvesting Assessment Report")

    line("Assessment ID", assessment.id)
    line("Location", assessment.location_name or "Not provided")
    line("Created At", assessment.created_at.strftime("%Y-%m-%d %H:%M:%S"))

    y -= 1 * mm

    efficiency_label, efficiency_note, efficiency_border, efficiency_fill = get_efficiency_summary()

    draw_highlight_box(
        title_text="Overall Rooftop Efficiency",
        main_value=efficiency_label,
        description=efficiency_note,
        border_color=efficiency_border,
        fill_color=efficiency_fill
    )

    draw_quick_summary()

    section_divider()
    subtitle("Site Information")
    line("Rooftop Area", f"{assessment.rooftop_area} sq.m")
    line("Latitude", assessment.latitude)
    line("Longitude", assessment.longitude)
    line("Matched Grid", f"{assessment.grid_latitude}, {assessment.grid_longitude}")

    y -= 2 * mm

    section_divider()
    subtitle("AI Prediction Summary")
    line("Hydrology Zone", assessment.hydrology_zone)
    line("Annual Harvest Potential", f"{assessment.annual_potential} liters/year")
    line("Recommended Tank Size", assessment.recommended_tank_size)
    line("Recharge Feasibility", assessment.recharge_feasibility)
    line("Suggested Structure", assessment.structure_type)
    line("Rainfall Estimate", assessment.rainfall_estimate)

    y -= 2 * mm

    section_divider()
    subtitle("Terrain & Soil Analysis")
    line("Sand %", assessment.soil_sand_pct)
    line("Clay %", assessment.soil_clay_pct)
    line("Slope (deg)", f"{assessment.slope_deg} deg")
    line("Ruggedness TRI", f"{assessment.ruggedness_tri} index")
    line("Max Dry Days", f"{assessment.max_dry_days} days")
    line("Peak Daily Rainfall", f"{assessment.peak_daily_mm} mm/day")

    y -= 2 * mm
    
    section_divider()
    subtitle("AI Engineering Interpretation")
    paragraph(assessment.engineering_note or "No engineering insight available.")

    section_divider()
    subtitle("Polygon Coordinates")
    p.setFont("Helvetica", 9)
    p.setFillColor(colors.black)

    for idx, point in enumerate(assessment.polygon_coordinates, start=1):
        ensure_space()
        p.drawString(
            22 * mm,
            y,
            f"{idx}. lat: {point.get('lat')} , lng: {point.get('lng')}"
        )
        y -= 5 * mm

    y -= 4 * mm
    ensure_space()

    p.setStrokeColor(colors.HexColor("#D1D5DB"))
    p.line(left_x, y, right_x, y)
    y -= 5 * mm

    p.setFont("Helvetica-Oblique", 9)
    p.setFillColor(colors.HexColor("#4B5563"))

    footer_text = (
        "Generated using AI-based hydrology model trained on Indian climate, soil, and terrain data."
    )
    footer_lines = wrap_text(
        footer_text,
        font_name="Helvetica-Oblique",
        font_size=9,
        max_width=width - 40 * mm
    )

    for footer_line in footer_lines:
        p.drawString(20 * mm, y, footer_line)
        y -= 4 * mm

    p.save()

    pdf_bytes = buffer.getvalue()
    buffer.close()

    filename = f"assessment_report_{assessment.id}.pdf"
    assessment.pdf_report.save(filename, ContentFile(pdf_bytes), save=True)

    return assessment.pdf_report.url
