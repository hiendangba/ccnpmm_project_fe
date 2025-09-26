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
    hover:border-blue-500 hover:shadow-lg`;

  const variants = {
    rounded: `
      bg-white 
      rounded-4xl
      text-black text-base
      shadow-md
      border border-transparent 
      hover:border-blue-500 hover:shadow-lg
      px-3
    `,
    hamburger: `
      bg-white 
      rounded-full
      text-black text-base font-bold
      shadow-md
      border border-transparent
      hover:border-blue-500 hover:shadow-lg
      px-3 py-2
    `,
    outline: `
      bg-white
      rounded-4xl
      text-black text-base
      border border-gray-300
      hover:border-blue-500 hover:bg-gray-50
      px-3
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
