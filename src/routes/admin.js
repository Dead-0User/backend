const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

// Apply both middlewares to all admin routes
router.use(authMiddleware);
router.use(superAdminMiddleware);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with their restaurant info (super admin only)
 */
router.get("/users", async (req, res) => {
    try {
        console.log("Admin: Fetching all users...");
        const users = await User.find()
            .select("-password -otp -otpExpires")
            .sort({ createdAt: -1 });

        console.log(`Admin: Found ${users.length} users`);

        // Fetch restaurant info for each user
        const usersWithRestaurants = await Promise.all(
            users.map(async (user) => {
                const restaurant = await Restaurant.findOne({ ownerId: user._id });
                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isApproved: user.isApproved,
                    isSuperAdmin: user.isSuperAdmin,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    approvedAt: user.approvedAt,
                    approvedBy: user.approvedBy,
                    restaurant: restaurant
                        ? {
                            id: restaurant._id,
                            restaurantName: restaurant.restaurantName,
                            logo: restaurant.logo,
                        }
                        : null,
                };
            })
        );

        console.log(`Admin: Sending ${usersWithRestaurants.length} users in response`);

        res.json({
            success: true,
            data: usersWithRestaurants,
        });
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * @route   PUT /api/admin/users/:id/approve
 * @desc    Approve a user (super admin only)
 */
router.put("/users/:id/approve", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isApproved) {
            return res.status(400).json({
                success: false,
                message: "User is already approved",
            });
        }

        user.isApproved = true;
        user.approvedAt = new Date();
        user.approvedBy = req.userId; // Set by authMiddleware
        await user.save();

        res.json({
            success: true,
            message: "User approved successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved,
                approvedAt: user.approvedAt,
            },
        });
    } catch (err) {
        console.error("Approve User Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * @route   PUT /api/admin/users/:id/disable
 * @desc    Disable a user (super admin only)
 */
router.put("/users/:id/disable", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isSuperAdmin) {
            return res.status(400).json({
                success: false,
                message: "Cannot disable a super admin",
            });
        }

        if (!user.isApproved) {
            return res.status(400).json({
                success: false,
                message: "User is already disabled",
            });
        }

        user.isApproved = false;
        user.approvedAt = null;
        user.approvedBy = null;
        await user.save();

        res.json({
            success: true,
            message: "User disabled successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved,
            },
        });
    } catch (err) {
        console.error("Disable User Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics (super admin only)
 */
router.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const approvedUsers = await User.countDocuments({ isApproved: true });
        const pendingUsers = await User.countDocuments({ isApproved: false, isSuperAdmin: false });
        const superAdmins = await User.countDocuments({ isSuperAdmin: true });
        const totalRestaurants = await Restaurant.countDocuments();

        res.json({
            success: true,
            data: {
                totalUsers,
                approvedUsers,
                pendingUsers,
                superAdmins,
                totalRestaurants,
            },
        });
    } catch (err) {
        console.error("Get Stats Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
