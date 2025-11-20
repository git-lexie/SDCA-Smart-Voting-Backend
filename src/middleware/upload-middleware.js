const multer = require("multer");

const storage = multer.memoryStorage(); // store in memory for cloud upload
const upload = multer({ storage });

module.exports = upload;
