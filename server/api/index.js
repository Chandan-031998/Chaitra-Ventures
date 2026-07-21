let app;
let startupError;

try {
  app = require("../index");

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
