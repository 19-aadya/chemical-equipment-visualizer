import sys
import os
import requests
import matplotlib.pyplot as plt
import numpy as np
from PyQt5.QtWidgets import (
    QApplication,
    QPushButton,
    QFileDialog,
    QLabel,
    QVBoxLayout,
    QWidget,
    QMessageBox,
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

# ---------------- CONFIG ----------------
API_URL = "http://127.0.0.1:8000/api/upload/"
CHART_DIR = "desktop_reports/charts"
os.makedirs(CHART_DIR, exist_ok=True)

# ---------------- PLOT STYLE CONFIG ----------------
plt.style.use('seaborn-v0_8-darkgrid')
COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E']

# ---------------- PLOT FUNCTIONS ----------------
def plot_type_distribution(type_dist):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CHART_DIR = os.path.join(BASE_DIR, "desktop_reports", "charts")
    os.makedirs(CHART_DIR, exist_ok=True)
    
    labels = list(type_dist.keys())
    values = [int(v) for v in type_dist.values()]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(labels, values, color=COLORS[:len(labels)], 
                   edgecolor='white', linewidth=1.5, alpha=0.85)
    
    # Add value labels on top of bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    ax.set_title("Equipment Type Distribution", fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel("Equipment Type", fontsize=12, fontweight='bold')
    ax.set_ylabel("Count", fontsize=12, fontweight='bold')
    
    # Fix X-axis overlap with better rotation and alignment
    plt.xticks(rotation=45, ha="right", fontsize=10)
    ax.grid(axis="y", linestyle="--", alpha=0.3, linewidth=0.8)
    ax.set_axisbelow(True)
    
    # Add subtle background
    ax.set_facecolor('#f8f9fa')
    fig.patch.set_facecolor('white')
    
    plt.tight_layout()
    output_path = os.path.join(CHART_DIR, "equipment_type_distribution.png")
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    return output_path


def plot_average_metrics(summary):
    labels = ["Flowrate", "Pressure", "Temperature"]
    values = [
        summary["avg_flowrate"],
        summary["avg_pressure"],
        summary["avg_temperature"],
    ]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(labels, values, color=['#3498db', '#e74c3c', '#f39c12'],
                   edgecolor='white', linewidth=1.5, alpha=0.85, width=0.6)
    
    # Add value labels
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.2f}',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    ax.set_title("Average Equipment Parameters", fontsize=16, fontweight='bold', pad=20)
    ax.set_ylabel("Average Value", fontsize=12, fontweight='bold')
    ax.set_xlabel("Parameter", fontsize=12, fontweight='bold')
    
    plt.xticks(fontsize=11)
    ax.grid(axis="y", linestyle="--", alpha=0.3, linewidth=0.8)
    ax.set_axisbelow(True)
    
    # Add subtle background
    ax.set_facecolor('#f8f9fa')
    fig.patch.set_facecolor('white')
    
    plt.tight_layout()
    path = os.path.join(CHART_DIR, "average_parameters.png")
    plt.savefig(path, dpi=300, bbox_inches='tight')
    plt.close()
    return path


# ---------------- UI ----------------
class DesktopApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Visualizer")
        self.setGeometry(200, 200, 500, 280)
        self.setStyleSheet("""
            QWidget {
                background-color: #f5f5f5;
            }
            QLabel {
                color: #2c3e50;
                font-size: 14px;
                padding: 10px;
                background-color: white;
                border-radius: 5px;
                border: 1px solid #ddd;
            }
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
                border-radius: 6px;
                min-height: 40px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:pressed {
                background-color: #21618c;
            }
        """)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(15)
        
        # Title label
        title_label = QLabel("Chemical Equipment Visualizer")
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title_label.setFont(title_font)
        title_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(title_label)
        
        # Instruction label
        self.label = QLabel("Upload a CSV file to analyze equipment data")
        self.label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.label)
        
        # Upload button
        self.upload_btn = QPushButton("📁 Upload CSV File")
        self.upload_btn.clicked.connect(self.upload_csv)
        layout.addWidget(self.upload_btn)
        
        layout.addStretch()
        self.setLayout(layout)
    
    def upload_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Select CSV File",
            "",
            "CSV Files (*.csv)"
        )
        if not file_path:
            return
        
        try:
            with open(file_path, "rb") as f:
                response = requests.post(
                    API_URL,
                    files={"file": f}
                )
            
            if response.status_code != 200:
                raise Exception(response.text)
            
            data = response.json()
            type_chart = plot_type_distribution(data["type_distribution"])
            avg_chart = plot_average_metrics(data)
            
            msg = QMessageBox(self)
            msg.setIcon(QMessageBox.Information)
            msg.setWindowTitle("Upload Successful")
            msg.setText("CSV processed successfully!")
            msg.setInformativeText(
                f"Total Equipment: {data['total_equipment']}\n\n"
                f"Charts saved:\n"
                f"• {os.path.basename(type_chart)}\n"
                f"• {os.path.basename(avg_chart)}"
            )
            msg.setStyleSheet("""
                QMessageBox {
                    background-color: white;
                }
                QLabel {
                    color: #2c3e50;
                    font-size: 13px;
                }
            """)
            msg.exec_()
            
        except Exception as e:
            msg = QMessageBox(self)
            msg.setIcon(QMessageBox.Critical)
            msg.setWindowTitle("Error")
            msg.setText("An error occurred")
            msg.setInformativeText(str(e))
            msg.setStyleSheet("""
                QMessageBox {
                    background-color: white;
                }
            """)
            msg.exec_()


# ---------------- MAIN ----------------
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DesktopApp()
    window.show()
    sys.exit(app.exec_())