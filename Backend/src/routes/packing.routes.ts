import { Router } from 'express';
import { togglePackedStatus, addPackingItem, removePackingItem } from '../controllers/packing.controller';
import { auth } from '../middleware/auth';
import { validateAddPackingItem } from '../middleware/validate';

const router = Router();

// All packing routes require authentication
router.use(auth);

// PATCH /api/trips/:id/packing/:itemIdx - Toggle packed status
router.patch('/:id/packing/:itemIdx', togglePackedStatus);

// POST /api/trips/:id/packing - Add custom packing item
router.post('/:id/packing', validateAddPackingItem, addPackingItem);

// DELETE /api/trips/:id/packing/:itemIdx - Remove packing item
router.delete('/:id/packing/:itemIdx', removePackingItem);

export default router;
