import PersonaDashboard from "@/components/PersonaDashboard";
import personasJson from "@/data/personas/personas.json";
import type { VBridgePersona } from "@/types/persona";

const personas = personasJson as VBridgePersona[];

export default function Home() {
  return <PersonaDashboard personas={personas} />;
}
