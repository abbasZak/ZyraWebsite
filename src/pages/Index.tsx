import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TokenomicsSection from "@/components/TokenomicsSection";
import RoadmapSection from "@/components/RoadmapSection";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="noise">
      <Preloader isLoading={isLoading} />
      <div className={isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-700"}>
        <Navbar />
        <HeroSection />
        <div className="relative">
          <div className="absolute inset-0 bg-grid pointer-events-none" />
          <FeaturesSection />
          <TokenomicsSection />
          <RoadmapSection />
          <TeamSection />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
