import express from "express";
import uploadRoutes from "./routes/upload.js";
const app = express();

const port = 3000;

app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`server running on  port ${port} `);
});
