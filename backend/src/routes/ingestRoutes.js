const express = require("express");
const { ingestLog } = require("../controllers/ingestController");
const projectKeyAuth = require("../middleware/projectKeyAuth");

const router = express.Router();

router.post("/", projectKeyAuth, ingestLog);

module.exports = router;
