import bgAuth from "../../assets/bg_auth.png";

export default function AuthPage({ children, title }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgAuth})` }}
    >
      <div
        className="w-full max-w-md
                   bg-white/50 
                   py-6 px-8 
                   flex flex-col items-center
                   space-y-5
                   rounded-xl 
                   border border-white"
      >
        <h1
          className="text-3xl text-black 
                     font-bold 
                     drop-shadow-lg"
        >
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
