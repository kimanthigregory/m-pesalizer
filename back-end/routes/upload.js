import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else cb(new Error("only pdfs are allowed"));
  },
});

router.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).send(`multerError:${err.message}`);
      } else {
        return res.status(400).send(err.message);
      }
    }
    res.send("file sent succesfully");

    // const filePath = req.file.path;

    // fs.readFile(filePath, (error, dataBuffer) => {
    //   if (err) {
    //     return res.status(500).send("error reading the file");
    //   }
    //   pdf(dataBuffer)
    //     .then((data) => {
    //       res.status(200).json({
    //         message: "file uploaded and parsed succesfully",
    //         text: data.text,
    //         info: data.info,
    //       });
    //     })
    //     .catch((pdfErr) => {
    //       res.status(500).send("error persing the pdf");
    //     });
    // });
  });
});

export default router;
