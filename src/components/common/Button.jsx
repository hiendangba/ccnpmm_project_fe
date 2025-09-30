export default function Button({
  type="button",
  text,
  onClick,
  variant = "rounded",
  className = "",
  disabled = false,
  children,
}) {
  const baseStyle =
    `py-2 
    transition-all duration-200
    hover:border-blue-500 hover:cursor-pointer hover:shadow-md`;

  const variants = {
    rounded: `
      bg-white 
      rounded-4xl
      text-black text-base
      shadow-md
      px-3
    `,
    hamburger: `
      bg-white 
      rounded-full
      text-black text-base font-bold
      shadow-md
      px-3 py-2
    `,
    icon: `
      bg-transparent
      rounded-lg
      border border-gray-300
      p-2
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children ?? text}
    </button>
  );
}
