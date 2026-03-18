import Header from "@/components/Header";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen grid-bg">
      <Header />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
}
