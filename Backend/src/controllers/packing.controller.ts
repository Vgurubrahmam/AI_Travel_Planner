import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Trip } from '../models/Trip';

/**
 * PATCH /api/trips/:id/packing/:itemIdx
 * Toggle packed/unpacked status of a packing item
 */
export const togglePackedStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const itemIndex = parseInt(req.params.itemIdx as string, 10);

    const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
    if (!trip) {
      throw ApiError.notFound('Trip not found');
    }

    if (itemIndex < 0 || itemIndex >= trip.packingList.length) {
      throw ApiError.badRequest('Invalid packing item index');
    }

    // Toggle the packed status
    trip.packingList[itemIndex].packed = !trip.packingList[itemIndex].packed;
    await trip.save();

    res.status(200).json(ApiResponse.success(trip.packingList, 'Packing status updated'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/packing
 * Add a custom packing item
 */
export const addPackingItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { item, category } = req.body;

    const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
    if (!trip) {
      throw ApiError.notFound('Trip not found');
    }

    trip.packingList.push({
      item,
      category,
      packed: false,
    });

    await trip.save();
    res.status(201).json(ApiResponse.success(trip.packingList, 'Packing item added'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/trips/:id/packing/:itemIdx
 * Remove a packing item
 */
export const removePackingItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const itemIndex = parseInt(req.params.itemIdx as string, 10);

    const trip = await Trip.findOne({ _id: id, userId: req.user!.id });
    if (!trip) {
      throw ApiError.notFound('Trip not found');
    }

    if (itemIndex < 0 || itemIndex >= trip.packingList.length) {
      throw ApiError.badRequest('Invalid packing item index');
    }

    trip.packingList.splice(itemIndex, 1);
    await trip.save();

    res.status(200).json(ApiResponse.success(trip.packingList, 'Packing item removed'));
  } catch (error) {
    next(error);
  }
};
