export default function InputField({
  type = "text",
  placeholder = "",
  value,
  onChange,
  variant = "rounded",
  className = "",
  required = true,
  readOnly = false, 
  ...props
}) {
  const baseStyle =
    `transition-all duration-200`;

  const variants = {
    rounded: `
      px-4 py-2
      bg-white/50
      rounded-4xl
      outline-none
      text-black text-base
      shadow-md  
      border border-transparent
      focus:border-blue-500 focus:shadow-md
    `,
    ghost: `
      flex-1 px-4 py-2 bg-gray-100 
      rounded-md
      resize-none 
      focus:outline-none focus:bg-gray-50
    `
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      readOnly={readOnly}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
