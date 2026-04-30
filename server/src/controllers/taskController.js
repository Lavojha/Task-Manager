import Task from '../models/Task.js';
import Project from '../models/Project.js';


export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    const assigneeIds = Array.isArray(assignedTo)
      ? [...new Set(assignedTo.filter(Boolean))]
      : assignedTo
      ? [assignedTo]
      : [];
    const memberIds = req.project.members.map((member) => member.user.toString());
    const hasInvalidAssignee = assigneeIds.some((id) => !memberIds.includes(id));

    if (hasInvalidAssignee) {
      return res.status(400).json({
        success: false,
        message: 'All assigned users must be project members',
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assigneeIds,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const currentMember = req.project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );
    const isAdmin = currentMember?.role === 'Admin';

    const query = { project: req.params.projectId };
    if (!isAdmin) {
      query.assignedTo = { $in: [req.user._id] };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: { $in: [req.user._id] } })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check permissions
    const project = await Project.findById(task.project);
    const isAdmin = project.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === 'Admin'
    );

    const isAssigned = Array.isArray(task.assignedTo)
      ? task.assignedTo.some((userId) => userId.toString() === req.user._id.toString())
      : false;

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    // Members can only update status
    if (!isAdmin && isAssigned) {
      if (status) task.status = status;
    } else {
      // Admin can update everything
      if (title) task.title = title;
      if (description) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
      if (assignedTo !== undefined) {
        const assigneeIds = Array.isArray(assignedTo)
          ? [...new Set(assignedTo.filter(Boolean))]
          : assignedTo
          ? [assignedTo]
          : [];
        const memberIds = project.members.map((member) => member.user.toString());
        const hasInvalidAssignee = assigneeIds.some((id) => !memberIds.includes(id));

        if (hasInvalidAssignee) {
          return res.status(400).json({
            success: false,
            message: 'All assigned users must be project members',
          });
        }

        task.assignedTo = assigneeIds;
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const currentMember = req.project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );
    const isAdmin = currentMember?.role === 'Admin';

    const query = { project: projectId };
    if (!isAdmin) {
      query.assignedTo = { $in: [req.user._id] };
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name');

    const totalTasks = tasks.length;

    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === 'To Do').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      done: tasks.filter((t) => t.status === 'Done').length,
    };

    const overdueTasks = tasks.filter(
      (t) => t.status !== 'Done' && new Date(t.dueDate) < new Date()
    ).length;

    const tasksPerUser = {};
    tasks.forEach((task) => {
      const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      assignees.forEach((assignee) => {
        const userId = assignee._id.toString();
        const userName = assignee.name;

        if (!tasksPerUser[userId]) {
          tasksPerUser[userId] = {
            name: userName,
            count: 0,
          };
        }
        tasksPerUser[userId].count++;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        tasksByStatus,
        overdueTasks,
        tasksPerUser: Object.values(tasksPerUser),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
};