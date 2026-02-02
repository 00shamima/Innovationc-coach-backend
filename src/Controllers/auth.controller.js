const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                role: role || 'USER', 
                isApproved: false 
            }
        });
        return res.status(201).json({ message: "Registration successful! Wait for Admin approval." });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Email not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong password" });

        if (user.role === 'USER' && !user.isApproved) {
            return res.status(403).json({ message: "Pending approval", userName: user.name });
        }

        const token = generateToken(user.id, user.role);
        return res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Login error" });
    }
};

const googleLogin = async (req, res) => {
    const { idToken } = req.body; 
    if (!idToken) return res.status(400).json({ message: "Google token is required" });

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: tempPassword,
                    role: 'USER',
                    isApproved: false 
                },
            });
            return res.status(403).json({ message: "Pending approval", userName: user.name });
        }

        if (user.role === 'USER' && !user.isApproved) {
            return res.status(403).json({ message: "Pending approval", userName: user.name });
        }

        const jwtToken = generateToken(user.id, user.role);
        return res.json({ 
            token: jwtToken, 
            user: { id: user.id, email: user.email, name: user.name, role: user.role } 
        });
    } catch (error) {
        console.error("Google Login Auth Error:", error.message);
        return res.status(401).json({ message: "Google Authentication failed" });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
        await prisma.user.update({
            where: { email },
            data: { otp: otp, otpExpiry: otpExpiry }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset</h2>
                    <p>OTP: <b>${otp}</b></p>
                   </div>`
        });

        return res.json({ message: "OTP sent to your email" });
    } catch (error) {
        return res.status(500).json({ message: "Error sending OTP" });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, otp: null, otpExpiry: null }
        });

        return res.json({ message: "Password reset successful!" });
    } catch (error) {
        return res.status(500).json({ message: "Error resetting password" });
    }
};

const checkStatus = async (req, res) => {
    const { email } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { isApproved: true, role: true, name: true }
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching status" });
    }
};

module.exports = { register, login, googleLogin, forgotPassword, resetPassword, checkStatus };