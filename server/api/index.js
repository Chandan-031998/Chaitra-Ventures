const path = require("path");

let app;
let startupError;

try {
  const loadCandidates = ["../index.js", path.join(process.cwd(), "index.js")];
  let lastError = null;

  for (const candidate of loadCandidates) {
    try {
      app = require(candidate);
      break;
    } catch (error) {
      lastError = error;
      if (error?.code !== "MODULE_NOT_FOUND") {
        throw error;
      }
    }
  }

  if (!app && lastError) {
    throw lastError;
  }

  if (typeof app !== "function") {
    throw new TypeError("Express application was not exported correctly");
  }
} catch (error) {
  startupError = error;

  console.error("Backend bootstrap failed", {
    name: error?.name,
    code: error?.code,
    message: error?.message,
    stack: error?.stack,
  });
}

module.exports = (req, res) => {
  if (startupError) {
    return res.status(500).json({
      success: false,
      stage: "bootstrap",
      error: startupError.code || startupError.name || "BOOTSTRAP_FAILED",
      message:
        startupError.code === "MODULE_NOT_FOUND"
          ? "Backend entry file or dependency was not bundled"
          : "Backend bootstrap failed",
    });
  }

  return app(req, res);
};
