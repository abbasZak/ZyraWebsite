import zyraLogo from "@/assets/zyra-logo.jpeg";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={zyraLogo} alt="Zyra" className="w-8 h-8 rounded-md" />
            <span className="text-lg font-display font-bold">Zyra</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Decentralized Exchange for Africa · zyra.finance
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Zyra. All rights reserved.
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-8 max-w-3xl mx-auto">
          This website is for informational purposes only and does not constitute financial, investment, legal, or tax advice. Participation in the Zyra ecosystem involves significant risk, including the potential loss of capital.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
