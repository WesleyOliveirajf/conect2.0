import { Headset } from "lucide-react";
import { Button } from "@/components/ui/button";

const SupportButton = () => {
  const handleSupportClick = () => {
    window.open('https://chamado2026torp.lovable.app/', '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleSupportClick}
      className="fixed bottom-6 right-6 z-50 h-16 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90 flex items-center gap-3 text-base font-semibold"
      aria-label="Abrir Suporte TI"
      title="Abrir Suporte TI"
    >
      <Headset className="h-6 w-6" />
      <span>Abrir Suporte TI</span>
    </Button>
  );
};

export default SupportButton;
