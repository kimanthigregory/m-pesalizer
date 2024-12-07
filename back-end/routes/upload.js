import express from "express";
import multer from "multer";
import path from "path";
const router = express.Router();
const upload = multer({ dest: path.resolve("uploads/") });

router.post("/upload", upload.single("file"), (req, res) => {
  res.send("file uploaded succesfull");
  console.log(req.file);
});

export default router;
