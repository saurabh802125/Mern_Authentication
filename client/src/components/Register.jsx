import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const verificationMethod = watch("verificationMethod");

  const handleRegister = async (data) => {
    data.phone = `+91${data.phone}`;
    
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/register", 
        data, 
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(response.data.message);

      if (data.verificationMethod === "none") {
        // If no verification needed, redirect to login or dashboard
        navigateTo("/login");
      } else {
        // Redirect to OTP verification for email/phone methods
        navigateTo(`/otp-verification/${data.email}/${data.phone}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit(handleRegister)} className="auth-form">
        <h2>Register</h2>
        
        <input
          type="text"
          placeholder="Name"
          required
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className="error">{errors.name.message}</span>}

        <input
          type="email"
          placeholder="Email"
          required
          {...register("email", { 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
        />
        {errors.email && <span className="error">{errors.email.message}</span>}

        <div className="phone-input">
          <span>+91</span>
          <input
            type="tel"
            placeholder="Phone Number"
            required
            {...register("phone", { 
              required: "Phone is required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Invalid Indian phone number"
              },
              minLength: {
                value: 10,
                message: "Phone must be 10 digits"
              },
              maxLength: {
                value: 10,
                message: "Phone must be 10 digits"
              }
            })}
          />
        </div>
        {errors.phone && <span className="error">{errors.phone.message}</span>}

        <input
          type="password"
          placeholder="Password"
          required
          {...register("password", { 
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters"
            }
          })}
        />
        {errors.password && <span className="error">{errors.password.message}</span>}

        <div className="verification-method">
          <p>Select Verification Method</p>
          <div className="radio-group">
            <label className={`radio-option ${verificationMethod === "none" ? "active" : ""}`}>
              <input
                type="radio"
                value="none"
                {...register("verificationMethod")}
              />
              <span>No Verification</span>
            </label>
            
            <label className={`radio-option ${verificationMethod === "email" ? "active" : ""}`}>
              <input
                type="radio"
                value="email"
                {...register("verificationMethod")}
              />
              <span>Email OTP</span>
            </label>
            
            <label className={`radio-option ${verificationMethod === "phone" ? "active" : ""}`}>
              <input
                type="radio"
                value="phone"
                {...register("verificationMethod")}
              />
              <span>Phone OTP</span>
            </label>
          </div>
        </div>

        <button type="submit" className="auth-button">
          Register
        </button>

        <p className="auth-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;