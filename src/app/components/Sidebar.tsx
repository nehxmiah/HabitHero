import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { useLocation, useNavigate } from 'react-router';
import { Calendar, ChevronLeft, ChevronRight, Filter, Plus, TrendingUp, CheckCircle2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const CATEGORIES = [
  { name: 'Creativity & Hobbies', color: '#FF8A8A' },
  { name: 'Self-Care & Well-being', color: '#8B7FFF' },
  { name: 'Social & Relationships', color: '#4ADE80' },
  { name: 'Health & Fitness', color: '#FFA500' },
  { name: 'Productivity & Work', color: '#FF69F5' },
  { name: 'Personal Development', color: '#FFEB3B' },
];

export function Sidebar({ onClose }: { onClose: () => void }) {
  const { habits, completions, addHabit } = useHabits();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add padding for alignment
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const days = getDaysInMonth(selectedDate);
  const today = new Date();
  const todayStr = formatDate(today);

  // Quick stats
  const todayCompletions = completions.filter(c => c.date === todayStr).length;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const weekCompletions = completions.filter(c => {
    const date = new Date(c.date);
    return date >= weekStart && date <= weekEnd;
  }).length;

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthCompletions = completions.filter(c => {
    const date = new Date(c.date);
    return date >= monthStart && date <= monthEnd;
  }).length;

  const totalHabits = habits.length;

  return (
    <div className="w-80 bg-[#0a0a0a] border-r border-gray-800 flex flex-col h-screen overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800">
        <Button
          onClick={() => setShowAddHabit(true)}
          className="w-full bg-[#4ADE80] hover:bg-[#3DC970] text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Habit
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Mini Calendar */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <div key={idx} className="text-xs text-center text-gray-500 font-medium h-6 flex items-center justify-center">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              if (!day) {
                return <div key={idx} className="aspect-square" />;
              }

              const dayStr = formatDate(day);
              const isToday = dayStr === todayStr;
              const isSelected = dayStr === formatDate(selectedDate);
              const dayCompletions = completions.filter(c => c.date === dayStr).length;
              const hasActivity = dayCompletions > 0;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day);
                    if (location.pathname !== '/') {
                      navigate('/');
                    }
                  }}
                  className={`aspect-square rounded flex items-center justify-center text-xs relative ${
                    isSelected ? 'bg-[#4ADE80] text-black font-bold' :
                    isToday ? 'bg-gray-700 text-white font-bold' :
                    'hover:bg-gray-800'
                  }`}
                >
                  {day.getDate()}
                  {hasActivity && !isSelected && (
                    <div className="absolute bottom-0.5 w-1 h-1 bg-[#4ADE80] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4ADE80]" />
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Today</span>
              <span className="text-sm font-bold text-[#4ADE80]">{todayCompletions}/{totalHabits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">This Week</span>
              <span className="text-sm font-bold">{weekCompletions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">This Month</span>
              <span className="text-sm font-bold">{monthCompletions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Total Habits</span>
              <span className="text-sm font-bold">{totalHabits}</span>
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Categories
          </h3>
          <div className="space-y-2">
            {CATEGORIES.map(cat => {
              const categoryHabits = habits.filter(h => h.category === cat.name).length;
              const isSelected = selectedCategories.includes(cat.name);
              
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-gray-800' : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs">{cat.name.split(' & ')[0]}</span>
                  </div>
                  <span className="text-xs text-gray-400">{categoryHabits}</span>
                </button>
              );
            })}
          </div>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="w-full mt-2 text-xs text-gray-400 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* My Habits */}
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            My Habits
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {habits.map(habit => (
              <div
                key={habit.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="flex-1 truncate">{habit.name}</span>
                <span className="text-gray-500">{habit.goal || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Habit Dialog */}
      {showAddHabit && (
        <AddHabitDialog
          isOpen={showAddHabit}
          onClose={() => setShowAddHabit(false)}
          onAdd={addHabit}
        />
      )}
    </div>
  );
}

function AddHabitDialog({ isOpen, onClose, onAdd }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0].name,
    goal: 20,
    icon: 'Circle',
    type: 'check' as 'check' | 'count' | 'duration',
    targetCount: 8,
    targetDuration: 30,
    frequency: ['daily'] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = CATEGORIES.find(c => c.name === formData.category);
    onAdd({
      ...formData,
      color: category?.color || '#4ADE80',
      targetCount: formData.type === 'count' ? formData.targetCount : undefined,
      targetDuration: formData.type === 'duration' ? formData.targetDuration : undefined,
    });
    setFormData({ 
      name: '', 
      category: CATEGORIES[0].name, 
      goal: 20, 
      icon: 'Circle',
      type: 'check',
      targetCount: 8,
      targetDuration: 30,
      frequency: ['daily'],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create New Habit</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning meditation"
              required
              className="bg-[#0a0a0a] border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="type">Habit Type</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-sm"
            >
              <option value="check">Check-in (Simple completion)</option>
              <option value="count">Count (Track number, e.g., 8 glasses)</option>
              <option value="duration">Duration (Track time in minutes)</option>
            </select>
          </div>

          {formData.type === 'count' && (
            <div>
              <Label htmlFor="targetCount">Target Count Per Day</Label>
              <Input
                id="targetCount"
                type="number"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) })}
                min="1"
                max="100"
                className="bg-[#0a0a0a] border-gray-700"
              />
            </div>
          )}

          {formData.type === 'duration' && (
            <div>
              <Label htmlFor="targetDuration">Target Duration (minutes)</Label>
              <Input
                id="targetDuration"
                type="number"
                value={formData.targetDuration}
                onChange={(e) => setFormData({ ...formData, targetDuration: parseInt(e.target.value) })}
                min="1"
                max="240"
                className="bg-[#0a0a0a] border-gray-700"
              />
            </div>
          )}

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="goal">Monthly Goal</Label>
            <Input
              id="goal"
              type="number"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })}
              min="1"
              max="31"
              className="bg-[#0a0a0a] border-gray-700"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#4ADE80] hover:bg-[#3DC970] text-black">
              Create Habit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}