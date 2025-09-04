export default function SelectField({
    fieldName,
    value,
    onChange,
    options = [],
    variant = "rounded",
    className = "",
    required = false,
    disabled,
}) {
  const baseStyle = `
    px-10 py-2 
    transition-all duration-200
    focus:border-blue-500 focus:shadow-lg
  `;

  const variants = {
    rounded: `
      bg-white/50
      rounded-4xl
      outline-none
      text-black text-[24px]
      shadow-md
      border-3 border-transparent
    `,
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${baseStyle} ${variants[variant]} ${className}`}
      >
        <option value="" disabled>-- {fieldName} --</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
