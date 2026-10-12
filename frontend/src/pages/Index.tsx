import { useState } from "react";
import Hero from "@/components/Hero";
import ScriptGenerator from "@/components/ScriptGenerator";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [showGenerator, setShowGenerator] = useState(false);

  if (showGenerator) {
    return <ScriptGenerator />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero onGetStarted={() => setShowGenerator(true)} />
    </div>
  );
};

export default Index;
