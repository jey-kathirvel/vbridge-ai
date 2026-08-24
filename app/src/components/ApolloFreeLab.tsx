"use client";

import { FormEvent, useMemo, useState } from "react";

type Operation =
  | "contacts-search"
  | "accounts-search"
  | "users"
  | "api-usage"
  | "credit-usage"
  | "deal-create"
  | "deal-view"
  | "people-search";

type FormState = {
  keywords: string;
  organizationName: string;
  page: string;
  perPage: string;
  dealName: string;
  amount: string;
  closedDate: string;
  accountId: string;
  dealId: string;
};

type JsonRecord = Record<string, unknown>;

type OperationDefinition = {
  id: Operation;
  title: string;
  subtitle: string;
  description: string;
  status: "FREE_VERIFIED" | "ZERO_CREDIT_TEST" | "PAID_PLAN";
  help: string;
};

const operations: OperationDefinition[] = [
  {
    id: "contacts-search",
    title: "Saved Contacts",
    subtitle: "Search workspace contacts",
    description: "Search contacts already stored in this Apollo workspace.",
    status: "FREE_VERIFIED",
    help: "This searches your Apollo workspace only. It does not search Apollo's global people database.",
  },
  {
    id: "accounts-search",
    title: "Saved Accounts",
    subtitle: "Search saved companies",
    description: "Search companies already stored as accounts in this Apollo workspace.",
    status: "FREE_VERIFIED",
    help: "This searches your saved Apollo accounts. It is different from global Company Search.",
  },
  {
    id: "users",
    title: "Apollo Users",
    subtitle: "Workspace users",
    description: "Retrieve users associated with the configured Apollo workspace.",
    status: "FREE_VERIFIED",
    help: "Useful for administration and for retrieving owner IDs used by other Apollo APIs.",
  },
  {
    id: "api-usage",
    title: "API Usage",
    subtitle: "Usage and rate limits",
    description: "View API usage statistics reported for this Apollo workspace.",
    status: "FREE_VERIFIED",
    help: "Use this to understand request consumption and rate-limit safety.",
  },
  {
    id: "credit-usage",
    title: "Credit Usage",
    subtitle: "Credit safety",
    description: "View credit usage information reported for this Apollo workspace.",
    status: "FREE_VERIFIED",
    help: "Useful before any future credit-consuming enrichment features are enabled.",
  },
  {
    id: "deal-create",
    title: "Create Deal",
    subtitle: "Create Apollo opportunity",
    description: "Create a sales opportunity in Apollo using a unique V-Bridge deal name.",
    status: "ZERO_CREDIT_TEST",
    help: "This is a WRITE operation: clicking Run creates a real deal in your Apollo workspace. Apollo documents Create Deal as 0 credits. V-Bridge automatically appends a timestamp/random suffix so the final deal name is unique.",
  },
  {
    id: "deal-view",
    title: "View Deal",
    subtitle: "Retrieve deal by ID",
    description: "Retrieve the full details of one Apollo opportunity by its deal ID.",
    status: "ZERO_CREDIT_TEST",
    help: "Paste the deal ID returned by Create Deal, or another Apollo opportunity ID. Apollo documents View Deal as 0 credits.",
  },
  {
    id: "people-search",
    title: "People Search",
    subtitle: "Global prospect search",
    description: "Apollo global People Search is not included in the current Free plan.",
    status: "PAID_PLAN",
    help: "Your Apollo account returned HTTP 403 API_INACCESSIBLE, so V-Bridge blocks this operation locally.",
  },
];

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  return "—";
}

function HelpTip({ label, help }: { label: string; help: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`${label} help`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-black text-blue-700"
      >
        ?
      </button>
      {open && (
        <span role="tooltip" className="absolute bottom-7 left-1/2 z-[100] w-72 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2 text-left text-xs font-medium leading-5 text-white shadow-2xl">
          {help}
        </span>
      )}
    </span>
  );
}

