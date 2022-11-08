const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

// midile war
app.use(cors(""));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("photographey server is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
