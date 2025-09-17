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
    rounded: 
      `px-10 py-2
      bg-white/50
      rounded-4xl 
      outline-none
      text-black text-[24px] 
      shadow-md  
      border-3 border-transparent
      focus:border-blue-500 focus:shadow-lg`,
    ghost:
      `flex-1 p-10 bg-gray-100 
      rounded-xl 
      resize-none 
      focus:outline-none focus:bg-gray-50`
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
