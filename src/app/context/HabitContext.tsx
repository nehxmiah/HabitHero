import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../../lib/supabase';

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
  created_at?: string;
  user_id?: string;
}

export interface HabitCompletion {
  id?: string;
  habit_id: string; // Changed from habitId to match DB
  date: string; // YYYY-MM-DD format
  completed: boolean;
  count?: number; // for count-type habits
  duration?: number; // for duration-type habits (in minutes)
  skipped?: boolean; // true if deliberately skipped
  created_at?: string;
  user_id?: string;
}

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  addHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  updateCompletionCount: (habitId: string, date: string, count: number) => Promise<void>;
  updateCompletionDuration: (habitId: string, date: string, duration: number) => Promise<void>;
  skipHabit: (habitId: string, date: string) => Promise<void>;
  getCompletionsForDate: (date: string) => HabitCompletion[];
  getCompletionsForHabit: (habitId: string, startDate: string, endDate: string) => HabitCompletion[];
  getSuccessRate: (startDate: string, endDate: string) => number;
  getCurrentStreak: (habitId: string) => number;
  getLongestStreak: (habitId: string) => number;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

  // Fetch initial data
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setCompletions([]);
      return;
    }

    const loadData = async () => {
      const [{ data: dbHabits }, { data: dbCompletions }] = await Promise.all([
        supabase.from('habits').select('*').order('created_at', { ascending: true }),
        supabase.from('habit_completions').select('*').order('date', { ascending: true })
      ]);

      if (dbHabits) setHabits(dbHabits);
      if (dbCompletions) setCompletions(dbCompletions);
    };

    loadData();
  }, [user]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    // We can confidently assert it will return the data with ID
    const { data, error } = await supabase
      .from('habits')
      .insert([{ ...habit, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      throw new Error(error.message);
    }

    if (data) {
      setHabits(prev => [...prev, data]);
    }
  };

  const removeHabit = async (habitId: string) => {
    if (!user) return;

    // Optimistic Update
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setCompletions(prev => prev.filter(c => c.habit_id !== habitId));

    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    
    if (error) {
      console.error('Error removing habit:', error);
      // Ideally we would rollback state here if it fails
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return;

    // Optimistic Update
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updates } : h));

    const { error } = await supabase.from('habits').update(updates).eq('id', habitId);

    if (error) {
      console.error('Error updating habit:', error);
    }
  };

  const toggleCompletion = async (habitId: string, date: string) => {
    if (!user) return;

    const existing = completions.find(c => c.habit_id === habitId && c.date === date);

    if (existing) {
      // Optimistic delete
      setCompletions(prev => prev.filter(c => !(c.habit_id === habitId && c.date === date)));
      
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .match({ habit_id: habitId, date });
        
      if (error) console.error('Error deleting completion:', error);
    } else {
      // Optimistic insert
      const newCompletion: HabitCompletion = { 
        habit_id: habitId, 
        date, 
        completed: true,
        user_id: user.id 
      };
      
      setCompletions(prev => [...prev, newCompletion]);

      const { data, error } = await supabase
        .from('habit_completions')
        .insert([newCompletion])
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting completion:', error);
        // Fallback or rollback might be needed in a robust system
      } else if (data) {
        // Swap with the actual DB item which has a real ID
        setCompletions(prev => prev.map(c => 
          c.habit_id === habitId && c.date === date ? data : c
        ));
      }
    }
  };

  const updateCompletionCount = async (habitId: string, date: string, count: number) => {
    if (!user) return;

    const existing = completions.find(c => c.habit_id === habitId && c.date === date);

    if (existing) {
      // Optimistic update
      setCompletions(prev => prev.map(c => 
        c.habit_id === habitId && c.date === date ? { ...c, count } : c
      ));

      await supabase
        .from('habit_completions')
        .update({ count })
        .match({ habit_id: habitId, date });
    } else {
      // Create new completion with count
      const newCompletion: HabitCompletion = { 
        habit_id: habitId, 
        date, 
        completed: true, 
        count,
        user_id: user.id
      };
      setCompletions(prev => [...prev, newCompletion]);

      const { data } = await supabase
        .from('habit_completions')
        .insert([newCompletion])
        .select()
        .single();

      if (data) {
        setCompletions(prev => prev.map(c => c.habit_id === habitId && c.date === date ? data : c));
      }
    }
  };

  const updateCompletionDuration = async (habitId: string, date: string, duration: number) => {
    if (!user) return;

    const existing = completions.find(c => c.habit_id === habitId && c.date === date);

    if (existing) {
      // Optimistic update
      setCompletions(prev => prev.map(c => 
        c.habit_id === habitId && c.date === date ? { ...c, duration } : c
      ));

      await supabase
        .from('habit_completions')
        .update({ duration })
        .match({ habit_id: habitId, date });
    } else {
      const newCompletion: HabitCompletion = { 
        habit_id: habitId, 
        date, 
        completed: true, 
        duration,
        user_id: user.id
      };
      setCompletions(prev => [...prev, newCompletion]);

      const { data } = await supabase
        .from('habit_completions')
        .insert([newCompletion])
        .select()
        .single();

      if (data) {
        setCompletions(prev => prev.map(c => c.habit_id === habitId && c.date === date ? data : c));
      }
    }
  };

  const skipHabit = async (habitId: string, date: string) => {
    if (!user) return;

    const existing = completions.find(c => c.habit_id === habitId && c.date === date);

    if (existing) {
      // Optimistic delete
      setCompletions(prev => prev.filter(c => !(c.habit_id === habitId && c.date === date)));
      await supabase.from('habit_completions').delete().match({ habit_id: habitId, date });
    } else {
      const newCompletion: HabitCompletion = { 
        habit_id: habitId, 
        date, 
        completed: false, 
        skipped: true,
        user_id: user.id
      };
      setCompletions(prev => [...prev, newCompletion]);

      const { data } = await supabase
        .from('habit_completions')
        .insert([newCompletion])
        .select()
        .single();

      if (data) {
        setCompletions(prev => prev.map(c => c.habit_id === habitId && c.date === date ? data : c));
      }
    }
  };

  // Helper getters
  const getCompletionsForDate = (date: string) => {
    return completions.filter(c => c.date === date);
  };

  const getCompletionsForHabit = (habitId: string, startDate: string, endDate: string) => {
    return completions.filter(c => 
      c.habit_id === habitId && 
      c.date >= startDate && 
      c.date <= endDate
    );
  };

  const getSuccessRate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (habits.length === 0) return 0;
    
    const totalPossible = habits.length * days;
    const totalCompleted = completions.filter(c => 
      c.date >= startDate && c.date <= endDate && c.completed
    ).length;
    
    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  };

  const getCurrentStreak = (habitId: string) => {
    const today = new Date();
    let streak = 0;
    let date = new Date(today);
    
    while (true) {
      const dateStr = date.toISOString().split('T')[0];
      const completion = completions.find(c => c.habit_id === habitId && c.date === dateStr);
      
      if (completion?.completed) {
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
    
    // Sort completions by date ascending
    const habitCompletions = completions
      .filter(c => c.habit_id === habitId && c.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (let i = 0; i < habitCompletions.length; i++) {
      const current = habitCompletions[i];
      const next = habitCompletions[i + 1];
      
      currentStreak++;
        
      if (!next || new Date(next.date).getTime() - new Date(current.date).getTime() > 24 * 60 * 60 * 1000) {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 0;
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