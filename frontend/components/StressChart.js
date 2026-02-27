import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, Text } from "@chakra-ui/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const levelColor = (score) => {
  if (score <= 33) return "#4caf50";
  if (score <= 66) return "#ff9800";
  return "#f44336";
};

export default function StressChart({ records }) {
  if (!records || records.length === 0) {
    return (
      <Box p={4} textAlign="center" color="gray.400">
        <Text>No hay historial de estrés todavía.</Text>
      </Box>
    );
  }

  const labels = records.map((r) => {
    const d = new Date(r.timestamp);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  const scores = records.map((r) => r.stress_score);
  const pointColors = scores.map(levelColor);

  const data = {
    labels,
    datasets: [
      {
        label: "Nivel de estrés",
        data: scores,
        borderColor: "#667eea",
        backgroundColor: "rgba(102,126,234,0.15)",
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const r = records[ctx.dataIndex];
            return [
              `Estrés: ${ctx.parsed.y.toFixed(1)}`,
              `Nivel: ${r.stress_level}`,
              r.has_biometrics ? "📱 Con datos biométricos" : "📝 Solo check-in",
            ];
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (v) => {
            if (v === 33) return "↑ Bajo";
            if (v === 66) return "↑ Medio";
            if (v === 100) return "Alto";
            return v;
          },
        },
        grid: {
          color: (ctx) => {
            if (ctx.tick.value === 33 || ctx.tick.value === 66)
              return "rgba(0,0,0,0.15)";
            return "rgba(0,0,0,0.05)";
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
