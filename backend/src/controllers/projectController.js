const Project = require("../models/Project");
const generateProjectKey = require("../services/projectKeyService");
const mongoose = require("mongoose");

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
        data: null,
      });
    }

    const apiKey = generateProjectKey();

    const project = await Project.create({
      owner: req.user._id,
      name,
      description,
      apiKey,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          apiKey: project.apiKey,
          active: project.active,
          createdAt: project.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: {
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
        data: null,
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};
const updateProject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
        data: null,
      });
    }
    const { name, description, active } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
        data: null,
      });
    }

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (active !== undefined) {
      project.active = active;
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
        data: null,
      });
    }
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
        data: null,
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
