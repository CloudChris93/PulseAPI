const Project = require("../models/Project");

const projectKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key is required",
        data: null,
      });
    }

    const project = await Project.findOne({
      apiKey,
    });

    if (!project) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
        data: null,
      });
    }

    if (!project.active) {
      return res.status(403).json({
        success: false,
        message: "Project is inactive",
        data: null,
      });
    }

    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = projectKeyAuth;
