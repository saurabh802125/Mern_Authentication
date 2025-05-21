import React, { useContext, useEffect } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    // If authenticated, redirect to Dashboard (root path)
    if (isAuthenticated) {
      navigateTo("/");
    }
  }, [isAuthenticated, navigateTo]);

  const logout = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setUser(null);
      setIsAuthenticated(false);
      navigateTo("/auth");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }

  return (
    <div className="home-redirect">
      <p>Redirecting to Dashboard...</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;