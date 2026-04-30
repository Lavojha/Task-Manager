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
import { validateRequest } from '../middleware/validate.js';
import {
  addMemberValidator,
  createProjectValidator,
  projectIdParamValidator,
  removeMemberValidator,
} from '../validators/projectValidators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(createProjectValidator, validateRequest, createProject)
  .get(getMyProjects);

router.route('/:id')
  .get(projectIdParamValidator, validateRequest, getProject)
  .delete(projectIdParamValidator, validateRequest, checkProjectAdmin, deleteProject);

router.post('/:projectId/members', addMemberValidator, validateRequest, checkProjectAdmin, addMember);
router.delete(
  '/:projectId/members/:userId',
  removeMemberValidator,
  validateRequest,
  checkProjectAdmin,
  removeMember
);

export default router;