import pandas as pd
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import os
from datetime import datetime

def analyze_csv(file):
    import pandas as pd

    df = pd.read_csv(file)

    summary = {
        "total_equipment": len(df),
        "avg_flowrate": round(df["Flowrate"].mean(), 2),
        "avg_pressure": round(df["Pressure"].mean(), 2),
        "avg_temperature": round(df["Temperature"].mean(), 2),
        "type_distribution": df["Type"].value_counts().to_dict(),
        "equipment_list": []
    }

    for _, row in df.iterrows():
        summary["equipment_list"].append({
            "equipment_name": row["Equipment Name"],
            "type": row["Type"],
            "flowrate": row["Flowrate"],
            "pressure": row["Pressure"],
            "temperature": row["Temperature"]
        })

    return summary

def generate_pdf_report(summary, charts_dir="charts"):
    os.makedirs("reports", exist_ok=True)

    filename = f"reports/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=A4)

    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("<b>Chemical Equipment Analysis Report</b>", styles["Title"]))
    elements.append(Paragraph("<br/>", styles["Normal"]))

    # ---- SUMMARY TABLE ----
    summary_table = [
        ["Metric", "Value"],
        ["Total Equipment", summary.get("total_count", 0)],
        ["Average Flowrate", summary.get("average_flowrate", 0)],
        ["Average Pressure", summary.get("average_pressure", 0)],
        ["Average Temperature", summary.get("average_temperature", 0)],
    ]

    table = Table(summary_table, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))

    elements.append(table)
    elements.append(Paragraph("<br/>", styles["Normal"]))

    # ---- EQUIPMENT TYPE DISTRIBUTION ----
    elements.append(Paragraph("<b>Equipment Type Distribution</b>", styles["Heading2"]))

    dist_table = [["Type", "Count"]]
    for k, v in summary.get("equipment_type_distribution", {}).items():
        dist_table.append([k, v])

    dist = Table(dist_table, hAlign="LEFT")
    dist.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))

    elements.append(dist)

    doc.build(elements)
    return filename