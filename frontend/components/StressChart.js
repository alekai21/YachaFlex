import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { getStressColor, STRESS_THRESHOLDS } from "../lib/constants";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { low, medium } = STRESS_THRESHOLDS;

export default function StressChart({ records }) {
  const tooltipBg      = useColorModeValue("#ffffff", "#111111");
  const tooltipBorder  = useColorModeValue("#d0d0d0", "#2a2a2a");
  const titleColor     = useColorModeValue("#1a1a1a", "#c0c0c0");
  const bodyColor      = useColorModeValue("#555555", "#8a8a8a");
  const tickColor      = useColorModeValue("#888888", "#6d6b6b");
  const gridColor      = useColorModeValue("rgba(200,200,200,0.7)", "rgba(72,72,72,0.7)");
  const axisColor      = useColorModeValue("#d0d0d0", "#484848");
  const lineColor      = useColorModeValue("#888888", "#8a8a8a");
  const fillColor      = useColorModeValue("rgba(100,100,100,0.06)", "rgba(138,138,138,0.06)");

  if (!records || records.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text color="ui.textMuted" fontSize="sm" letterSpacing="0.05em">
          SIN HISTORIAL DE ESTRES TODAVIA
        </Text>
      </Box>
    );
  }

  const labels = records.map((r) => {
    const d = new Date(r.timestamp);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  const scores = records.map((r) => r.stress_score);
  const pointColors = scores.map(getStressColor);

  const data = {
    labels,
    datasets: [
      {
        label: "Nivel de estres",
        data: scores,
        borderColor: lineColor,
        backgroundColor: fillColor,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: titleColor,
        bodyColor: bodyColor,
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const r = records[ctx.dataIndex];
            return [
              `Estres: ${ctx.parsed.y.toFixed(1)}`,
              `Nivel: ${r.stress_level.toUpperCase()}`,
              r.has_biometrics ? "Con datos biometricos" : "Solo check-in",
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: tickColor, font: { size: 11, family: "monospace" } },
        grid: { color: gridColor },
        border: { color: axisColor },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: tickColor,
          font: { size: 11, family: "monospace" },
          callback: (v) => {
            if (v === low) return "BAJO";
            if (v === medium) return "MEDIO";
            if (v === 100) return "ALTO";
            return v === 0 ? "0" : "";
          },
        },
        grid: {
          color: (ctx) => {
            if (ctx.tick.value === low) return "rgba(0,232,122,0.2)";
            if (ctx.tick.value === medium) return "rgba(255,149,0,0.2)";
            return gridColor;
          },
        },
        border: { color: axisColor },
      },
    },
  };

  return <Line data={data} options={options} />;
}
