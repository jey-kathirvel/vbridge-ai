"use client";

import { FormEvent, useMemo, useState } from "react";

type Operation =
  | "people-search"
  | "contacts-search"
  | "accounts-search"
  | "users"
  | "api-usage"
  | "credit-usage";

type FormState = {
  keywords: string;
  organizationName: string;
  page: string;
  perPage: string;
};

type JsonRecord = Record<string, unknown>;

type OperationDefinition = {
  id: Operation;
  title: string;
  subtitle: string;
  description: string;
  verifiedFreePlan: boolean;
  help: string;
  browserEndpoint?: string;
  browserMethod?: "GET" | "POST";
  apolloEndpoint: string;
  apolloMethod: "GET" | "POST";
};

const defaults: Record<Operation, Partial<FormState>> = {
  "people-search": {},
  "contacts-search": { keywords: "", page: "1", perPage: "10" },
  "accounts-search": { organizationName: "", page: "1", perPage: "10" },
  users: { page: "1", perPage: "10" },
  "api-usage": {},
  "credit-usage": {},
};

const operations: OperationDefinition[] = [
  {
    id: "contacts-search",
    title: "Saved Contacts",
    subtitle: "Search workspace contacts",
    description:
      "Search contacts already stored in this Apollo workspace. This verified Free-plan endpoint does not search Apollo's global people database.",
    verifiedFreePlan: true,
    help:
      "Use this when V-Bridge needs contacts previously created or saved in Apollo. Leave the keyword blank to return the first page.",
    browserEndpoint: "/api/apollo/free/contacts/search",
    browserMethod: "POST",
    apolloEndpoint: "/api/v1/contacts/search",
    apolloMethod: "POST",
  },
  {
    id: "accounts-search",
    title: "Saved Accounts",
    subtitle: "Search saved companies",
    description: "Search companies already stored as accounts in this Apollo workspace.",
    verifiedFreePlan: true,
    help:
      "This searches your own Apollo workspace only. It is different from Apollo global Company Search, which is not included in the Free plan.",
    browserEndpoint: "/api/apollo/free/accounts/search",
    browserMethod: "POST",
    apolloEndpoint: "/api/v1/accounts/search",
    apolloMethod: "POST",
  },
  {
    id: "users",
    title: "Apollo Users",
    subtitle: "Workspace users",
    description: "Retrieve users associated with the configured Apollo workspace.",
    verifiedFreePlan: true,
    help:
      "Useful for administration and integration diagnostics. It does not discover external prospects.",
    browserEndpoint: "/api/apollo/free/users/search",
    browserMethod: "GET",
    apolloEndpoint: "/api/v1/users/search",
    apolloMethod: "GET",
  },
  {
    id: "api-usage",
    title: "API Usage",
    subtitle: "Usage and rate-limit visibility",
    description: "Request current Apollo API usage statistics available to this workspace.",
    verifiedFreePlan: true,
    help: "Use this to understand API consumption and watch Apollo request limits.",
    browserEndpoint: "/api/apollo/free/usage/api",
    browserMethod: "POST",
    apolloEndpoint: "/api/v1/usage_stats/api_usage_stats",
    apolloMethod: "POST",
  },
  {
    id: "credit-usage",
    title: "Credit Usage",
    subtitle: "Credit safety",
    description: "View Apollo credit usage information reported for the current workspace.",
    verifiedFreePlan: true,
    help:
      "Use this before enabling future paid capabilities so V-Bridge users can understand credit consumption.",
    browserEndpoint: "/api/apollo/free/usage/credits",
    browserMethod: "POST",
    apolloEndpoint: "/api/v1/usage_stats/credit_usage_stats",
    apolloMethod: "POST",
  },
  {
    id: "people-search",
    title: "People Search",
    subtitle: "Global prospect search",
    description: "Apollo global People Search is not included in the currently verified Free plan.",
    verifiedFreePlan: false,
    help:
      "Your Apollo account returned HTTP 403 API_INACCESSIBLE for this endpoint, so V-Bridge blocks it locally.",
    apolloEndpoint: "/api/v1/mixed_people/api_search",
    apolloMethod: "POST",
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

function Field({
  label,
  value,
  onChange,
  help,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
        {label}
        <button
          type="button"
          title={help}
          aria-label={`${label} help: ${help}`}
          className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[11px] font-black text-blue-700"
        >
          ?
        </button>
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      <span className="mt-2 block text-xs leading-5 text-slate-500">{help}</span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-[#12315b]">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">{text}</div>;
}

function ContactResults({ response }: { response: unknown }) {
  const root = asRecord(response);
  const data = asRecord(root?.data);
  const contacts = asArray(data?.contacts).map(asRecord).filter(Boolean) as JsonRecord[];
  const pagination = asRecord(data?.pagination);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Returned" value={contacts.length} />
        <Metric label="Workspace total" value={display(pagination?.total_entries)} />
        <Metric label="Page" value={display(pagination?.page)} />
      </div>
      {contacts.length === 0 ? (
        <EmptyState text="No saved contacts matched this search. This is a valid Apollo response." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {["Name", "Title", "Organization", "Email", "Phones", "Source", "Created"].map((item) => (
                  <th key={item} className="px-4 py-3 font-extrabold">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {contacts.map((contact, index) => (
                <tr key={display(contact.id) + index}>
                  <td className="px-4 py-3 font-bold text-slate-900">{display(contact.name)}</td>
                  <td className="px-4 py-3 text-slate-600">{display(contact.title)}</td>
                  <td className="px-4 py-3 text-slate-600">{display(contact.organization_name)}</td>
                  <td className="px-4 py-3 text-slate-600">{display(contact.email)}</td>
                  <td className="px-4 py-3 text-slate-600">{asArray(contact.phone_numbers).length}</td>
                  <td className="px-4 py-3 text-slate-600">{display(contact.source_display_name ?? contact.source)}</td>
                  <td className="px-4 py-3 text-slate-600">{display(contact.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AccountResults({ response }: { response: unknown }) {
  const root = asRecord(response);
  const data = asRecord(root?.data);
  const accounts = asArray(data?.accounts).map(asRecord).filter(Boolean) as JsonRecord[];
  const pagination = asRecord(data?.pagination);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Returned" value={accounts.length} />
        <Metric label="Workspace total" value={display(pagination?.total_entries)} />
        <Metric label="Page" value={display(pagination?.page)} />
      </div>
      {accounts.length === 0 ? (
        <EmptyState text="No saved accounts matched this search." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {accounts.map((account, index) => (
            <div key={display(account.id) + index} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-extrabold text-slate-900">{display(account.name)}</p>
              <p className="mt-1 text-xs text-slate-500">Domain: {display(account.domain)}</p>
              <p className="mt-1 text-xs text-slate-500">Location: {display(account.city)}, {display(account.country)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GenericResults({ response, operation }: { response: unknown; operation: Operation }) {
  const root = asRecord(response);
  const data = asRecord(root?.data);
  const users = operation === "users"
    ? (asArray(data?.users).map(asRecord).filter(Boolean) as JsonRecord[])
    : [];

  if (operation === "users" && users.length > 0) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {users.map((user, index) => (
          <div key={display(user.id) + index} className="rounded-2xl border border-slate-200 p-4">
            <p className="font-extrabold text-slate-900">{display(user.name ?? user.first_name)}</p>
            <p className="mt-1 text-xs text-slate-500">{display(user.email)}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <pre className="max-h-[520px] overflow-auto rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-slate-100">
      {JSON.stringify(response, null, 2)}
    </pre>
  );
}

export default function ApolloFreeLab() {
  const [operation, setOperation] = useState<Operation>("contacts-search");
  const [form, setForm] = useState<FormState>({
    keywords: "",
    organizationName: "",
    page: "1",
    perPage: "10",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);

  const active = useMemo(
    () => operations.find((item) => item.id === operation)!,
    [operation],
  );

  function chooseOperation(next: Operation) {
    setOperation(next);
    setResponse(null);
    setHttpStatus(null);
    const sample = defaults[next];
    setForm((current) => ({
      ...current,
      keywords: sample.keywords ?? "",
      organizationName: sample.organizationName ?? "",
      page: sample.page ?? "1",
      perPage: sample.perPage ?? "10",
    }));
  }

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function run(event: FormEvent) {
    event.preventDefault();
    if (!active.verifiedFreePlan || !active.browserEndpoint || !active.browserMethod) return;

    setLoading(true);
    setResponse(null);
    setHttpStatus(null);

    try {
      let url = active.browserEndpoint;
      const options: RequestInit = {
        method: active.browserMethod,
        headers: { "Content-Type": "application/json" },
      };

      if (active.browserMethod === "GET") {
        const params = new URLSearchParams({
          page: String(Number(form.page || 1)),
          per_page: String(Number(form.perPage || 10)),
        });
        url = `${url}?${params.toString()}`;
      } else {
        options.body = JSON.stringify({
          keywords: form.keywords,
          organizationName: form.organizationName,
          page: Number(form.page || 1),
          perPage: Number(form.perPage || 10),
        });
      }

      const result = await fetch(url, options);
      setHttpStatus(result.status);
      setResponse(await result.json());
    } catch {
      setHttpStatus(0);
      setResponse({ ok: false, message: "The V-Bridge Apollo gateway could not be reached." });
    } finally {
      setLoading(false);
    }
  }

  const noInputs = operation === "api-usage" || operation === "credit-usage";

  return (
    <main className="min-h-screen bg-[#f7f9fc] p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="rounded-[24px] bg-gradient-to-br from-[#0e3566] via-[#0b4ea2] to-[#1769c2] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">V-Bridge Integration Lab</span>
                <span className="rounded-full bg-emerald-300/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">Free plan verified</span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Apollo.io Free API Samples</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
                Each action now uses its own V-Bridge API URL so users can identify the API call directly in Chrome Network. Apollo credentials remain server-side.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-100">Network visibility</p>
              <p className="mt-1 text-lg font-extrabold">Operation-specific API routes</p>
              <p className="mt-1 text-xs text-blue-100">Upstream endpoint is also returned in safe response headers</p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[22px] border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-extrabold text-amber-950">How to verify in Chrome Network</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Open DevTools → Network → Fetch/XHR, then click Run. You will see a readable V-Bridge URL such as /api/apollo/free/contacts/search. Open that request and inspect Response Headers for X-VBridge-Apollo-Upstream to see the exact Apollo endpoint called by the server.
          </p>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[330px_1fr]">
          <aside className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-2 pb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Apollo API samples</p>
            <div className="space-y-2">
              {operations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseOperation(item.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${item.id === operation ? "border-blue-200 bg-blue-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs font-medium text-blue-700">{item.subtitle}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-black ${item.verifiedFreePlan ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                      {item.verifiedFreePlan ? "FREE VERIFIED" : "PAID PLAN"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Selected API</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#12315b]">{active.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{active.description}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${active.verifiedFreePlan ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                  {active.verifiedFreePlan ? "HTTP 200 verified on Free plan" : "Not included in Free plan"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">Network tab request</p>
                  <code className="mt-2 block break-all text-xs font-bold text-blue-950">
                    {active.browserEndpoint ? `${active.browserMethod} ${active.browserEndpoint}` : "Blocked locally"}
                  </code>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Apollo upstream</p>
                  <code className="mt-2 block break-all text-xs font-bold text-slate-800">
                    {active.apolloMethod} {active.apolloEndpoint}
                  </code>
                </div>
              </div>

              <div className={`mt-4 rounded-xl p-4 text-xs leading-5 ${active.verifiedFreePlan ? "bg-blue-50 text-blue-900" : "bg-amber-50 text-amber-900"}`}>
                <strong>Help:</strong> {active.help}
              </div>
            </div>

            {!active.verifiedFreePlan ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="text-base font-extrabold text-amber-950">This request is intentionally disabled.</p>
                <p className="mt-2 text-sm leading-6 text-amber-900">Apollo returned API_INACCESSIBLE on the Free plan, so V-Bridge does not call it.</p>
              </div>
            ) : (
              <form onSubmit={run} className="mt-6">
                {operation === "contacts-search" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Contact keywords" value={form.keywords} onChange={(value) => setField("keywords", value)} help="Optional. Search contacts already saved in this Apollo workspace. Leave blank to return the first page." />
                    <Field label="Results per page" type="number" value={form.perPage} onChange={(value) => setField("perPage", value)} help="How many saved contacts Apollo should return on this page. Use 10 while testing." />
                  </div>
                )}

                {operation === "accounts-search" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Company / account name" value={form.organizationName} onChange={(value) => setField("organizationName", value)} help="Optional. Enter part of a company name to filter accounts already saved in Apollo." />
                    <Field label="Results per page" type="number" value={form.perPage} onChange={(value) => setField("perPage", value)} help="How many saved accounts Apollo should return. Use 10 for testing." />
                  </div>
                )}

                {operation === "users" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Page number" type="number" value={form.page} onChange={(value) => setField("page", value)} help="Apollo paginates workspace users. Start with page 1." />
                    <Field label="Results per page" type="number" value={form.perPage} onChange={(value) => setField("perPage", value)} help="Number of Apollo workspace users to return on this page." />
                  </div>
                )}

                {noInputs && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
                    No test input is required. Click Run and watch the Fetch/XHR request appear in Chrome Network.
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={loading} className="rounded-xl bg-[#0b4ea2] px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#083d80] disabled:opacity-60">
                    {loading ? "Calling Apollo…" : `Run ${active.title}`}
                  </button>
                  <span className="text-xs leading-5 text-slate-500">Browser → visible V-Bridge API → server-side Apollo API.</span>
                </div>
              </form>
            )}

            {active.verifiedFreePlan && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Apollo response</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">{httpStatus === null ? "Run the sample to see results." : httpStatus === 0 ? "Gateway error" : `HTTP ${httpStatus}`}</p>
                  </div>
                  {httpStatus !== null && httpStatus >= 200 && httpStatus < 300 && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">SUCCESS</span>}
                </div>
                <div className="mt-4">
                  {response === null ? (
                    <EmptyState text="No response yet." />
                  ) : operation === "contacts-search" ? (
                    <ContactResults response={response} />
                  ) : operation === "accounts-search" ? (
                    <AccountResults response={response} />
                  ) : (
                    <GenericResults response={response} operation={operation} />
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
