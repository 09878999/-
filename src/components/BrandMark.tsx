interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <img
      className={`brand-mark ${className}`.trim()}
      src="./app-icon.png"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
