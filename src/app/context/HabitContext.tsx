import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Habit {
  id: string;
  name: string;
  category: string;
  color: string;
  goal: number; // times per month
  icon: string;
  description?: string;
  time?: string;
  type: 'check' | 'count' | 'duration'; // habit type
  targetCount?: number; // for count type (e.g., 8 glasses of water)
  targetDuration?: number; // for duration type (in minutes)
  frequency: string[]; // days of week: ['Mon', 'Tue', ...] or ['daily']
  reminders?: string[]; // reminder times
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  count?: number; // for count-type habits
  duration?: number; // for duration-type habits (in minutes)
  skipped?: boolean; // true if deliberately skipped
}

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  removeHabit: (habitId: string) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  updateCompletionCount: (habitId: string, date: string, count: number) => void;
  updateCompletionDuration: (habitId: string, date: string, duration: number) => void;
  skipHabit: (habitId: string, date: string) => void;
  getCompletionsForDate: (date: string) => HabitCompletion[];
  getCompletionsForHabit: (habitId: string, startDate: string, endDate: string) => HabitCompletion[];
  getSuccessRate: (startDate: string, endDate: string) => number;
  getCurrentStreak: (habitId: string) => number;
  getLongestStreak: (habitId: string) => number;
}

const HabitContext = createContext<HabitContextType | null>(null);

const SAMPLE_HABITS: Habit[] = [
  { id: '1', name: 'RELAXATION', category: 'Self-Care & Well-being', color: '#8B7FFF', icon: 'Heart', time: '15:00', type: 'check', goal: 20, frequency: ['daily'] },
  { id: '2', name: 'READING SCIENTIFIC PAPERS', category: 'Personal Development', color: '#FFEB3B', icon: 'BookOpen', time: '18:00-19:30', type: 'duration', targetDuration: 60, goal: 15, frequency: ['daily'] },
  { id: '3', name: 'INTERNET EXPLORATION', category: 'Creativity & Hobbies', color: '#FF8A8A', icon: 'Rocket', description: 'If there is enough time between classes', type: 'check', goal: 10, frequency: ['daily'] },
  { id: '4', name: 'POMODORO SESSIONS', category: 'Productivity & Work', color: '#FF69F5', icon: 'Timer', goal: 20, type: 'count', targetCount: 4, frequency: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: '5', name: 'Stretch or do yoga', category: 'Health & Fitness', color: '#4ADE80', icon: 'Dumbbell', goal: 5, type: 'check', frequency: ['daily'] },
  { id: '6', name: 'Walk 10,000 steps', category: 'Health & Fitness', color: '#3B82F6', icon: 'Footprints', goal: 7, type: 'check', frequency: ['daily'] },
  { id: '7', name: 'Read a book chapter', category: 'Personal Development', color: '#A78BFA', icon: 'Book', goal: 15, type: 'check', frequency: ['daily'] },
  { id: '8', name: 'Drink water', category: 'Health & Fitness', color: '#06B6D4', icon: 'Droplet', goal: 25, type: 'count', targetCount: 8, frequency: ['daily'] },
  { id: '9', name: 'Floss', category: 'Health & Fitness', color: '#EF4444', icon: 'Smile', goal: 20, type: 'check', frequency: ['daily'] },
  { id: '10', name: 'Play a guitar', category: 'Creativity & Hobbies', color: '#10B981', icon: 'Music', goal: 10, type: 'duration', targetDuration: 30, frequency: ['daily'] },
  { id: '11', name: 'Call grandpa', category: 'Social & Relationships', color: '#06B6D4', icon: 'Phone', goal: 10, type: 'check', frequency: ['Sun', 'Wed'] },
  { id: '12', name: 'Volunteer', category: 'Social & Relationships', color: '#8B5CF6', icon: 'Heart', goal: 3, type: 'check', frequency: ['Sat'] },
  { id: '13', name: 'Put $10 to savings', category: 'Personal Development', color: '#F59E0B', icon: 'DollarSign', goal: 10, type: 'check', frequency: ['Mon', 'Fri'] },
];

