import { Router } from 'express';
import { addActivity, updateActivity, removeActivity, regenerateDay } from '../controllers/activity.controller';
import { auth } from '../middleware/auth';
import { validateAddActivity } from '../middleware/validate';

const router = Router();

// All activity routes require authentication
router.use(auth);

// POST /api/trips/:id/days/:day/activities - Add activity to a day
router.post('/:id/days/:day/activities', validateAddActivity, addActivity);

// PUT /api/trips/:id/days/:day/activities/:actIdx - Update an activity
router.put('/:id/days/:day/activities/:actIdx', updateActivity);

// DELETE /api/trips/:id/days/:day/activities/:actIdx - Remove an activity
router.delete('/:id/days/:day/activities/:actIdx', removeActivity);

// POST /api/trips/:id/days/:day/regenerate - AI-regenerate a day
router.post('/:id/days/:day/regenerate', regenerateDay);

export default router;
