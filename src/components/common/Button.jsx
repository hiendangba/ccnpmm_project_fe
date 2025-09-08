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
    text-black text-[16px]
    shadow-md
    border-3 border-transparent 
    hover:border-blue-500 hover:shadow-lg
    px-4
    `,
    hamburger: `
      bg-white 
      rounded-full
      text-black text-[24px] font-bold
      shadow-md
      border-3 border-transparent
      hover:border-blue-500 hover:shadow-lg
    `,
    outline: `
      bg-white
      rounded-4xl
      text-black text-[16px]
      border-2 border-gray-300
      hover:border-blue-500 hover:bg-gray-50
      px-4
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