export default function CheckboxField({ text, onChange }) {
  return (
    <label className="flex items-center space-x-2 text-black text-base">
      <input 
        type="checkbox" 
        onChange={onChange} 
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span>{text}</span>
    </label>
  );
}
