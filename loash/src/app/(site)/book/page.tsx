import type { Metadata } from "next";
import { BookView } from "@/components/book/BookView";

export const metadata: Metadata = {
  title: "Request a Tattoo",
  description: "Start a custom tattoo request with LOASH — tell me the idea, placement, size and where you'd like to get tattooed.",
  alternates: { canonical: "/book" },
};

export default function Page() {
  return <BookView />;
}
