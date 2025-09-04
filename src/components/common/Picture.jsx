export default function Avatar({
  src,
  alt = "avatar",
  variant = "circle",
  className = "",
  onClick,
}) {
  const baseStyle = `
    object-cover
    transition-all duration-200
    hover:scale-105
    shadow-md
  `;

  const variants = {
    circle: "rounded-full border-2 border-transparent hover:border-blue-500",
    rounded: "rounded-2xl border-2 border-transparent hover:border-blue-500",
    square: "rounded-none border-2 border-transparent hover:border-blue-500",
  };

  return (
    <img
      src={src || alt} 
      alt={alt}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    />
  );
}
