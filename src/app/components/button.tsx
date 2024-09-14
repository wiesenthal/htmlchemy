export function Button({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`via-green-550/90 rounded-full bg-gradient-to-t from-green-500 to-green-600 p-2 px-8 text-green-950 drop-shadow-xl hover:bg-gradient-to-b hover:drop-shadow-none disabled:opacity-50 disabled:hover:bg-gradient-to-t ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
