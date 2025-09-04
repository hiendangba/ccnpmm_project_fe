export default function MainPage({ children, title }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-200">
        <div className="bg-white/50 
                        py-[30px] px-[40px] 
                        flex flex-col items-center
                        space-y-[20px]
                        rounded-4xl 
                        border-1 border-white">
          <h1 className="text-[50px] text-black 
                    font-bold 
                    drop-shadow-lg">{title}</h1>
          {children}
        </div>
    </div>
  );
}