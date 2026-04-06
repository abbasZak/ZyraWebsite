import { motion } from "framer-motion";

const team = [
  {
    name: "Fatima Yusuf Adam",
    role: "Founder & CEO",
    bio: "Software engineer and blockchain architect. The original mind behind the Zyra protocol, leading strategic direction and ecosystem expansion.",
    initials: "FY",
  },
  {
    name: "Usman Zayyana Shehu",
    role: "Co-Founder & COO",
    bio: "Computer science specialist shaping Zyra's operational stability, technological strategy, and scalable infrastructure design.",
    initials: "UZ",
  },
  {
    name: "Sadiq Aminu Safana",
    role: "Co-Founder & CSPO",
    bio: "5+ years in crypto. Drives ecosystem development, market strategy, and community growth to position Zyra globally.",
    initials: "SA",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[300px] h-[400px] bg-primary/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-medium text-primary uppercase tracking-[0.25em] mb-4">Leadership</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 tracking-tight">Founding Team</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
            United by a vision to build decentralized financial infrastructure for emerging markets.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              className="group relative p-6 md:p-8 rounded-2xl glass gradient-border text-center hover:bg-card/60 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 group-hover:glow-sm transition-all duration-500">
                <span className="text-lg font-bold text-primary font-display">
                  {member.initials}
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight mb-1">{member.name}</h3>
              <p className="text-xs text-primary font-medium uppercase tracking-wider mb-4">{member.role}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
