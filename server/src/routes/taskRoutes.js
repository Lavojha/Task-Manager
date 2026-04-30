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
import { validateRequest } from '../middleware/validate.js';
import {
  createTaskValidator,
  projectTaskParamValidator,
  taskIdParamValidator,
  updateTaskValidator,
} from '../validators/taskValidators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createTaskValidator, validateRequest, checkProjectAdmin, createTask);
router.get('/my-tasks', getMyTasks);
router.get('/project/:projectId', projectTaskParamValidator, validateRequest, checkProjectMember, getProjectTasks);
router.get('/dashboard/:projectId', projectTaskParamValidator, validateRequest, checkProjectMember, getDashboardStats);

router.route('/:id')
  .put(updateTaskValidator, validateRequest, updateTask)
  .delete(taskIdParamValidator, validateRequest, checkTaskProjectAdmin, deleteTask);

export default router;