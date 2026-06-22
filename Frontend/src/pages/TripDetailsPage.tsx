import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import type { Trip, Activity, PackingItem } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import {
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Hotel as HotelIcon,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ArrowLeft,
  PlusCircle,
  X,
  Compass,
  PieChart as ChartIcon,
  Sun,
  CloudSun,
  Moon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Day in itinerary tab
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // Dialog States
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activityMode, setActivityMode] = useState<'add' | 'edit'>('add');
  const [selectedActIdx, setSelectedActIdx] = useState<number | null>(null);

  // Activity Form Fields
  const [actTime, setActTime] = useState('morning');
  const [actName, setActName] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actLoc, setActLoc] = useState('');
  const [actCost, setActCost] = useState<number>(0);
  const [actCategory, setActCategory] = useState('other');

  // Custom Packing Item Form
  const [newPackingItem, setNewPackingItem] = useState('');
  const [newPackingCategory, setNewPackingCategory] = useState('general');

  // AI actions loading states
  const [regeneratingDay, setRegeneratingDay] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTripDetails();
    }
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load trip details');
      toast.error('Could not fetch trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this complete trip? This action cannot be undone.')) return;
    setDeletingTrip(true);
    try {
      await api.delete(`/trips/${id}`);
      toast.success('Trip deleted successfully');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete trip');
      setDeletingTrip(false);
    }
  };

  // Activity Actions
  const openAddActivity = () => {
    setActivityMode('add');
    setActTime('morning');
    setActName('');
    setActDesc('');
    setActLoc('');
    setActCost(0);
    setActCategory('other');
    setIsActivityDialogOpen(true);
  };

  const openEditActivity = (idx: number, act: Activity) => {
    setActivityMode('edit');
    setSelectedActIdx(idx);
    setActTime(act.time);
    setActName(act.activity);
    setActDesc(act.description);
    setActLoc(act.location);
    setActCost(act.estimatedCost || 0);
    setActCategory(act.category || 'other');
    setIsActivityDialogOpen(true);
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    const payload = {
      time: actTime,
      activity: actName,
      description: actDesc,
      location: actLoc,
      estimatedCost: Number(actCost),
      category: actCategory,
    };

    const currentDayNumber = trip.itinerary[activeDayIdx].day;

    try {
      if (activityMode === 'add') {
        const res = await api.post(`/trips/${trip._id}/days/${currentDayNumber}/activities`, payload);
        setTrip(res.data.data);
        toast.success('Activity added successfully');
      } else {
        if (selectedActIdx === null) return;
        const res = await api.put(
          `/trips/${trip._id}/days/${currentDayNumber}/activities/${selectedActIdx}`,
          payload
        );
        setTrip(res.data.data);
        toast.success('Activity updated successfully');
      }
      setIsActivityDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save activity');
    }
  };

  const handleDeleteActivity = async (actIdx: number) => {
    if (!trip || !window.confirm('Delete this activity?')) return;
    const currentDayNumber = trip.itinerary[activeDayIdx].day;
    try {
      const res = await api.delete(`/trips/${trip._id}/days/${currentDayNumber}/activities/${actIdx}`);
      setTrip(res.data.data);
      toast.success('Activity removed');
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  const handleRegenerateDay = async () => {
    if (!trip) return;
    const currentDayNumber = trip.itinerary[activeDayIdx].day;
    setRegeneratingDay(true);
    try {
      const res = await api.post(`/trips/${trip._id}/days/${currentDayNumber}/regenerate`);
      setTrip(res.data.data);
      toast.success(`AI regenerated Day ${currentDayNumber} successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to regenerate day');
    } finally {
      setRegeneratingDay(false);
    }
  };

  // Packing Actions
  const handleTogglePacking = async (itemIdx: number) => {
    if (!trip) return;
    try {
      const res = await api.patch(`/trips/${trip._id}/packing/${itemIdx}`);
      setTrip({ ...trip, packingList: res.data.data });
    } catch {
      toast.error('Failed to update packing item');
    }
  };

  const handleAddPackingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !newPackingItem.trim()) return;

    try {
      const res = await api.post(`/trips/${trip._id}/packing`, {
        item: newPackingItem.trim(),
        category: newPackingCategory,
      });
      setTrip({ ...trip, packingList: res.data.data });
      setNewPackingItem('');
      toast.success('Packing item added');
    } catch {
      toast.error('Failed to add packing item');
    }
  };

  const handleRemovePackingItem = async (itemIdx: number) => {
    if (!trip) return;
    try {
      const res = await api.delete(`/trips/${trip._id}/packing/${itemIdx}`);
      setTrip({ ...trip, packingList: res.data.data });
      toast.success('Packing item removed');
    } catch {
      toast.error('Failed to remove packing item');
    }
  };

  // Helper values
  const getTimeIcon = (time: string) => {
    switch (time.toLowerCase()) {
      case 'morning':
        return <Sun className="h-5 w-5 text-amber-400" />;
      case 'afternoon':
        return <CloudSun className="h-5 w-5 text-orange-400" />;
      case 'evening':
        return <Moon className="h-5 w-5 text-indigo-400" />;
      default:
        return <Sun className="h-5 w-5 text-primary" />;
    }
  };

  // Organize packing items by category
  const getPackingByCategory = () => {
    if (!trip) return {};
    const categories: Record<string, { idx: number; item: PackingItem }[]> = {};
    trip.packingList.forEach((item, index) => {
      const cat = item.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ idx: index, item });
    });
    return categories;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Retrieving trip details..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
          <X className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops, something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error || 'Trip details could not be found.'}</p>
        <Link to="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const activeDay = trip.itinerary[activeDayIdx];
  const packingByCategory = getPackingByCategory();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Button
          variant="destructive"
          onClick={handleDeleteTrip}
          disabled={deletingTrip}
          className="gap-2 self-start sm:self-auto"
        >
          <Trash2 className="h-4 w-4" />
          {deletingTrip ? 'Deleting...' : 'Delete Trip'}
        </Button>
      </div>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-border p-6 sm:p-8 mb-8 hover:border-primary/20 transition-all duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge variant="outline" className="mb-3 capitalize border-primary/30 text-primary">
              👑 {trip.budgetTier} Class
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{trip.destination}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                {trip.duration} Days
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-success" />
                Est. Budget: ${trip.estimatedBudget?.total?.toLocaleString()} {trip.estimatedBudget?.currency}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {trip.interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="capitalize">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <Tabs defaultValue="itinerary" className="space-y-6">
        <TabsList className="grid grid-cols-4 bg-muted/50 p-1 rounded-xl w-full max-w-2xl">
          <TabsTrigger value="itinerary" className="rounded-lg gap-2 text-sm sm:text-base">
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Itinerary</span>
          </TabsTrigger>
          <TabsTrigger value="hotels" className="rounded-lg gap-2 text-sm sm:text-base">
            <HotelIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Hotels</span>
          </TabsTrigger>
          <TabsTrigger value="packing" className="rounded-lg gap-2 text-sm sm:text-base">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Packing</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="rounded-lg gap-2 text-sm sm:text-base">
            <ChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Budget</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== ITINERARY TAB ==================== */}
        <TabsContent value="itinerary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Days Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase px-2 mb-3">Days</h3>
              <div className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-none">
                {trip.itinerary.map((dayData, idx) => (
                  <button
                    key={dayData.day}
                    onClick={() => setActiveDayIdx(idx)}
                    className={`flex-shrink-0 text-left px-4 py-3 rounded-xl transition-all border w-32 lg:w-full ${
                      activeDayIdx === idx
                        ? 'bg-primary/10 border-primary text-primary font-medium'
                        : 'bg-card border-border hover:border-primary/20 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="text-xs">Day {dayData.day}</div>
                    <div className="text-sm font-semibold truncate max-w-[120px] lg:max-w-none">
                      {dayData.title || `Day ${dayData.day}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Day Activities View */}
            <div className="lg:col-span-3 space-y-6">
              {activeDay ? (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                        Day {activeDay.day} Itinerary
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold mt-0.5">{activeDay.title}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateDay}
                        disabled={regeneratingDay}
                        className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                      >
                        <Sparkles className="h-4 w-4" />
                        {regeneratingDay ? 'Regenerating...' : 'AI Regenerate Day'}
                      </Button>
                      <Button size="sm" onClick={openAddActivity} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Activity
                      </Button>
                    </div>
                  </div>

                  {/* Activities List */}
                  {activeDay.activities.length === 0 ? (
                    <div className="text-center py-12">
                      <Compass className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4 animate-pulse-slow" />
                      <h4 className="font-semibold mb-1">No activities for this day</h4>
                      <p className="text-sm text-muted-foreground mb-4">Add your first custom activity or click regenerate above.</p>
                      <Button size="sm" onClick={openAddActivity} variant="outline">
                        Add Activity
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeDay.activities.map((act, actIdx) => (
                        <div
                          key={actIdx}
                          className="group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-all duration-350"
                        >
                          <div className="flex items-start gap-3 flex-shrink-0">
                            <div className="p-2 rounded-lg bg-card border border-border">
                              {getTimeIcon(act.time)}
                            </div>
                            <div>
                              <Badge className="capitalize text-[10px] py-0 px-2" variant="secondary">
                                {act.time}
                              </Badge>
                              {act.estimatedCost ? (
                                <div className="text-xs font-semibold text-success mt-1">
                                  ${act.estimatedCost}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-base">{act.activity}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {act.description}
                            </p>
                            {act.location && (
                              <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-2">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{act.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex sm:flex-col items-center justify-end gap-1.5 self-end sm:self-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditActivity(actIdx, act)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              aria-label={`Edit activity ${act.activity}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteActivity(actIdx)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              aria-label={`Delete activity ${act.activity}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">Select a day to view itinerary.</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ==================== HOTELS TAB ==================== */}
        <TabsContent value="hotels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trip.hotels.map((hotel, idx) => (
              <Card key={idx} className="bg-card border-border overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">★ {hotel.rating || '4.0'} / 5</span>
                    <span className="text-sm font-bold text-success">${hotel.pricePerNight} / night</span>
                  </div>
                  <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">
                    {hotel.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{hotel.location || trip.destination}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1">
                    {hotel.amenities?.map((amenity, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-2 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <a
                    href={hotel.bookingUrl || 'https://booking.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full text-xs font-semibold py-2">
                      View Booking Options
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ==================== PACKING TAB ==================== */}
        <TabsContent value="packing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Custom add packing item Form */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Add Packing Item</CardTitle>
                  <CardDescription>Include custom luggage requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPackingItem} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="packing-item-name">Item Name</Label>
                      <Input
                        id="packing-item-name"
                        type="text"
                        placeholder="e.g. Universal adapter"
                        value={newPackingItem}
                        onChange={(e) => setNewPackingItem(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packing-category">Category</Label>
                      <select
                        id="packing-category"
                        value={newPackingCategory}
                        onChange={(e) => setNewPackingCategory(e.target.value)}
                        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="clothing">👕 Clothing</option>
                        <option value="toiletries">🧴 Toiletries</option>
                        <option value="electronics">🔌 Electronics</option>
                        <option value="documents">📄 Documents</option>
                        <option value="general">💼 General</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add to List
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Checklist items list */}
            <div className="lg:col-span-2 space-y-6">
              {Object.keys(packingByCategory).length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <p className="text-muted-foreground">No packing items. Add one using the form on the left.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(packingByCategory).map(([category, items]) => (
                    <Card key={category} className="bg-card border-border">
                      <CardHeader className="py-4 border-b border-border">
                        <CardTitle className="text-base font-bold capitalize flex items-center gap-2">
                          {category === 'clothing' && '👕'}
                          {category === 'toiletries' && '🧴'}
                          {category === 'electronics' && '🔌'}
                          {category === 'documents' && '📄'}
                          {category === 'general' && '💼'}
                          {category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {items.map(({ idx, item }) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 group/item border-b border-border/30 pb-2 last:border-0"
                          >
                            <label className="flex items-center gap-3 cursor-pointer text-sm select-none flex-1">
                              <Checkbox
                                id={`pack-${idx}`}
                                checked={item.packed}
                                onCheckedChange={() => handleTogglePacking(idx)}
                              />
                              <span className={`${item.packed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {item.item}
                              </span>
                            </label>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePackingItem(idx)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity"
                              aria-label={`Remove packing item ${item.item}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ==================== BUDGET TAB ==================== */}
        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total summary Card */}
            <Card className="bg-card border-border p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase">Total Estimated Budget</span>
                <div className="text-4xl font-extrabold text-success mt-2">
                  ${trip.estimatedBudget?.total?.toLocaleString()}{' '}
                  <span className="text-base font-semibold text-muted-foreground">
                    {trip.estimatedBudget?.currency}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on a {trip.duration}-day {trip.budgetTier} class travel strategy.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Avg / day:</span>
                <span className="font-bold text-foreground">
                  ${Math.round((trip.estimatedBudget?.total || 0) / (trip.duration || 1))}{' '}
                  {trip.estimatedBudget?.currency}
                </span>
              </div>
            </Card>

            {/* Budget Breakdown List Card */}
            <Card className="bg-card border-border md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                <CardDescription>Individual cost allocations estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Accommodation 🏨', amount: trip.estimatedBudget?.accommodation || 0 },
                  { label: 'Food & Dining 🍽️', amount: trip.estimatedBudget?.food || 0 },
                  { label: 'Transport & Flights ✈️', amount: trip.estimatedBudget?.transport || 0 },
                  { label: 'Activities & Sightseeing 🎟️', amount: trip.estimatedBudget?.activities || 0 },
                  { label: 'Miscellaneous & Emergency 🎒', amount: trip.estimatedBudget?.miscellaneous || 0 },
                ].map((item, idx) => {
                  const percent =
                    trip.estimatedBudget?.total && trip.estimatedBudget.total > 0
                      ? Math.round((item.amount / trip.estimatedBudget.total) * 100)
                      : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="font-semibold">
                          ${item.amount?.toLocaleString()} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ==================== DIALOGS ==================== */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{activityMode === 'add' ? 'Add New Activity' : 'Edit Activity'}</DialogTitle>
            <DialogDescription>
              Provide activity details. Click save to commit changes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleActivitySubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="act-time">Time of Day</Label>
                <select
                  id="act-time"
                  value={actTime}
                  onChange={(e) => setActTime(e.target.value)}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="morning">Morning 🌅</option>
                  <option value="afternoon">Afternoon ☀️</option>
                  <option value="evening">Evening 🌇</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="act-cost">Estimated Cost ($)</Label>
                <Input
                  id="act-cost"
                  type="number"
                  min={0}
                  value={actCost}
                  onChange={(e) => setActCost(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="act-name">Activity Title</Label>
              <Input
                id="act-name"
                type="text"
                placeholder="e.g. Visit Senso-ji Temple"
                value={actName}
                onChange={(e) => setActName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="act-desc">Description</Label>
              <Input
                id="act-desc"
                type="text"
                placeholder="Details, tips, opening times, etc."
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="act-loc">Location</Label>
              <Input
                id="act-loc"
                type="text"
                placeholder="Address or coordinates"
                value={actLoc}
                onChange={(e) => setActLoc(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="act-cat">Category</Label>
              <select
                id="act-cat"
                value={actCategory}
                onChange={(e) => setActCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="culture">🏛️ Culture</option>
                <option value="food">🍔 Food</option>
                <option value="nature">🌲 Nature</option>
                <option value="nightlife">🍺 Nightlife</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="relaxation">🏖️ Relaxation</option>
                <option value="other">🎭 Other</option>
              </select>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {activityMode === 'add' ? 'Add Activity' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
