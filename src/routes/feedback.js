const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// POST /api/feedback - Submit feedback
router.post("/", async (req, res) => {
    try {
        const { restaurantId, rating, comment, customerName } = req.body;

        if (!restaurantId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newFeedback = new Feedback({
            restaurantId,
            rating,
            comment,
            customerName: customerName || "Anonymous",
        });

        await newFeedback.save();

        res.status(201).json({ success: true, message: "Feedback submitted successfully" });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// GET /api/feedback/:restaurantId - Get feedback for a restaurant (Private/Protected if needed, but keeping simple for now)
router.get("/:restaurantId", async (req, res) => {
    try {
        const { restaurantId } = req.params;
        // Just fetch last 50 feedbacks
        const feedbacks = await Feedback.find({ restaurantId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: feedbacks });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
