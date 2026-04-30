import express from 'express';
import {
  createProject,
  getMyProjects,
  getProject,
  addMember,
  removeMember,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { checkProjectAdmin, checkProjectMember } from '../middleware/roles.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(createProject)
  .get(getMyProjects);

router.route('/:id')
  .get(getProject)
  .delete(checkProjectAdmin, deleteProject);

router.post('/:projectId/members', checkProjectAdmin, addMember);
router.delete('/:projectId/members/:userId', checkProjectAdmin, removeMember);

export default router;