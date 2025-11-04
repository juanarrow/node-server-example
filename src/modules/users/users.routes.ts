import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { updateUserSchema } from './users.schema.js';
import { listUsersCtrl, getUserCtrl, meCtrl, updateUserCtrl, deleteUserCtrl } from './users.controller.js';

const router = Router();

router.get('/', auth, listUsersCtrl);
router.get('/me', auth, meCtrl);
router.get('/:id', auth, getUserCtrl);
router.patch('/:id', auth, validate(updateUserSchema), updateUserCtrl);
router.delete('/:id', auth, deleteUserCtrl);

export default router;

