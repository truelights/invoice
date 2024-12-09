import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique filenames

// Define storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/logos"); // Temporary upload directory
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using UUID and maintain the original file extension
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

// File type validation function
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/; // Allowed file extensions
  const mimeType = allowedFileTypes.test(file.mimetype); // Check mimetype
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  ); // Check file extension

  if (mimeType && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and GIF files are allowed.")
    );
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Set file size limit to 5MB
  fileFilter, // Apply file type validation
});
