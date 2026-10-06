/**
 * Client → server calls. In the static preview there is no server, so calls
 * resolve in "demo" mode and nothing is stored.
 */
export type ApiResult = { ok: true; mode: "live" | "demo"; id?: string } | { ok: false; error: string };

const isPreview = () => typeof window !== "undefined" && (window as unknown as { __LOASH_PREVIEW__?: boolean }).__LOASH_PREVIEW__ === true;

async function post(path: string, body: FormData | object): Promise<ApiResult> {
  if (isPreview()) {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, mode: "demo" };
  }
  try {
    const res = await fetch(path, {
      method: "POST",
      ...(body instanceof FormData ? { body } : { body: JSON.stringify(body), headers: { "content-type": "application/json" } }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Something went wrong. Please try again." };
    return { ok: true, mode: json.mode ?? "live", id: json.id };
  } catch {
    return { ok: false, error: "Network error — check your connection and try again." };
  }
}

export const submitInquiry = (fd: FormData) => post("/api/inquiries", fd);
export const submitFollow = (body: { email: string; locationIds: string[] }) => post("/api/follow", body);
