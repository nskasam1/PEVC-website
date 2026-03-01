const partners = [
  "Andreessen Horowitz", "Accel", "SoftBank", "Bain Capital",
  "Norwest", "Sequoia", "Benchmark", "Lightspeed",
  "General Atlantic", "Pivot North", "Bessemer", "Greylock",
];

const LogoTicker = () => {
  return (
    <div className="overflow-hidden py-12 border-y border-border bg-background">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...partners, ...partners].map((name, i) => (
          <div
            key={i}
            className="mx-8 flex-shrink-0 text-muted-foreground text-lg font-semibold tracking-wide opacity-40 hover:opacity-100 hover:text-primary transition-all duration-300 cursor-default"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoTicker;
