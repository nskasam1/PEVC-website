const partners = [
  "Andreessen Horowitz", "Accel", "SoftBank", "Bain Capital",
  "Norwest", "Sequoia", "Benchmark", "Lightspeed",
  "General Atlantic", "Pivot North", "Bessemer", "Greylock",
];

const LogoTicker = () => {
  return (
    <div className="overflow-hidden py-10 border-y border-border">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...partners, ...partners].map((name, i) => (
          <div
            key={i}
            className="mx-8 flex-shrink-0 text-muted-foreground text-sm font-medium tracking-[0.15em] uppercase opacity-30 hover:opacity-80 hover:text-primary transition-all duration-300 cursor-default"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoTicker;
