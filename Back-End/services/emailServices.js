const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendVerificationEmail = async (userEmail, verificationCode) => {
  try {
    const mailOptions = {
      from: '"RecipeShare App" <from@example.com>',
      to: userEmail,
      subject: "Your Account Verification Code",

      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Welcome to RecipeShare!</h2>
          <p>Thank you for registering. Please use the following code to verify your account:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
            ${verificationCode}
          </p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail} (captured by Mailtrap)`);
  } catch (error) {
    console.error(`Error sending verification email to ${userEmail}:`, error);

    throw new Error("Could not send verification email.");
  }
};

module.exports = { sendVerificationEmail };
