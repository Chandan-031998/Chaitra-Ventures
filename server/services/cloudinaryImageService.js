const { cloudinary } = require("../config/cloudinary");

function safeCloudinaryLog(error) {
  return {
    name: error?.name,
    code: error?.code,
    message: error?.message,
  };
}

function uploadImageBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "chaitra-ventures/properties",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [
          {
            width: 1800,
            height: 1400,
            crop: "limit",
          },
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          source: "cloudinary",
        });
      }
    );

    stream.end(buffer);
  });
}

async function uploadManyImages(files, options = {}) {
  const uploaded = [];
  for (const file of files) {
    const image = await uploadImageBuffer(file.buffer, {
      folder: options.folder,
      filename_override: file.originalname,
    });
    uploaded.push(image);
  }
  return uploaded;
}

async function deleteCloudinaryImage(publicId) {
  if (!publicId) return { result: "skipped" };

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

async function deleteManyCloudinaryImages(images) {
  for (const image of images) {
    const publicId = typeof image === "string" ? null : image?.public_id;
    if (!publicId) continue;

    try {
      await deleteCloudinaryImage(publicId);
    } catch (error) {
      console.error("Cloudinary cleanup failed", safeCloudinaryLog(error));
    }
  }
}

function normalizeStoredImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    const trimmed = image.trim();
    if (!trimmed) return null;

    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return normalizeStoredImage(parsed[0]);
        }
        return normalizeStoredImage(parsed);
      } catch {
        // Fall through to treat it as a legacy string
      }
    }

    return {
      url: trimmed,
      secure_url: /^https?:\/\//i.test(trimmed) ? trimmed : undefined,
      public_id: null,
      source: /^https?:\/\/res\.cloudinary\.com\//i.test(trimmed) ? "cloudinary" : "legacy",
    };
  }

  if (typeof image === "object") {
    const url = String(image.secure_url || image.url || image.src || "").trim();
    const publicId = image.public_id ? String(image.public_id).trim() : null;

    if (!url && !publicId) return null;

    return {
      url,
      secure_url: String(image.secure_url || image.url || "").trim() || url,
      public_id: publicId,
      width: image.width ?? null,
      height: image.height ?? null,
      format: image.format ?? null,
      bytes: image.bytes ?? null,
      source:
        publicId || /^https?:\/\/res\.cloudinary\.com\//i.test(url) ? "cloudinary" : "legacy",
    };
  }

  return null;
}

function normalizeStoredImages(value) {
  if (value == null || value === "") return [];

  if (Array.isArray(value)) {
    return value.map(normalizeStoredImage).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeStoredImages(parsed);
      } catch {
        return normalizeStoredImage(trimmed) ? [normalizeStoredImage(trimmed)] : [];
      }
    }

    return normalizeStoredImage(trimmed) ? [normalizeStoredImage(trimmed)] : [];
  }

  if (typeof value === "object") {
    return normalizeStoredImage(value) ? [normalizeStoredImage(value)] : [];
  }

  return [];
}

module.exports = {
  uploadImageBuffer,
  uploadManyImages,
  deleteCloudinaryImage,
  deleteManyCloudinaryImages,
  normalizeStoredImage,
  normalizeStoredImages,
};
