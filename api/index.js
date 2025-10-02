const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from API!");
});

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