function Field({ label, value, onChange, help, type = "text", required = false, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
  type?: "text" | "number" | "date";
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
        {label}{required && <span className="text-red-500">*</span>}<HelpTip label={label} help={help} />
      </span>
      <input type={type} value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
      <span className="mt-2 block text-xs leading-5 text-slate-500">{help}</span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500">{label}</p><p className="mt-2 break-words text-xl font-extrabold text-[#12315b]">{value}</p></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">{text}</div>;
}

function ContactResults({ response }: { response: unknown }) {
  const root = asRecord(response);
  const data = asRecord(root?.data);
  const contacts = asArray(data?.contacts).map(asRecord).filter(Boolean) as JsonRecord[];
  const pagination = asRecord(data?.pagination);
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Returned" value={contacts.length} /><Metric label="Workspace total" value={display(pagination?.total_entries)} /><Metric label="Page" value={display(pagination?.page)} /></div>{contacts.length === 0 ? <EmptyState text="No saved contacts matched this search." /> : <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-left text-xs"><thead className="bg-slate-50"><tr>{["Name","Title","Organization","Email","Phones","Source"].map((item) => <th key={item} className="px-4 py-3 font-extrabold">{item}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{contacts.map((contact, index) => <tr key={display(contact.id) + index}><td className="px-4 py-3 font-bold">{display(contact.name)}</td><td className="px-4 py-3">{display(contact.title)}</td><td className="px-4 py-3">{display(contact.organization_name)}</td><td className="px-4 py-3">{display(contact.email)}</td><td className="px-4 py-3">{asArray(contact.phone_numbers).length}</td><td className="px-4 py-3">{display(contact.source_display_name ?? contact.source)}</td></tr>)}</tbody></table></div>}</div>;
}

function DealResults({ response }: { response: unknown }) {
  const root = asRecord(response);
  const data = asRecord(root?.data);
  const opportunity = asRecord(data?.opportunity) ?? asRecord(data?.deal) ?? data;
  return <div className="space-y-4">{root?.createdDealName && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Unique deal name created:</strong> {display(root.createdDealName)}</div>}{opportunity ? <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"><Metric label="Deal ID" value={display(opportunity.id)} /><Metric label="Name" value={display(opportunity.name)} /><Metric label="Amount" value={display(opportunity.amount)} /><Metric label="Close date" value={display(opportunity.closed_date)} /><Metric label="Account ID" value={display(opportunity.account_id)} /><Metric label="Stage" value={display(opportunity.opportunity_stage_id ?? opportunity.stage_id)} /></div> : <EmptyState text="Apollo returned success but no deal object was found in the response." />}<details className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-bold text-slate-700">Raw safe response</summary><pre className="mt-3 max-h-[420px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-white">{JSON.stringify(response, null, 2)}</pre></details></div>;
}

function GenericResults({ response }: { response: unknown }) {
  return <pre className="max-h-[520px] overflow-auto rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-slate-100">{JSON.stringify(response, null, 2)}</pre>;
}

function badge(status: OperationDefinition["status"]) {
  if (status === "FREE_VERIFIED") return { text: "FREE VERIFIED", cls: "bg-emerald-50 text-emerald-700" };
  if (status === "ZERO_CREDIT_TEST") return { text: "0 CREDIT TEST", cls: "bg-blue-50 text-blue-700" };
  return { text: "PAID PLAN", cls: "bg-amber-100 text-amber-800" };
}

export default function ApolloFreeLab() {
  const [operation, setOperation] = useState<Operation>("contacts-search");
  const [form, setForm] = useState<FormState>({ keywords: "", organizationName: "", page: "1", perPage: "10", dealName: "VBridge Test Deal", amount: "0", closedDate: "", accountId: "", dealId: "" });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const active = useMemo(() => operations.find((item) => item.id === operation)!, [operation]);
  const activeBadge = badge(active.status);

  function chooseOperation(next: Operation) { setOperation(next); setResponse(null); setHttpStatus(null); }
  function setField<K extends keyof FormState>(key: K, value: string) { setForm((current) => ({ ...current, [key]: value })); }

  async function run(event: FormEvent) {
    event.preventDefault();
    if (active.status === "PAID_PLAN") return;
    setLoading(true); setResponse(null); setHttpStatus(null);
    try {
      let url = ""; let method: "GET" | "POST" = "POST"; let body: Record<string, unknown> | undefined;
      switch (operation) {
        case "contacts-search": url = "/api/apollo/free/contacts/search"; body = { keywords: form.keywords, page: Number(form.page), perPage: Number(form.perPage) }; break;
        case "accounts-search": url = "/api/apollo/free/accounts/search"; body = { organizationName: form.organizationName, page: Number(form.page), perPage: Number(form.perPage) }; break;
        case "users": method = "GET"; url = `/api/apollo/free/users/search?page=${encodeURIComponent(form.page)}&per_page=${encodeURIComponent(form.perPage)}`; break;
        case "api-usage": url = "/api/apollo/free/usage/api"; body = {}; break;
        case "credit-usage": url = "/api/apollo/free/usage/credits"; body = {}; break;
        case "deal-create": url = "/api/apollo/free/deals/create"; body = { name: form.dealName, amount: form.amount, closedDate: form.closedDate, accountId: form.accountId }; break;
        case "deal-view": method = "GET"; url = `/api/apollo/free/deals/view/${encodeURIComponent(form.dealId.trim())}`; break;
        default: return;
      }
      const result = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
      setHttpStatus(result.status);
      const json = await result.json(); setResponse(json);
      if (operation === "deal-create" && result.ok) {
        const root = asRecord(json); const data = asRecord(root?.data); const deal = asRecord(data?.opportunity) ?? asRecord(data?.deal) ?? data; const id = display(deal?.id); if (id !== "—") setField("dealId", id);
      }
    } catch { setHttpStatus(0); setResponse({ ok: false, message: "The V-Bridge Apollo gateway could not be reached." }); }
    finally { setLoading(false); }
  }

  const noInputs = operation === "api-usage" || operation === "credit-usage";
  return <main className="min-h-screen bg-[#f7f9fc] p-4 text-slate-950 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1400px]">
    <header className="rounded-[24px] bg-gradient-to-br from-[#0e3566] via-[#0b4ea2] to-[#1769c2] p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div><span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">V-Bridge Apollo Integration Lab</span><h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Apollo.io API Samples</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">Verified Free-plan APIs plus controlled 0-credit Deal APIs. Each user action appears clearly in the browser Network tab.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-100">Security</p><p className="mt-1 text-lg font-extrabold">API key stays server-side</p><p className="mt-1 text-xs text-blue-100">No Apollo browser cookies are used or stored.</p></div></div></header>
    <section className="mt-6 rounded-[22px] border border-amber-200 bg-amber-50 p-5"><h2 className="text-sm font-extrabold text-amber-950">Before using Deal APIs</h2><p className="mt-2 text-sm leading-6 text-amber-900">Create Deal changes your real Apollo workspace. V-Bridge adds a timestamp/random suffix to make the final deal name unique. Amount, close date and account ID are optional. View Deal is read-only.</p></section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[330px_1fr]"><aside className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"><p className="px-2 pb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Apollo API samples</p><div className="space-y-2">{operations.map((item) => { const itemBadge = badge(item.status); return <button key={item.id} type="button" onClick={() => chooseOperation(item.id)} className={`w-full rounded-2xl border p-4 text-left transition ${item.id === operation ? "border-blue-200 bg-blue-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-extrabold text-slate-900">{item.title}</p><p className="mt-1 text-xs font-medium text-blue-700">{item.subtitle}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-black ${itemBadge.cls}`}>{itemBadge.text}</span></div></button>; })}</div></aside>
      <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="border-b border-slate-100 pb-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Selected API</p><h2 className="mt-2 text-2xl font-extrabold text-[#12315b]">{active.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{active.description}</p></div><span className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${activeBadge.cls}`}>{activeBadge.text}</span></div><div className="mt-4 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-900"><strong>Help:</strong> {active.help}</div></div>
        {active.status === "PAID_PLAN" ? <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">This request is intentionally disabled on the current Apollo Free plan.</div> : <form onSubmit={run} className="mt-6">
          {operation === "contacts-search" && <div className="grid gap-5 md:grid-cols-2"><Field label="Contact keywords" value={form.keywords} onChange={(v) => setField("keywords", v)} help="Optional. Search contacts already saved in Apollo. Leave blank for the first page." /><Field label="Results per page" type="number" value={form.perPage} onChange={(v) => setField("perPage", v)} help="Number of saved contacts to return; V-Bridge caps it at 100." /></div>}
          {operation === "accounts-search" && <div className="grid gap-5 md:grid-cols-2"><Field label="Company / account name" value={form.organizationName} onChange={(v) => setField("organizationName", v)} help="Optional. Filter accounts already saved in Apollo." /><Field label="Results per page" type="number" value={form.perPage} onChange={(v) => setField("perPage", v)} help="Number of saved accounts to return." /></div>}
          {operation === "users" && <div className="grid gap-5 md:grid-cols-2"><Field label="Page number" type="number" value={form.page} onChange={(v) => setField("page", v)} help="Start with page 1." /><Field label="Results per page" type="number" value={form.perPage} onChange={(v) => setField("perPage", v)} help="Number of workspace users to return." /></div>}
          {operation === "deal-create" && <div className="grid gap-5 md:grid-cols-2"><Field label="Deal base name" required value={form.dealName} onChange={(v) => setField("dealName", v)} help="Required. V-Bridge appends a unique suffix before sending this name to Apollo." placeholder="VBridge Test Deal" /><Field label="Amount" value={form.amount} onChange={(v) => setField("amount", v)} help="Optional monetary value. Use digits only, without commas or currency symbols." placeholder="0" /><Field label="Estimated close date" type="date" value={form.closedDate} onChange={(v) => setField("closedDate", v)} help="Optional. Apollo expects YYYY-MM-DD." /><Field label="Apollo account ID" value={form.accountId} onChange={(v) => setField("accountId", v)} help="Optional. The saved Apollo account/company ID associated with this deal." placeholder="Leave blank for test" /></div>}
          {operation === "deal-view" && <Field label="Apollo Deal ID" required value={form.dealId} onChange={(v) => setField("dealId", v)} help="Required. Paste the opportunity ID returned by Create Deal." placeholder="6a8bdffab8de17001c360e12" />}
          {noInputs && <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-950">No test input is required. Click Run to request the current workspace statistics.</div>}
          <div className="mt-6 flex flex-wrap items-center gap-3"><button type="submit" disabled={loading} className="rounded-xl bg-[#0b4ea2] px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#083d80] disabled:opacity-60">{loading ? "Calling Apollo…" : `Run ${active.title}`}</button><span className="text-xs leading-5 text-slate-500">Network tab shows the V-Bridge route and safe Apollo upstream headers.</span></div>
        </form>}
        {active.status !== "PAID_PLAN" && <div className="mt-7 border-t border-slate-100 pt-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Apollo response</p><p className="mt-1 text-sm font-bold text-slate-700">{httpStatus === null ? "Run the sample to see results." : httpStatus === 0 ? "Gateway error" : `HTTP ${httpStatus}`}</p></div>{httpStatus !== null && httpStatus >= 200 && httpStatus < 300 && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">SUCCESS</span>}</div><div className="mt-4">{response === null ? <EmptyState text="No response yet." /> : operation === "contacts-search" ? <ContactResults response={response} /> : operation === "deal-create" || operation === "deal-view" ? <DealResults response={response} /> : <GenericResults response={response} />}</div></div>}
      </section></div>
  </div></main>;
}
