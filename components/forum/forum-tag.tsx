type BadgeProps = {
  value: string;
};

export function Badge({ value }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
      {value}
    </span>
  );
}
