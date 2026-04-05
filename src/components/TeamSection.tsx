import { motion } from "framer-motion";

const team = [
  {
    name: "Fatima Yusuf Adam (Zahra)",
    role: "Founder & CEO",
    bio: "Software engineer focused on blockchain systems. The original architect behind the Zyra protocol, leading strategic direction and ecosystem expansion.",
  },
  {
    name: "Usman Zayyana Shehu",
    role: "Co-Founder & COO",
    bio: "Strong background in computer applications and digital technology. Shapes Zyra's operational stability and scalable infrastructure design.",
  },
  {
    name: "Sadiq Aminu Safana",
    role: "Co-Founder & CSPO",
    bio: "Over five years in the crypto ecosystem. Focuses on ecosystem development, market strategy, and community growth at Zyra.",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Founding Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            United by a vision to build decentralized financial infrastructure for emerging markets.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              className="p-6 rounded-xl bg-card border border-border text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
