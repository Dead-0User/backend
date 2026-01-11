require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function main() {
    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log("✅ SMTP Verification Successful!");

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: "Test Email from QRMenu Debugger",
            text: "If you see this, your email configuration is correct!"
        });
        console.log("✅ Message sent: %s", info.messageId);
    } catch (err) {
        console.error("❌ Error:", err);
    }
}

main();
