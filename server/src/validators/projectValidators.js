import { body, param } from 'express-validator';

export const createProjectValidator = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a valid string'),
];

export const projectIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid project id'),
];

export const addMemberValidator = [
  param('projectId').isMongoId().withMessage('Invalid project id'),
  body('email').isEmail().withMessage('Valid member email is required').normalizeEmail(),
];

export const removeMemberValidator = [
  param('projectId').isMongoId().withMessage('Invalid project id'),
  param('userId').isMongoId().withMessage('Invalid user id'),
];
