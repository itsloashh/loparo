export interface CaseStudy {
  type: string;
  title: string;
  slug: string;
  context: string;
  challenge: string;
  strategy: string;
  outcome: string;
  metrics: { value: string; label: string }[];
  tags: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    type: "Website",
    title: "The Second Spliff",
    slug: "the-second-spliff",
    context:
      "TSS is a Windsor, Ontario lifestyle, live events, and multimedia brand evolving into a professional events company. Needed a digital home that reflected its evolution and drove partnership inquiries.",
    challenge:
      "No web presence. Brand credibility relied entirely on social media. No structured way for venues, artists, or sponsors to inquire.",
    strategy:
      "Built a full-stack Next.js 14 platform on Vercel with artist feature pages, event listings with filtering, and a structured \"Work with TSS\" inquiry funnel. Tailwind CSS for rapid iteration, App Router for performance.",
    outcome:
      "Professional digital presence established. Partnership inquiry system live. Artist and event content structured for SEO and shareability.",
    metrics: [
      { value: "<1.2s", label: "Load Time" },
      { value: "100%", label: "Mobile Responsive" },
    ],
    tags: ["Next.js 14", "Vercel", "Tailwind CSS", "Events Platform"],
  },
  {
    type: "Automation",
    title: "Loparo Prospector",
    slug: "loparo-prospector",
    context:
      "Loparo needed an automated outbound lead generation system that could find, research, qualify, and contact potential clients without manual effort.",
    challenge:
      "Manual prospecting consumed 15+ hours per week. No systematic way to discover leads, research them, or send personalized outreach at scale.",
    strategy:
      "End-to-end n8n Cloud pipeline: Google Places API for discovery, Claude AI for research and email personalization, automated verification, cold outreach, Google Sheet CRM logging, and Slack notifications.",
    outcome:
      "Fully automated lead pipeline from discovery to outreach. Manual prospecting hours reduced to near-zero. Every lead researched, personalized, and tracked.",
    metrics: [
      { value: "15hrs", label: "Weekly Time Saved" },
      { value: "100%", label: "Automated Pipeline" },
    ],
    tags: ["n8n Cloud", "Claude AI", "Google Sheets", "Slack"],
  },
  {
    type: "Platform",
    title: "JARVIS Multi-Agent Dashboard",
    slug: "jarvis-dashboard",
    context:
      "Needed a centralized AI assistant system handling multiple business functions — lead generation, content creation, strategic analysis.",
    challenge:
      "Multiple AI tools scattered across platforms. No shared context. Deliverables lost across tools.",
    strategy:
      "13-agent Streamlit dashboard with Scout, Intel, Builder, Outreach, and Closer agents for Lead Engine. Shared memory system. Discord webhook integration for deliverable routing.",
    outcome:
      "Unified command center for all AI-powered operations. Codebase refactored from ~2,900 to ~432 lines. Deliverables auto-routed to Discord.",
    metrics: [
      { value: "13", label: "Specialized Agents" },
      { value: "85%", label: "Code Reduction" },
    ],
    tags: ["Streamlit", "Multi-Agent AI", "Discord", "Python"],
  },
  {
    type: "Website",
    title: "Loparo.ca",
    slug: "loparo-ca",
    context:
      "Needed a homepage communicating premium positioning, technical credibility, and clear conversion path for founder-stage businesses.",
    challenge:
      "Competing in a crowded agency space. Needed to immediately convey operator-built credibility and drive audit bookings.",
    strategy:
      "Rolex-inspired green and gold palette with Cormorant Garamond editorial typography. Single-page conversion architecture: Hero → Capabilities → Work → Process → Contact.",
    outcome:
      "Distinctive brand presence. Clean conversion path from landing to inquiry submission.",
    metrics: [
      { value: "7", label: "Conversion Sections" },
      { value: "<2s", label: "Full Load Time" },
    ],
    tags: ["HTML / CSS", "Conversion Design", "Editorial Typography"],
  },
  {
    type: "Application",
    title: "SpotPulse",
    slug: "spotpulse",
    context:
      "Personal project to track precious metals portfolios with real-time pricing and allocation visualization.",
    challenge:
      "Existing trackers lacked metals support. No clean interface for gold, silver, platinum, and palladium with allocation targets.",
    strategy:
      "Flask app with MetalpriceAPI for live spot prices. Portfolio allocation with target vs. actual. Historical charting. Deployed on PythonAnywhere.",
    outcome:
      "Fully functional metals tracker with real-time data. Clean dark UI for daily check-ins.",
    metrics: [
      { value: "Live", label: "Real-Time Pricing" },
      { value: "4", label: "Metals Tracked" },
    ],
    tags: ["Flask", "MetalpriceAPI", "PythonAnywhere"],
  },
  {
    type: "Application",
    title: "TradeForge",
    slug: "tradeforge",
    context:
      "Built for traders who track execution quality, not just P/L. A disciplined approach to journaling.",
    challenge:
      "Most journals focus on raw numbers. No good tool for psychology and process — mood, setup quality, execution discipline.",
    strategy:
      "React app with calendar P/L heatmap, mood tracking, setup tagging, and analytics dashboard. Dark theme for market hours.",
    outcome:
      "Complete journal tracking both performance and process. Calendar view for visual consistency feedback.",
    metrics: [
      { value: "Calendar", label: "P/L Heatmap" },
      { value: "Mood", label: "Psychology Tracking" },
    ],
    tags: ["React", "Dark UI", "Analytics"],
  },
];
