import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Header />

      {/* Content — pt-14 to clear fixed header */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "6rem 2rem 5rem" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(124,111,255,0.1)",
          border: "1px solid rgba(124,111,255,0.25)",
          borderRadius: "6px",
          padding: "0.25rem 0.75rem",
          fontSize: "0.75rem",
          color: "var(--accent-purple)",
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          marginBottom: "1rem",
        }}>
          Rechtliches
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2.5rem", color: "var(--text-primary)" }}>
          {title}
        </h1>

        <div className="legal-content">
          {children}
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
