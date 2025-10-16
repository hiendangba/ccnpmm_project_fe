export default function Picture({
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
    circle: "rounded-full border border-transparent hover:border-blue-500",
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
