const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const port = Number(process.env.PORT || 3000);
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    callback(null, allowedTypes.includes(file.mimetype));
  },
});

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "100kb" }));

function requiredText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sendValidationError(response, fields) {
  return response.status(400).json({
    error: "validation_error",
    fields,
  });
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post(
  "/api/forms/join",
  upload.single("cv"),
  async (request, response, next) => {
    const { name, email, phone, message = "" } = request.body;
    const invalidFields = [];

    if (!requiredText(name)) invalidFields.push("name");
    if (!validEmail(email)) invalidFields.push("email");
    if (!requiredText(phone)) invalidFields.push("phone");

    if (invalidFields.length > 0) {
      return sendValidationError(response, invalidFields);
    }

    const joinTeamApiKey =
      process.env.JOIN_TEAM_API_KEY || process.env.INQUIRIES_API_KEY;
    if (!joinTeamApiKey) {
      return response.status(500).json({ error: "join_team_api_key_missing" });
    }

    try {
      const formData = new FormData();
      formData.append("full_name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phone", phone.trim());
      formData.append("message", String(message).trim());
      if (request.file) {
        formData.append(
          "cv",
          new Blob([request.file.buffer], { type: request.file.mimetype }),
          request.file.originalname,
        );
      }

      const upstreamResponse = await fetch(
        "https://portal.themegaparagon.net/api/v1/website/join-team",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "X-API-Key": joinTeamApiKey,
          },
          body: formData,
        },
      );

      const contentType = upstreamResponse.headers.get("content-type") || "";
      const upstreamBody = contentType.includes("application/json")
        ? await upstreamResponse.json()
        : { message: await upstreamResponse.text() };

      return response.status(upstreamResponse.status).json(upstreamBody);
    } catch (error) {
      return next(error);
    }
  },
);

app.post("/api/forms/inquiry", async (request, response, next) => {
  const { name, email, phone, subject = "", message = "" } = request.body;
  const invalidFields = [];

  if (!requiredText(name)) invalidFields.push("name");
  if (!validEmail(email)) invalidFields.push("email");
  if (!requiredText(phone)) invalidFields.push("phone");

  if (invalidFields.length > 0) {
    return sendValidationError(response, invalidFields);
  }

  if (!process.env.INQUIRIES_API_KEY) {
    return response.status(500).json({ error: "inquiries_api_key_missing" });
  }

  try {
    const upstreamResponse = await fetch(
      "https://portal.themegaparagon.net/api/v1/website/inquiries",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": process.env.INQUIRIES_API_KEY,
        },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          subject: String(subject).trim(),
          message: String(message).trim(),
        }),
      },
    );

    const contentType = upstreamResponse.headers.get("content-type") || "";
    const upstreamBody = contentType.includes("application/json")
      ? await upstreamResponse.json()
      : { message: await upstreamResponse.text() };

    return response.status(upstreamResponse.status).json(upstreamBody);
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  if (
    error instanceof multer.MulterError ||
    error.message === "File too large"
  ) {
    return response.status(400).json({ error: "cv_upload_invalid" });
  }
  console.error(error);
  return response.status(500).json({ error: "internal_server_error" });
});

app.listen(port, () => {
  console.log(`Mega Paragon forms API listening on port ${port}`);
});
