export default function CheckboxField({ text, onChange }) {
  return (
    <label className="flex items-center space-x-2 text-black text-[24px]">
      <input 
        type="checkbox" 
        onChange={onChange} 
        className="w-[20px] h-[20px] accent-blue-500 cursor-pointer"
      />
      <span>{text}</span>
    </label>
  );
}