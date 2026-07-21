import { createRequire } from "module";

const require = createRequire(import.meta.url);
const app = require("../server/index.js");

if (typeof app !== "function") {
  throw new TypeError("Express application was not exported correctly");
}

export default app;
