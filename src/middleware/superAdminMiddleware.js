const jwt = require("jsonwebtoken");
const User = require("../models/User");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Middleware to verify user is a super admin
 * Must be used after authMiddleware
 */
const superAdminMiddleware = async (req, res, next) => {
    try {
        // Check if userId is set by authMiddleware
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Get user and check super admin status
        const user = await User.findById(req.userId).select("isSuperAdmin");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Super admin privileges required."
            });
        }

        next();
    } catch (err) {
        console.error("Super Admin Middleware Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = superAdminMiddleware;
