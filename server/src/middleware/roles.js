import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const checkProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project || req.params.id;
    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isAdmin = project.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === 'Admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking permissions',
      error: error.message,
    });
  }
};

export const checkProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project;
    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking permissions',
      error: error.message,
    });
  }
};

export const checkTaskProjectAdmin = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isAdmin = project.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === 'Admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.project = project;
    req.task = task;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking task permissions',
      error: error.message,
    });
  }
};