export default function InputField({
  type = "text",
  placeholder = "",
  value,
  onChange,
  variant = "auth",
  className = "",
  required = false
}) {
  const baseStyle =
    `px-10 py-2 
    transition-all duration-200
    focus:border-blue-500 focus:shadow-lg`;

  const variants = {
    auth: 
        `bg-white/50
        rounded-4xl 
        outline-none
        text-black text-[24px] 
        shadow-md  
        border-3 border-transparent`,
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    />
  );
}
