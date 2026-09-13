interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: { img: 'h-7', text: 'text-lg' },
  md: { img: 'h-9', text: 'text-xl' },
  lg: { img: 'h-11', text: 'text-2xl' },
};

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/logo.png" alt="Campora" className={`${s.img} w-auto`} />
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-white ${s.text}`}>
          Campora
        </span>
      )}
    </span>
  );
}
