import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { Trip } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus, Calendar, Trash2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Deletion State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data.data);
    } catch {
      setError('Failed to load trips');
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (tripId: string) => {
    setTripToDelete(tripId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tripToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/trips/${tripToDelete}`);
      setTrips((prev) => prev.filter((t) => t._id !== tripToDelete));
      toast.success('Trip deleted successfully');
    } catch {
      toast.error('Failed to delete trip');
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your trips..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {trips.length > 0
              ? `You have ${trips.length} trip${trips.length > 1 ? 's' : ''} planned`
              : 'Start planning your next adventure'}
          </p>
        </div>
        <Link to="/trips/new">
          <Button className="gap-2 rounded-xl py-5 px-5">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Trip Grid */}
      {trips.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <Compass className="h-8 w-8 text-primary animate-pulse-slow" />
          </div>
          <h2 className="text-xl font-bold mb-2">No trips yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first AI-powered trip itinerary, hotels list, and packing list to get started.
          </p>
          <Link to="/trips/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card
              key={trip._id}
              className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
            >
              {/* Card Header with travel themed banner gradient */}
              <div className="h-32 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 p-5 flex flex-col justify-end border-b border-border/30">
                <CardTitle className="text-xl font-extrabold truncate text-foreground">
                  {trip.destination}
                </CardTitle>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {trip.duration} days
                  </span>
                  <span className="capitalize font-semibold text-primary">
                    💰 {trip.budgetTier} Class
                  </span>
                </div>
              </div>

              {/* Card content */}
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Interests */}
                <div className="flex flex-wrap gap-1">
                  {trip.interests.slice(0, 3).map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="capitalize text-[10px] py-0 px-2"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {trip.interests.length > 3 && (
                    <Badge variant="outline" className="text-[10px] py-0 px-2">
                      +{trip.interests.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Estimated Budget Summary */}
                {trip.estimatedBudget && (
                  <p className="text-xs text-muted-foreground">
                    Est. budget:{' '}
                    <span className="text-foreground font-semibold">
                      ${trip.estimatedBudget.total?.toLocaleString()} {trip.estimatedBudget.currency}
                    </span>
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Link to={`/trips/${trip._id}`} className="flex-1">
                    <Button variant="secondary" className="w-full text-xs font-semibold">
                      View Itinerary
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(trip._id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label={`Delete trip to ${trip.destination}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Deletion confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? All generated itineraries, hotels, and packing lists will be lost forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
