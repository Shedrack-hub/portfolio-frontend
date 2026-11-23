"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const app = express();
const port = Number(process.env.PORT || 3001);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed"));
    }
  })
);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many messages. Please try again later." }
});

function getTransport() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.CONTACT_TO
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

app.get("/api/health", (_request, response) => {
  response.json({ success: true, status: "ok" });
});

app.post("/api/contact", contactLimiter, async (request, response) => {
  if (request.body.company) {
    response.status(400).json({ success: false, message: "Unable to send message." });
    return;
  }

  const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
  const email = typeof request.body.email === "string" ? request.body.email.trim() : "";
  const message = typeof request.body.message === "string" ? request.body.message.trim() : "";

  if (!name || !email || !message) {
    response.status(400).json({
      success: false,
      message: "Name, email, and message are required."
    });
    return;
  }

  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    response.status(400).json({ success: false, message: "Message content is too long." });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ success: false, message: "Enter a valid email address." });
    return;
  }

  const transport = getTransport();
  if (!transport) {
    console.error("Contact email is not configured.");
    response.status(503).json({
      success: false,
      message: "The contact service is temporarily unavailable."
    });
    return;
  }

  try {
    await transport.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });

    response.status(200).json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    response.status(502).json({
      success: false,
      message: "The message could not be delivered. Please try again later."
    });
  }
});

app.use((error, _request, response, _next) => {
  if (error && error.message === "Origin is not allowed") {
    response.status(403).json({ success: false, message: "Origin is not allowed." });
    return;
  }
  response.status(400).json({ success: false, message: "Invalid request." });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Portfolio backend listening on port ${port}`);
  });
}

module.exports = app;
