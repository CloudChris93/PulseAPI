const ApiLog = require("../models/ApiLog");

const ingestLog = async (req, res, next) => {
  try {
    const { method, endpoint, statusCode, responseTime, timestamp } = req.body;

    if (
      !method ||
      !endpoint ||
      statusCode === undefined ||
      responseTime === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "method, endpoint, statusCode and responseTime are required",
        data: null,
      });
    }

    if (typeof statusCode !== "number" || typeof responseTime !== "number") {
      return res.status(400).json({
        success: false,
        message: "statusCode and responseTime must be numbers",
        data: null,
      });
    }

    if (statusCode < 100 || statusCode > 599) {
      return res.status(400).json({
        success: false,
        message: "statusCode must be between 100 and 599",
        data: null,
      });
    }

    if (responseTime < 0) {
      return res.status(400).json({
        success: false,
        message: "responseTime cannot be negative",
        data: null,
      });
    }

    const log = await ApiLog.create({
      project: req.project._id,
      method,
      endpoint,
      statusCode,
      responseTime,
      timestamp,
    });

    res.status(201).json({
      success: true,
      message: "API log ingested successfully",
      data: {
        log,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ingestLog,
};
