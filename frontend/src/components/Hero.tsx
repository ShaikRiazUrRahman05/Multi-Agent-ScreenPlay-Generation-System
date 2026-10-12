import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, FileText, Users } from "lucide-react";
import heroImage from "@/assets/hero-script-ai.jpg";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 floating">
        <Sparkles className="w-6 h-6 text-primary opacity-60" />
      </div>
      <div className="absolute top-40 right-20 floating" style={{ animationDelay: "2s" }}>
        <Wand2 className="w-8 h-8 text-secondary opacity-60" />
      </div>
      <div className="absolute bottom-40 left-20 floating" style={{ animationDelay: "4s" }}>
        <FileText className="w-7 h-7 text-accent opacity-60" />
      </div>
      <div className="absolute bottom-20 right-10 floating" style={{ animationDelay: "1s" }}>
        <Users className="w-6 h-6 text-primary-glow opacity-60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="animate-fade-in">
          <Badge variant="outline" className="mb-6 border-primary text-primary animate-glow">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Creativity
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gradient">Script</span>{" "}
            <span className="text-foreground">Your</span>{" "}
            <span className="text-gradient">Story</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your creative ideas into professional scripts with AI that understands storytelling, 
            character development, and cinematic dialogue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={onGetStarted}
              className="btn-hero"
              size="lg"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="hover:bg-secondary/10 hover:border-secondary transition-all"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Examples
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: FileText, label: "Story Outline", color: "text-primary" },
              { icon: Users, label: "Character Bios", color: "text-secondary" },
              { icon: Sparkles, label: "Dialogue", color: "text-accent" },
              { icon: Wand2, label: "Final Script", color: "text-primary-glow" }
            ].map((feature, index) => (
              <div 
                key={feature.label}
                className="card-creative p-4 text-center"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
};

export default Hero;