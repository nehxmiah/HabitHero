import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Clock, Flame, Award } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { HabitCountStepper } from './HabitCountStepper';
import { HabitDurationTimer } from './HabitDurationTimer';

const CATEGORIES = [
  { name: 'Creativity & Hobbies', color: '#FF8A8A' },
  { name: 'Self-Care & Well-being', color: '#8B7FFF' },
  { name: 'Social & Relationships', color: '#4ADE80' },
  { name: 'Health & Fitness', color: '#FFA500' },
  { name: 'Productivity & Work', color: '#FF69F5' },
  { name: 'Personal Development', color: '#FFEB3B' },
];

export function DailyView() {
  const [selectedDate] = useState(new Date());
  const { habits, completions, toggleCompletion, updateCompletionCount, updateCompletionDuration, getCurrentStreak } = useHabits();

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = formatDate(date);
    return completions.some(c => c.habitId === habitId && c.date === dateStr);
  };

  const handleToggle = (habitId: string, date: Date) => {
    const dateStr = formatDate(date);
    toggleCompletion(habitId, dateStr);
  };

  const todayStr = formatDate(selectedDate);
  const todayHabits = habits.filter(h => 
    CATEGORIES.some(cat => cat.name === h.category)
  );

  const completedToday = todayHabits.filter(h => isCompleted(h.id, selectedDate)).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-[#4ADE80]">TODAY'S HABITS</h2>
          <p className="text-gray-400 mt-2">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-[#4ADE80]">{completedToday}/{todayHabits.length}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0a0a0a] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Daily Progress</span>
          <span className="text-sm font-bold">{Math.round((completedToday / todayHabits.length) * 100)}%</span>
        </div>
        <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-[#4ADE80] rounded-full transition-all duration-500"
            style={{ width: `${(completedToday / todayHabits.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {CATEGORIES.map(category => {
          const categoryHabits = todayHabits.filter(h => h.category === category.name);
          if (categoryHabits.length === 0) return null;

          return (
            <div key={category.name}>
              <h3 className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{category.name}</h3>
              <div className="space-y-2">
                {categoryHabits.map(habit => {
                  const completed = isCompleted(habit.id, selectedDate);
                  const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;
                  const todayCompletion = completions.find(c => c.habitId === habit.id && c.date === todayStr);
                  const streak = getCurrentStreak(habit.id);

                  return (
                    <div
                      key={habit.id}
                      className="rounded-lg p-4 transition-all"
                      style={{ backgroundColor: category.color }}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        {habit.type === 'check' && (
                          <button
                            onClick={() => handleToggle(habit.id, selectedDate)}
                            className={`w-12 h-12 rounded-lg border-4 border-black flex items-center justify-center transition-all ${
                              completed ? 'bg-black scale-95' : 'bg-transparent hover:scale-105'
                            }`}
                          >
                            {completed && <span className="text-2xl" style={{ color: category.color }}>✓</span>}
                          </button>
                        )}
                        
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6" style={{ color: category.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-black uppercase">{habit.name}</h4>
                              {streak > 0 && (
                                <div className="flex items-center gap-1 bg-black bg-opacity-20 px-2 py-0.5 rounded-full">
                                  <Flame className="w-3 h-3 text-orange-600" />
                                  <span className="text-xs font-bold text-black">{streak}</span>
                                </div>
                              )}
                            </div>
                            {habit.time && (
                              <div className="flex items-center gap-1 text-black text-sm mt-1 opacity-75">
                                <Clock className="w-4 h-4" />
                                <span>{habit.time}</span>
                              </div>
                            )}
                            {habit.description && (
                              <p className="text-sm text-black mt-1 opacity-75">{habit.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Count Type */}
                      {habit.type === 'count' && habit.targetCount && (
                        <HabitCountStepper
                          current={todayCompletion?.count || 0}
                          target={habit.targetCount}
                          color={category.color}
                          onIncrement={() => {
                            const newCount = (todayCompletion?.count || 0) + 1;
                            if (!todayCompletion) {
                              toggleCompletion(habit.id, todayStr);
                            }
                            updateCompletionCount(habit.id, todayStr, newCount);
                          }}
                          onDecrement={() => {
                            const newCount = Math.max(0, (todayCompletion?.count || 0) - 1);
                            updateCompletionCount(habit.id, todayStr, newCount);
                          }}
                        />
                      )}

                      {/* Duration Type */}
                      {habit.type === 'duration' && habit.targetDuration && (
                        <HabitDurationTimer
                          target={habit.targetDuration}
                          current={todayCompletion?.duration || 0}
                          color={category.color}
                          onUpdate={(duration) => {
                            if (!todayCompletion) {
                              toggleCompletion(habit.id, todayStr);
                            }
                            updateCompletionDuration(habit.id, todayStr, duration);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}