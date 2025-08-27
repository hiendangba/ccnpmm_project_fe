export default function Button({
  type="button",
  text,
  onClick,
  variant = "auth",
  className = ""
}) {
  const baseStyle =
    `py-2 
    transition-all duration-200
    hover:border-blue-500 hover:shadow-lg`;

const variants = {
  auth: 
    `bg-white 
    rounded-4xl
    text-black text-[24px]
    shadow-md
    border-3 border-transparent 
    hover:border-blue-500 hover:shadow-lg`,
};


  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}>
      {text}
    </button>
  );
}