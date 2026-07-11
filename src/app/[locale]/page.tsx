import { GeneratorConfig } from "@/types";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const defaultConfig: GeneratorConfig = {
    repoUrl: process.env.GIT_REPOSITORY_URL || "",
    startDate: process.env.START_DATE || "2014",
    endDate: process.env.END_DATE || "present",
    frequencies: process.env.FREQUENCIES_DEFAULT || "30,50,45,35,53",
    maxCommitsPerDay: 5,
    noWeekends: true,
    vacationsPerYear: "2",
    vacationLengthDays: process.env.VACATION_LENGTH_DAYS || "14,28,21",
    chaos: 50,
    realism: 100,
    paintedLayer: {},
    showAlgoLayer: true,
    showPaintedLayer: true,
    showPaintedInOrange: true,
    layers: [{ id: "raster-2026", name: "Painted", type: "raster", visible: true, year: 2026, data: {} }],
    activeLayerId: "raster-layer"
  };

  return <Dashboard initialConfig={defaultConfig} />;
}
