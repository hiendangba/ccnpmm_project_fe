import { useState, type ChangeEvent, type FormEvent } from "react";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Sự kiện input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sự kiện submit form
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    if (isLogin) {
      console.log("Login:", formData.email, formData.password);
    } else {
      console.log("Register:", formData.email, formData.password);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-2xl font-bold">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
            required
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
              required
            />
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-blue-500 hover:underline"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}
