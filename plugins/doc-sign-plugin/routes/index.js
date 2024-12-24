/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// plugins/doc-sign-plugin/routes/index.js
const express = require("express");
const router = express.Router();
const path = require("path");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
require('dotenv').config();
const { Op } = require("sequelize");
const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = (models) => {
  const { Document, Signature } = models;

  // Middleware to check authentication and admin role
  const authMiddleware = require("../../../middleware/authMiddleware");

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., Gmail, SendGrid, etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  // Utility function to generate a unique signature URL token
  function generateSignatureUrl(documentId, signerEmail) {
    const token = crypto.randomBytes(20).toString("hex");
    return token; // We'll store the token in the database and use it to build the URL
  }

  // Utility function to send signature emails
  function sendSignatureEmail(email, token, documentTitle) {
    const fullUrl = `${process.env.BASE_URL}/plugins/doc-sign-plugin/sign/${token}`; // BASE_URL from .env (e.g., https://yourapp.com)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Please sign the document: ${documentTitle}`,
      text: `Please sign the document by clicking the following link: ${fullUrl}`,
      html: `<p>Please sign the document by clicking the following link:</p><a href="${fullUrl}">Sign Document</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error(`Error sending email to ${email}:`, error);
      }
      console.log(`Email sent to ${email}: ${info.response}`);
    });
  }

  // Generate PDF and store or send as needed
  async function generatePDF(documentContent, signatureImage, outputPath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);
      doc.text(documentContent);
      if (signatureImage) {
        const imgData = signatureImage.replace(/^data:image\/\w+;base64,/, "");
        const imgBuffer = Buffer.from(imgData, 'base64');
        doc.image(imgBuffer, {
          fit: [250, 300],
          align: 'center',
          valign: 'bottom'
        });
      }
      doc.end();

      writeStream.on('finish', () => {
        console.log(`PDF generated at ${outputPath}`);
        resolve();
      });

      writeStream.on('error', (err) => {
        console.error('Error generating PDF:', err);
        reject(err);
      });
    });
  }

  // Route to serve the admin dashboard
  router.get("/dashboard", authMiddleware, async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).send("Access denied. Admins only.");
    }
    res.sendFile(path.join(__dirname, "../views", "dashboard.html"));
  });

  // API Route to create a new document and add signers
  router.post("/dashboard/create", authMiddleware, async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { title, content, signerEmails } = req.body;

    if (!title || !content || !Array.isArray(signerEmails) || signerEmails.length === 0) {
      return res.status(400).json({ error: "Title, content, and at least one signer email are required." });
    }

    try {
      // Create Document
      const document = await Document.create({
        title,
        content,
        createdBy: req.user.uid,
      });

      // Create Signatures
      const signatures = signerEmails.map((email) => {
        const token = generateSignatureUrl(document.id, email);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Token valid for 30 days
        return {
          documentId: document.id,
          signerEmail: email,
          signatureUrl: token,
          expiresAt: expiresAt,
        };
      });
      
      await Signature.bulkCreate(signatures);

      // Send Emails with Signature URLs
      signatures.forEach((sig) => {
        sendSignatureEmail(sig.signerEmail, sig.signatureUrl, document.title);
      });

      res.status(201).json({ message: "Document created and signature URLs sent." });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document." });
    }
  });

  // API Route to fetch documents and signatures for dashboard
  router.get("/dashboard/data", authMiddleware, async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { month } = req.query; // e.g., '2024-04'

    try {
      let startDate, endDate;
      if (month) {
        startDate = new Date(`${month}-01`);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const documents = await Document.findAll({
        include: {
          model: Signature,
          where: month
            ? {
                updatedAt: {
                  [Op.between]: [startDate, endDate],
                },
              }
            : {},
          required: false,
        },
      });

      res.status(200).json({ documents });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data." });
    }
  });

  // API Route to fetch document content as JSON
  router.get("/api/document/:token", authMiddleware, async (req, res) => {
    const { token } = req.params;

    try {
      const signature = await Signature.findOne({ where: { signatureUrl: token } });

      if (!signature) {
        return res.status(404).json({ error: "Invalid token." });
      }

      // Check if user is authenticated and email matches
      if (!req.user || req.user.email !== signature.signerEmail) {
        return res.status(403).json({ error: "Unauthorized access." });
      }

      const document = await Document.findByPk(signature.documentId);

      if (!document) {
        return res.status(404).json({ error: "Document not found." });
      }

      res.json({ content: document.content });
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(400).json({ error: "Failed to fetch document." });
    }
  });

  // Route to serve the signing page
  router.get("/sign/:token", authMiddleware, async (req, res) => {
    const { token } = req.params;

    try {
      const signature = await Signature.findOne({ where: { signatureUrl: token } });

      if (!signature) {
        return res.status(404).send("Invalid signature link.");
      }

      // Check if user is authenticated and email matches
      if (!req.user || req.user.email !== signature.signerEmail) {
        return res.status(403).send("Unauthorized access.");
      }

      if (signature.expiresAt < new Date()) {
        throw new Error("Token has expired.");
      }

      res.sendFile(path.join(__dirname, "../views", "sign.html"));
    } catch (error) {
      console.error("Error accessing signing page:", error);
      res.status(400).send("Invalid or expired signature link.");
    }
  });

  // API Route to handle signing
  router.post("/sign/:token", authMiddleware, async (req, res) => {
    const { token } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: "Signature data is required." });
    }

    try {
      const signatureRecord = await Signature.findOne({ where: { signatureUrl: token } });

      if (!signatureRecord) {
        return res.status(404).json({ error: "Signature not found." });
      }

      // Ensure the logged-in user's email matches the signer email
      if (!req.user || req.user.email !== signatureRecord.signerEmail) {
        return res.status(403).json({ error: "Unauthorized to sign this document." });
      }

      if (signatureRecord.signed) {
        return res.status(400).json({ error: "Document already signed." });
      }

      // Fetch the associated document
      const document = await Document.findByPk(signatureRecord.documentId);
      if (!document) {
        return res.status(404).json({ error: "Associated document not found." });
      }

      // Update signature as signed and store signature data
      signatureRecord.signed = true;
      signatureRecord.signedAt = new Date();
      signatureRecord.signatureImage = signature; // Ensure this field exists in your Signature model
      await signatureRecord.save();

      // Generate PDF with the signature
      const outputDir = path.join(__dirname, "../signed_documents");
      // Ensure the directory exists
      if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
      }
      const outputPath = path.join(outputDir, `document_${signatureRecord.id}.pdf`);
      await generatePDF(document.content, signatureRecord.signatureImage, outputPath);

      res.status(200).json({ message: "Document signed successfully." });
    } catch (error) {
      console.error("Error signing document:", error);
      res.status(400).json({ error: "Failed to sign document." });
    }
  });

  return router;
};