// Generate sample completions for the past 3 months
const generateSampleCompletions = (): HabitCompletion[] => {
  const completions: HabitCompletion[] = [];
  const today = new Date();
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    SAMPLE_HABITS.forEach(habit => {
      // Random completion with higher probability for some habits
      const completionRate = habit.goal ? habit.goal / 30 : 0.5;
      if (Math.random() < completionRate) {
        completions.push({
          habitId: habit.id,
          date: dateStr,
          completed: true,
        });
      }
    });
  }
  
  return completions;
};

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = localStorage.getItem('habits');
    return stored ? JSON.parse(stored) : SAMPLE_HABITS;
  });
  
  const [completions, setCompletions] = useState<HabitCompletion[]>(() => {
    const stored = localStorage.getItem('completions');
    return stored ? JSON.parse(stored) : generateSampleCompletions();
  });

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  const addHabit = (habit: Omit<Habit, 'id'>) => {
    const newHabit = { ...habit, id: Date.now().toString() };
    setHabits(prev => [...prev, newHabit]);
  };

  const removeHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setCompletions(prev => prev.filter(c => c.habitId !== habitId));
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updates } : h));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    setCompletions(prev => {
      const existing = prev.find(c => c.habitId === habitId && c.date === date);
      if (existing) {
        return prev.filter(c => !(c.habitId === habitId && c.date === date));
      } else {
        return [...prev, { habitId, date, completed: true }];
      }
    });
  };

  const updateCompletionCount = (habitId: string, date: string, count: number) => {
    setCompletions(prev => prev.map(c => 
      c.habitId === habitId && c.date === date ? { ...c, count } : c
    ));
  };

  const updateCompletionDuration = (habitId: string, date: string, duration: number) => {
    setCompletions(prev => prev.map(c => 
      c.habitId === habitId && c.date === date ? { ...c, duration } : c
    ));
  };

  const skipHabit = (habitId: string, date: string) => {
    setCompletions(prev => {
      const existing = prev.find(c => c.habitId === habitId && c.date === date);
      if (existing) {
        return prev.filter(c => !(c.habitId === habitId && c.date === date));
      } else {
        return [...prev, { habitId, date, completed: false, skipped: true }];
      }
    });
  };

  const getCompletionsForDate = (date: string) => {
    return completions.filter(c => c.date === date);
  };

  const getCompletionsForHabit = (habitId: string, startDate: string, endDate: string) => {
    return completions.filter(c => 
      c.habitId === habitId && 
      c.date >= startDate && 
      c.date <= endDate
    );
  };

  const getSuccessRate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const totalPossible = habits.length * days;
    const totalCompleted = completions.filter(c => 
      c.date >= startDate && c.date <= endDate
    ).length;
    
    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  };

  const getCurrentStreak = (habitId: string) => {
    const today = new Date();
    let streak = 0;
    let date = new Date(today);
    
    while (true) {
      const dateStr = date.toISOString().split('T')[0];
      const completion = completions.find(c => c.habitId === habitId && c.date === dateStr);
      
      if (completion && completion.completed) {
        streak++;
      } else {
        break;
      }
      
      date.setDate(date.getDate() - 1);
    }
    
    return streak;
  };

  const getLongestStreak = (habitId: string) => {
    let longestStreak = 0;
    let currentStreak = 0;
    const habitCompletions = completions.filter(c => c.habitId === habitId);
    
    for (let i = 0; i < habitCompletions.length; i++) {
      const current = habitCompletions[i];
      const next = habitCompletions[i + 1];
      
      if (current.completed) {
        currentStreak++;
        
        if (!next || new Date(next.date).getTime() - new Date(current.date).getTime() > 24 * 60 * 60 * 1000) {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 0;
        }
      }
    }
    
    return longestStreak;
  };

  return (
    <HabitContext.Provider value={{
      habits,
      completions,
      addHabit,
      removeHabit,
      updateHabit,
      toggleCompletion,
      updateCompletionCount,
      updateCompletionDuration,
      skipHabit,
      getCompletionsForDate,
      getCompletionsForHabit,
      getSuccessRate,
      getCurrentStreak,
      getLongestStreak,
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}