import PersonaDashboard from "@/components/PersonaDashboard";
import personasJson from "@/data/personas/personas.json";
import type { VBridgePersona } from "@/types/persona";

const personas = personasJson as VBridgePersona[];

export default function Home() {
  return (
    <>
      <PersonaDashboard personas={personas} />

      <section className="border-t border-slate-200 bg-[#eef4fb] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1f73d2]">
                Embedded Integration Workspace
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-[#12315b] sm:text-3xl">
                Apollo.io Free API Lab
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Guided zero-credit Apollo API samples with dummy test criteria, field-level help and server-side credential protection.
              </p>
            </div>
            <a
              href="/apollo-free-lab"
              target="_blank"
              rel="noreferrer"
              className="w-fit rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0b4ea2] shadow-sm transition hover:bg-blue-50"
            >
              Open Lab Full Screen ↗
            </a>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,55,100,0.12)]">
            <iframe
              src="/apollo-free-lab"
              title="V-Bridge Apollo.io Free API Lab"
              className="h-[1500px] w-full border-0 bg-white"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
