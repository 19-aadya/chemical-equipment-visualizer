import { useState, useEffect } from "react";
import { Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom SVG Icons
const Icons = {
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
  ),
  Activity: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Database: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Droplet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  Gauge: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Zap: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  PieChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  Layers: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  )
};

function App() {
  const [data, setData] = useState(null);
  const [selectedView, setSelectedView] = useState("overview");
  const [animateCards, setAnimateCards] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);


  useEffect(() => {
    if (data) {
      setAnimateCards(true);
    }
  }, [data]);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const res = await fetch("http://127.0.0.1:8000/api/history/");
        const hist = await res.json();
        setHistory(hist);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
  
    fetchHistory();
  }, []);
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      // Upload CSV
      const res = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData
      });
  
      if (!res.ok) {
        throw new Error("Upload failed");
      }
  
      const responseData = await res.json();
      console.log("Backend response:", responseData);
  
      // Update main dashboard data
      setData(responseData);
  
      // 🔁 Refresh upload history (LAST 5 DATASETS)
      const histRes = await fetch("http://127.0.0.1:8000/api/history/");
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }
  
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Make sure the Django server is running.");
    } finally {
      setUploading(false);
    }
  };
  

  // Safe data extraction using your first code's logic
  const equipmentList = data?.equipment_list || [];
  const typeDistribution = data?.type_distribution || {};
  const totalEquipment = data?.total_equipment ?? 0;
  const avgFlowrate = data?.avg_flowrate ?? 0;
  const avgPressure = data?.avg_pressure ?? 0;
  const avgTemperature = data?.avg_temperature ?? 0;

  const statCards = [
    {
      icon: Icons.Database,
      label: "Total Equipment",
      value: totalEquipment,
      color: "from-cyan-500 to-blue-600",
      unit: ""
    },
    {
      icon: Icons.Droplet,
      label: "Avg Flowrate",
      value: avgFlowrate,
      color: "from-purple-500 to-pink-600",
      unit: " L/min"
    },
    {
      icon: Icons.Gauge,
      label: "Avg Pressure",
      value: avgPressure,
      color: "from-orange-500 to-red-600",
      unit: " bar"
    },
    {
      icon: Icons.Zap,
      label: "Avg Temperature",
      value: avgTemperature,
      color: "from-green-500 to-emerald-600",
      unit: " °C"
    }
  ];

  // Normalize function for radar chart
  const normalize = (arr) => {
    if (arr.length === 0) return [];
    const max = Math.max(...arr);
    return arr.map((v) => (max ? (v / max) * 100 : 0));
  };

  const radarLabels = equipmentList
    .slice(0, 5)
    .map((e) => e.equipment_name || e.name || "Unknown");

  const radarFlow = normalize(
    equipmentList.slice(0, 5).map((e) => e.flowrate || 0)
  );
  const radarPressure = normalize(
    equipmentList.slice(0, 5).map((e) => e.pressure || 0)
  );
  const radarTemp = normalize(
    equipmentList.slice(0, 5).map((e) => e.temperature || 0)
  );

  const chartData = {
    bar: {
      labels: Object.keys(typeDistribution),
      datasets: [{
        label: "Equipment Count",
        data: Object.values(typeDistribution),
        backgroundColor: [
          "rgba(6, 182, 212, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(244, 63, 94, 0.8)"
        ],
        borderColor: [
          "rgb(6, 182, 212)",
          "rgb(168, 85, 247)",
          "rgb(251, 146, 60)",
          "rgb(34, 197, 94)",
          "rgb(244, 63, 94)"
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    doughnut: {
      labels: Object.keys(typeDistribution),
      datasets: [{
        data: Object.values(typeDistribution),
        backgroundColor: [
          "rgba(6, 182, 212, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(244, 63, 94, 0.8)"
        ],
        borderColor: "rgb(15, 23, 42)",
        borderWidth: 3
      }]
    },
    radar: {
      labels: radarLabels,
      datasets: [
        {
          label: "Flowrate",
          data: radarFlow,
          backgroundColor: "rgba(6, 182, 212, 0.2)",
          borderColor: "rgb(6, 182, 212)",
          borderWidth: 2
        },
        {
          label: "Pressure",
          data: radarPressure,
          backgroundColor: "rgba(168, 85, 247, 0.2)",
          borderColor: "rgb(168, 85, 247)",
          borderWidth: 2
        },
        {
          label: "Temperature",
          data: radarTemp,
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 2
        }
      ]
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))", color: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Animated Background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "80px", left: "40px", width: "288px", height: "288px", background: "rgb(6, 182, 212)", borderRadius: "50%", mixBlendMode: "multiply", filter: "blur(60px)", opacity: 0.2, animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}></div>
        <div style={{ position: "absolute", top: "160px", right: "80px", width: "384px", height: "384px", background: "rgb(168, 85, 247)", borderRadius: "50%", mixBlendMode: "multiply", filter: "blur(60px)", opacity: 0.2, animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "700ms" }}></div>
        <div style={{ position: "absolute", bottom: "-80px", left: "160px", width: "320px", height: "320px", background: "rgb(236, 72, 153)", borderRadius: "50%", mixBlendMode: "multiply", filter: "blur(60px)", opacity: 0.2, animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "1000ms" }}></div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, backdropFilter: "blur(12px)", background: "rgba(15, 23, 42, 0.5)", borderBottom: "1px solid rgba(6, 182, 212, 0.3)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "12px", background: "linear-gradient(to bottom right, rgb(6, 182, 212), rgb(147, 51, 234))", borderRadius: "12px", boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}>
                <Icons.Activity />
              </div>
              <div>
                <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", background: "linear-gradient(to right, rgb(103, 232, 249), rgb(192, 132, 252), rgb(251, 182, 206))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0 }}>
                  Chemical Equipment Visualizer
                </h1>
                <p style={{ fontSize: "0.875rem", color: "rgb(148, 163, 184)", marginTop: "4px" }}>
                  Advanced Analytics Dashboard
                </p>
              </div>
            </div>

            <label style={{ cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", background: uploading ? "rgb(71, 85, 105)" : "linear-gradient(to right, rgb(8, 145, 178), rgb(147, 51, 234))", borderRadius: "12px", boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)", transition: "all 0.3s", fontWeight: 600 }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(6, 182, 212, 0.7)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.5)";
                }}>
                {uploading ? (
                  <>
                    <div style={{ animation: "spin 1s linear infinite" }}>
                      <Icons.Activity />
                    </div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Icons.Upload />
                    <span>Upload CSV</span>
                  </>
                )}
              </div>
              <input
                type="file"
                style={{ display: "none" }}
                accept=".csv"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
        {!data ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "500px", textAlign: "center" }}>
            <div style={{ position: "relative", marginBottom: "32px" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgb(6, 182, 212), rgb(147, 51, 234))", borderRadius: "50%", filter: "blur(40px)", opacity: 0.5, animation: "pulse 4s infinite" }}></div>
              <div style={{ position: "relative", padding: "32px", background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(12px)", borderRadius: "50%", border: "2px dashed rgba(6, 182, 212, 0.5)" }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgb(34, 211, 238)" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "12px" }}>
              Upload Equipment Data
            </h2>
            <p style={{ color: "rgb(148, 163, 184)", maxWidth: "448px" }}>
              Drop your CSV file to start analyzing chemical equipment parameters with real-time visualizations
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
              {statCards.map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(30, 41, 59, 0.5)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                    transition: "all 0.3s",
                    animation: animateCards ? `slideUp 0.5s ease-out ${idx * 100}ms both` : "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.5)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(6, 182, 212, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(51, 65, 85, 0.5)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ color: "rgb(148, 163, 184)", fontSize: "0.875rem", marginBottom: "8px" }}>
                        {card.label}
                      </p>
                      <p style={{ fontSize: "1.875rem", fontWeight: "bold", background: "linear-gradient(to right, white, rgb(203, 213, 225))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {card.value.toFixed(card.unit ? 1 : 0)}{card.unit}
                      </p>
                    </div>
                    <div style={{ padding: "12px", background: `linear-gradient(to bottom right, ${card.color.split(' ')[0].replace('from-', 'rgb(')})`, borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                      <card.icon />
                    </div>
                  </div>
                  <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "rgb(52, 211, 153)" }}>
                    <Icons.TrendingUp />
                    <span>Active</span>
                  </div>
                </div>
              ))}
            </div>

            {/* View Selector */}
            <div style={{ display: "flex", gap: "12px", background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", padding: "8px", border: "1px solid rgba(51, 65, 85, 0.5)", width: "fit-content", flexWrap: "wrap" }}>
              {[
                { id: "overview", icon: Icons.BarChart, label: "Overview" },
                { id: "distribution", icon: Icons.PieChart, label: "Distribution" },
                { id: "comparison", icon: Icons.Layers, label: "Comparison" }
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setSelectedView(view.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    transition: "all 0.3s",
                    border: "none",
                    cursor: "pointer",
                    background: selectedView === view.id ? "linear-gradient(to right, rgb(8, 145, 178), rgb(147, 51, 234))" : "transparent",
                    color: selectedView === view.id ? "white" : "rgb(148, 163, 184)",
                    boxShadow: selectedView === view.id ? "0 0 20px rgba(6, 182, 212, 0.5)" : "none"
                  }}
                >
                  <view.icon />
                  {view.label}
                </button>
              ))}
            </div>
      

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: selectedView === "overview" ? "repeat(auto-fit, minmax(400px, 1fr))" : "1fr", gap: "24px" }}>
              {selectedView === "overview" && (
                <>
                  <div style={{ background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(51, 65, 85, 0.5)" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icons.BarChart />
                      Equipment Distribution
                    </h3>
                    <Bar data={chartData.bar} options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: 'rgb(148, 163, 184)' } },
                        x: { grid: { display: false }, ticks: { color: 'rgb(148, 163, 184)' } }
                      }
                    }} />
                  </div>

                  <div style={{ background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(51, 65, 85, 0.5)" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icons.Layers />
                      Performance Radar
                    </h3>
                    <Radar data={chartData.radar} options={{
                      responsive: true,
                      plugins: { legend: { labels: { color: 'rgb(148, 163, 184)' } } },
                      scales: {
                        r: {
                          grid: { color: 'rgba(148, 163, 184, 0.1)' },
                          ticks: { color: 'rgb(148, 163, 184)', backdropColor: 'transparent' },
                          pointLabels: { color: 'rgb(148, 163, 184)' }
                        }
                      }
                    }} />
                  </div>
                </>
              )}

              {selectedView === "distribution" && (
                <div style={{ background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "32px", border: "1px solid rgba(51, 65, 85, 0.5)" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icons.PieChart />
                    Type Distribution Analysis
                  </h3>
                  <div style={{ maxWidth: "448px", margin: "0 auto" }}>
                    <Doughnut data={chartData.doughnut} options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: 'rgb(148, 163, 184)', padding: 20, font: { size: 12 } }
                        }
                      }
                    }} />
                  </div>
                </div>
              )}

              {selectedView === "comparison" && (
                <div style={{ background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(51, 65, 85, 0.5)" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icons.Layers />
                    Equipment Comparison Table
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgb(51, 65, 85)" }}>
                          <th style={{ textAlign: "left", padding: "12px 16px", color: "rgb(34, 211, 238)" }}>Equipment</th>
                          <th style={{ textAlign: "left", padding: "12px 16px", color: "rgb(192, 132, 252)" }}>Type</th>
                          <th style={{ textAlign: "left", padding: "12px 16px", color: "rgb(251, 182, 206)" }}>Flowrate</th>
                          <th style={{ textAlign: "left", padding: "12px 16px", color: "rgb(251, 146, 60)" }}>Pressure</th>
                          <th style={{ textAlign: "left", padding: "12px 16px", color: "rgb(52, 211, 153)" }}>Temp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipmentList.map((eq, idx) => (
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid rgb(30, 41, 59)", transition: "background 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(51, 65, 85, 0.3)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "12px 16px", fontWeight: 500 }}>{eq.equipment_name || eq.name}</td>
                            <td style={{ padding: "12px 16px" }}>{eq.type}</td>
                            <td style={{ padding: "12px 16px" }}>{eq.flowrate} L/min</td>
                            <td style={{ padding: "12px 16px" }}>{eq.pressure} bar</td>
                            <td style={{ padding: "12px 16px" }}>{eq.temperature} °C</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {/* Upload History */}
            <div style={{background: "rgba(30, 41, 59, 0.5)",backdropFilter: "blur(12px)",borderRadius: "16px",padding: "20px",border: "1px solid rgba(51, 65, 85, 0.5)"}}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "12px" }}>
            Upload History (Last 5)
           </h3>
{loadingHistory ? (
    <p style={{ color: "rgb(148,163,184)" }}>Loading history...</p>
  ) : history.length === 0 ? (
    <p style={{ color: "rgb(148,163,184)" }}>No previous uploads</p>
  ) : (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {history.map((item, idx) => (
        <li
          key={idx}
          onClick={() => setData(item.summary)}
          style={{
            cursor: "pointer",
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "8px",
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(51,65,85,0.5)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(51,65,85,0.5)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(15,23,42,0.6)")
          }
        >
          <div style={{ fontWeight: 600 }}>{item.filename}</div>
          <div style={{ fontSize: "0.75rem", color: "rgb(148,163,184)" }}>
            {new Date(item.uploaded_at).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;