import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, password, verificationMethod = 'none' } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Validate Indian phone number format (+91XXXXXXXXXX)
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return next(new ErrorHandler("Invalid Indian phone number format. Use +91 followed by 10 digits", 400));
  }

  // Check if user already exists (verified)
  const existingVerifiedUser = await User.findOne({
    $or: [
      { email, accountVerified: true },
      { phone, accountVerified: true }
    ]
  });

  if (existingVerifiedUser) {
    return next(new ErrorHandler("User already exists with this email or phone", 400));
  }

  // Check for too many unverified attempts
  const unverifiedAttempts = await User.countDocuments({
    $or: [
      { email, accountVerified: false },
      { phone, accountVerified: false }
    ],
    createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // Last 1 hour
  });

  if (unverifiedAttempts >= 3) {
    return next(new ErrorHandler("Too many registration attempts. Please try again later", 429));
  }

  // Create user
  const user = await User.create({ name, email, phone, password });

  // Handle different verification methods
  if (verificationMethod === 'none') {
    // Skip verification
    user.accountVerified = true;
    await user.save();
    return sendToken(user, 201, "Registration successful", res);
  }

  // Generate verification code for email/phone methods
  const verificationCode = await user.generateVerificationCode();
  await user.save();

  try {
    if (verificationMethod === 'email') {
      const message = generateEmailTemplate(verificationCode);
      await sendEmail({ email, subject: "Your Verification Code", message });
      
      return res.status(200).json({
        success: true,
        message: `Verification code sent to ${email}`,
        email,
        phone
      });
    } 
    else if (verificationMethod === 'phone') {
      // Using 2factor.in API for SMS
      const response = await axios.get(
        `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/${verificationCode}/YourAppName`
      );

      if (response.data.Status !== "Success") {
        throw new Error("Failed to send SMS OTP");
      }

      return res.status(200).json({
        success: true,
        message: `OTP sent to ${phone}`,
        email,
        phone
      });
    } 
    else {
      return next(new ErrorHandler("Invalid verification method", 400));
    }
  } catch (error) {
    // Clean up user if verification fails
    await User.deleteOne({ _id: user._id });
    return next(new ErrorHandler(`Failed to send verification code: ${error.message}`, 500));
  }
});

export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, phone, otp } = req.body;

  if (!otp || (!email && !phone)) {
    return next(new ErrorHandler("OTP and email/phone are required", 400));
  }

  // Find the most recent unverified user
  const user = await User.findOne({
    $or: [{ email }, { phone }],
    accountVerified: false
  }).sort({ createdAt: -1 });

  if (!user) {
    return next(new ErrorHandler("User not found or already verified", 404));
  }

  // Verify OTP
  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  // Check expiration
  if (Date.now() > user.verificationCodeExpire) {
    return next(new ErrorHandler("OTP has expired", 400));
  }

  // Mark as verified
  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save();

  // Cleanup any duplicate unverified entries
  await User.deleteMany({
    _id: { $ne: user._id },
    $or: [{ email }, { phone }],
    accountVerified: false
  });

  sendToken(user, 200, "Account verified successfully", res);
});

// Login controller remains the same
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, "Login successful", res);
});

// Logout controller
export const logout = catchAsyncError(async (req, res, next) => {
  res.status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    })
    .json({
      success: true,
      message: "Logged out successfully"
    });
});

// Get user details
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user
  });
});

// Password reset controllers
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email, accountVerified: true });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `Your password reset token is:\n\n${resetUrl}\n\nIf you didn't request this, please ignore.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Recovery",
      message
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords don't match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Password updated successfully", res);
});

// Helper function for email template
function generateEmailTemplate(code) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Verification Code</h2>
      <p>Your verification code is:</p>
      <div style="text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; color: #2563eb;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;
}