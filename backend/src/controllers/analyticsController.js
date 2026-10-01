const mongoose = require("mongoose");
const Project = require("../models/Project");
const ApiLog = require("../models/ApiLog");

const getAnalyticsSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

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

    const result = await ApiLog.aggregate([
      {
        $match: {
          project: project._id,
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          errors: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0],
            },
          },
          averageResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);

    const summary = result[0] || {
      totalRequests: 0,
      errors: 0,
      averageResponseTime: 0,
    };

    const totalRequests = summary.totalRequests;
    const errors = summary.errors;
    const successfulRequests = totalRequests - errors;

    const errorRate =
      totalRequests === 0
        ? 0
        : Number(((errors / totalRequests) * 100).toFixed(2));

    const averageResponseTime =
      totalRequests === 0 ? 0 : Number(summary.averageResponseTime.toFixed(2));

    res.status(200).json({
      success: true,
      message: "Analytics summary retrieved successfully",
      data: {
        totalRequests,
        successfulRequests,
        errors,
        errorRate,
        averageResponseTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsTimeseries = async (req, res, next) => {
  try {
    const { id } = req.params;

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

    const points = await ApiLog.aggregate([
      {
        $match: {
          project: project._id,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp",
            },
          },
          requests: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          requests: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Analytics time-series retrieved successfully",
      data: {
        points,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsEndpoints = async (req, res, next) => {
  try {
    const { id } = req.params;

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

    const endpoints = await ApiLog.aggregate([
      {
        $match: {
          project: project._id,
        },
      },
      {
        $group: {
          _id: {
            method: "$method",
            endpoint: "$endpoint",
          },
          requests: { $sum: 1 },
          errors: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0],
            },
          },
          averageResponseTime: {
            $avg: "$responseTime",
          },
        },
      },
      {
        $project: {
          _id: 0,
          method: "$_id.method",
          endpoint: "$_id.endpoint",
          requests: 1,
          errors: 1,
          averageResponseTime: {
            $round: ["$averageResponseTime", 2],
          },
        },
      },
      {
        $sort: {
          requests: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Endpoint analytics retrieved successfully",
      data: {
        endpoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsSummary,
  getAnalyticsTimeseries,
  getAnalyticsEndpoints,
};
