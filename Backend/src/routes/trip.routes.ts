import { Router } from 'express';
import { createTrip, getTrips, getTripById, updateTrip, deleteTrip } from '../controllers/trip.controller';
import { auth } from '../middleware/auth';
import { validateCreateTrip } from '../middleware/validate';

const router = Router();

// All trip routes require authentication
router.use(auth);

// POST /api/trips - Generate new trip via AI
router.post('/', validateCreateTrip, createTrip);

// GET /api/trips - List all user's trips
router.get('/', getTrips);

// GET /api/trips/:id - Get single trip
router.get('/:id', getTripById);

// PUT /api/trips/:id - Update trip details
router.put('/:id', updateTrip);

// DELETE /api/trips/:id - Delete a trip
router.delete('/:id', deleteTrip);

export default router;
