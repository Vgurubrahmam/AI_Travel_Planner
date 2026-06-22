import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MapPin, Calendar, DollarSign, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const INTEREST_OPTIONS = [
  'culture', 'food', 'adventure', 'nature', 'history',
  'nightlife', 'shopping', 'relaxation', 'art', 'sports',
  'photography', 'architecture', 'music', 'wildlife', 'beaches',
];

export default function CreateTripPage() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 10
          ? [...prev, interest]
          : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!destination.trim()) {
      setError('Destination is required');
      return;
    }
    if (interests.length === 0) {
      setError('Select at least one interest');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/trips', {
        destination: destination.trim(),
        duration,
        budgetTier,
        interests,
      });
      navigate(`/trips/${res.data.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate trip. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 animate-fade-in px-4">
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Generating Your Trip</h2>
          <p className="text-muted-foreground max-w-md">
            AI is creating your personalized itinerary, hotel recommendations, budget estimates, and packing list...
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary animate-pulse-slow" />
          This may take 15-30 seconds
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Plan a New <span className="gradient-text">Adventure</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Tell us about your dream trip and AI will handle the rest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination" className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            Destination
          </Label>
          <Input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="e.g. Tokyo, Japan"
            className="text-lg py-6"
          />
        </div>

        {/* Duration */}
        <div className="space-y-4">
          <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            Duration: <span className="text-primary font-semibold">{duration} days</span>
          </Label>
          <Slider
            id="duration"
            min={1}
            max={30}
            step={1}
            value={[duration]}
            onValueChange={(val) => setDuration(val[0])}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 day</span>
            <span>30 days</span>
          </div>
        </div>

        {/* Budget Tier */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-primary" />
            Budget Tier
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {(['budget', 'moderate', 'luxury'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setBudgetTier(tier)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  budgetTier === tier
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                }`}
              >
                <div className="text-lg mb-1">
                  {tier === 'budget' && '💰'}
                  {tier === 'moderate' && '💎'}
                  {tier === 'luxury' && '👑'}
                </div>
                <div className="text-sm font-semibold capitalize">{tier}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Interests
            <span className="text-muted-foreground font-normal ml-1">
              ({interests.length}/10 selected)
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <Badge
                  key={interest}
                  variant={selected ? 'default' : 'secondary'}
                  className="cursor-pointer px-3.5 py-1.5 rounded-full text-sm font-medium capitalize select-none gap-1 transition-all"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                  {selected && <X className="h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={!destination.trim() || interests.length === 0}
          className="w-full py-6 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="h-5 w-5" />
          Generate Itinerary with AI
        </Button>
      </form>
    </div>
  );
}
