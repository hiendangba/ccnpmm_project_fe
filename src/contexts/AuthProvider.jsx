import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authApi from "../api/authApi";
import userApi from "../api/userApi";
import { setTokenGetter } from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null
  );
  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
  }, []);

    useEffect(() => {
    if (token && !currentUser) {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setLoading(false);
        } else {
        userApi
            .getProfile()
            .then((user) => {
            setCurrentUser(user);
            localStorage.setItem("user", JSON.stringify(user));
            })
            .catch(() => {
            logout();
            })
            .finally(() => setLoading(false));
        }
    } else {
        setLoading(false); // nếu không có token thì cũng load xong
    }
    }, [token, currentUser, logout]);

  // Hàm login
  const login = async ({ mssv, password, remember }) => {
    try {
      const response = await authApi.login({ mssv, password });
      const { token, refreshToken } = response;
      // Nếu remember thì lưu localStorage, ngược lại sessionStorage
      if (remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      setToken(token);
      setTokenGetter(() => token);

      const user = await userApi.getProfile();
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      throw error; // Cho UI xử lý lỗi (ví dụ hiển thị "Sai tài khoản/mật khẩu")
    }
  };

  return (
<AuthContext.Provider value={{ currentUser, token, login, logout, loading }}>
  {children}
</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
