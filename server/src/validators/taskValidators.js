import { body, param } from 'express-validator';

const statusValues = ['To Do', 'In Progress', 'Done'];
const priorityValues = ['Low', 'Medium', 'High'];

export const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').isMongoId().withMessage('Valid project id is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage('Priority must be Low, Medium, or High'),
  body('assignedTo')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every((id) => typeof id === 'string' && id.length >= 12);
      }
      return typeof value === 'string';
    })
    .withMessage('assignedTo must be a user id or array of user ids'),
];

export const updateTaskValidator = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage('Status must be To Do, In Progress, or Done'),
  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be valid'),
  body('assignedTo')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every((id) => typeof id === 'string' && id.length >= 12);
      }
      return typeof value === 'string';
    })
    .withMessage('assignedTo must be a user id or array of user ids'),
];

export const projectTaskParamValidator = [
  param('projectId').isMongoId().withMessage('Invalid project id'),
];

export const taskIdParamValidator = [param('id').isMongoId().withMessage('Invalid task id')];
