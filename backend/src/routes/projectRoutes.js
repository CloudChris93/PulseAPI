const express = require("express");

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const {
  getAnalyticsSummary,
  getAnalyticsTimeseries,
  getAnalyticsEndpoints,
} = require("../controllers/analyticsController");

const { getProjectLogs } = require("../controllers/logController");

const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);

router.get("/:id/analytics/summary", getAnalyticsSummary);
router.get("/:id/analytics/timeseries", getAnalyticsTimeseries);
router.get("/:id/analytics/endpoints", getAnalyticsEndpoints);
router.get("/:id/logs", getProjectLogs);

router.get("/:id", getProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
