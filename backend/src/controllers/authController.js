import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validatePassword, generateOTP, isOTPExpired } from '../utils/validators.js';
import { sendOTPEmail } from '../services/emailService.js';

export const signup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        otp,
        otpExpiry
      },
      create: {
        email,
        otp,
        otpExpiry
      }
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: 'OTP sent to your email',
      userId: user.id
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Email, OTP, and password are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Update user - set password and verify
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password,
        isVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    // Generate JWT token
    const token = generateToken({ userId: updatedUser.id });

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP', message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }

    // Verify password (plain text comparison as per requirements)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
  }
};