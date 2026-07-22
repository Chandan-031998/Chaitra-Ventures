const app = require("../index");

if (typeof app !== "function") {
  throw new TypeError("Express application was not exported correctly");
}

module.exports = app;
