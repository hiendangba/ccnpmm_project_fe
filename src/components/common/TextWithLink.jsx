import { Link } from "react-router-dom";

export default function TextWithLink({ text, linkText, to }) {
  return (
    <p className="text-black text-[24px]">
      {text} <Link to={to} className="text-blue-500 hover:underline">{linkText}</Link>
    </p>
  );
}