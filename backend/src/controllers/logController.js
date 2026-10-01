const mongoose = require("mongoose");
const Project = require("../models/Project");
const ApiLog = require("../models/ApiLog");

const getProjectLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "20", method, statusCode } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
        data: null,
      });
    }

    const project = await Project.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
        data: null,
      });
    }

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: "page must be a positive integer",
        data: null,
      });
    }

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "limit must be between 1 and 100",
        data: null,
      });
    }

    const filter = {
      project: project._id,
    };

    if (method) {
      filter.method = method.toUpperCase().trim();
    }

    if (statusCode !== undefined) {
      const parsedStatusCode = Number(statusCode);

      if (
        !Number.isInteger(parsedStatusCode) ||
        parsedStatusCode < 100 ||
        parsedStatusCode > 599
      ) {
        return res.status(400).json({
          success: false,
          message: "statusCode must be between 100 and 599",
          data: null,
        });
      }

      filter.statusCode = parsedStatusCode;
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [logs, total] = await Promise.all([
      ApiLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(parsedLimit),
      ApiLog.countDocuments(filter),
    ]);

    const pages = total === 0 ? 0 : Math.ceil(total / parsedLimit);

    res.status(200).json({
      success: true,
      message: "Project logs retrieved successfully",
      data: {
        logs,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectLogs,
};
