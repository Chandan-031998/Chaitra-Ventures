require("dotenv").config();

const app = require("./index");

const PORT = Number(process.env.PORT || 5001);

app.listen(PORT, () => {
  console.log(`Chaitra Ventures API running locally on port ${PORT}`);
});
