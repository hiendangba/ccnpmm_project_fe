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
    px-4 py-2 
    transition-all duration-200
    focus:border-blue-500 focus:shadow-md
  `;

  const variants = {
    rounded: `
      px-4 py-2
      rounded-4xl
      outline-none
      text-black text-base
      shadow-md
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
        {fieldName && <option value="" disabled>-- {fieldName} --</option>}
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
