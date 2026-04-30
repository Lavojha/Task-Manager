import express from 'express';
import {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import {
  checkProjectAdmin,
  checkProjectMember,
  checkTaskProjectAdmin,
} from '../middleware/roles.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', checkProjectAdmin, createTask);
router.get('/my-tasks', getMyTasks);
router.get('/project/:projectId', checkProjectMember, getProjectTasks);
router.get('/dashboard/:projectId', checkProjectMember, getDashboardStats);

router.route('/:id')
  .put(updateTask)
  .delete(checkTaskProjectAdmin, deleteTask);

export default router;