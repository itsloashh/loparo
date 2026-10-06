"use client";
import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import { asset } from "@/lib/images";
import { Corners, Star } from "@/components/ui/primitives";
import { Field, TextInput } from "./kit";

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <img src={asset("/brand/loash-wordmark-640.webp")} alt="LOASH" className="mx-auto w-48" />
        <p className="eyebrow mt-4 text-center">Admin</p>
        <div className="relative mt-8 etched bg-stone/70 p-6">
          <Corners />
          {configured ? (
            <form action={action} className="space-y-4">
              <Field label="Email"><TextInput name="email" type="email" autoComplete="email" required /></Field>
              <Field label="Password"><TextInput name="password" type="password" autoComplete="current-password" required /></Field>
              {state?.error && <p role="alert" className="text-[13px] text-full">{state.error}</p>}
              <button disabled={pending} className="sweep flex h-12 w-full items-center justify-center gap-2 border border-white/40 bg-gradient-to-b from-[#e9e8e4] to-[#b9b8b3] font-mono text-[11px] uppercase tracking-[0.2em] text-ink disabled:opacity-50">
                {pending ? "Signing in…" : <>Sign in <Star size={8} /></>}
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-[14px] text-mist">
              <p className="font-display text-xl text-bone">Connect Supabase to turn on the admin.</p>
              <ol className="list-decimal space-y-1.5 pl-5 text-[13px] text-ash">
                <li>Run <code className="text-mist">0001_init.sql</code>, <code className="text-mist">0002_admin.sql</code> and <code className="text-mist">seed.sql</code> in the SQL Editor.</li>
                <li>Add the Supabase env vars in Vercel.</li>
                <li>Create your user under Authentication → Users.</li>
                <li>Add your email to <code className="text-mist">ADMIN_EMAILS</code>.</li>
              </ol>
            </div>
          )}
        </div>
        <a href="/" className="mt-6 block text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ash hover:text-bone">← Back to site</a>
      </div>
    </main>
  );
}
