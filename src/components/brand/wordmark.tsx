export function Wordmark({
  showSub = true,
  className = "",
}: {
  showSub?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className="gold-text font-serif text-3xl font-bold leading-none tracking-tight">
        NOOH
      </span>
      {showSub && (
        <span className="hidden text-[10px] uppercase tracking-[0.34em] text-muted-foreground sm:inline">
          Souvenir&nbsp;&amp;&nbsp;Hampers
        </span>
      )}
    </span>
  );
}
