import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-6xl"><span className="metal">Lost in the dark.</span></h1>
        <Link href="/work" className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-mist underline underline-offset-8 hover:text-bone">Back to the work</Link>
      </div>
    </section>
  );
}
