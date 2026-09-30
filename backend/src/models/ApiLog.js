const mongoose = require("mongoose");

const apiLogSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },

  method: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },

  endpoint: {
    type: String,
    required: true,
    trim: true,
  },

  statusCode: {
    type: Number,
    required: true,
  },

  responseTime: {
    type: Number,
    required: true,
    min: 0,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

apiLogSchema.index({ project: 1, timestamp: -1 });

const ApiLog = mongoose.model("ApiLog", apiLogSchema);

module.exports = ApiLog;
