import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MonthlyView() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { habits, completions } = useHabits();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = formatDate(date);
    return completions.some(c => c.habitId === habitId && c.date === dateStr);
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() + delta);
    setSelectedMonth(newDate);
  };

  const days = getDaysInMonth(selectedMonth);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const monthStr = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate success rate
  const totalPossible = habits.length * days.length;
  const completedCount = completions.filter(c => {
    const date = new Date(c.date);
    return date >= firstDay && date <= lastDay;
  }).length;
  const successRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;

  // Prepare chart data
  const chartData = days.map(day => {
    const dateStr = formatDate(day);
    const count = completions.filter(c => c.date === dateStr).length;
    return {
      day: day.getDate(),
      count,
    };
  });

  // Calculate progress for each habit
  const habitProgress = habits.map(habit => {
    const completed = completions.filter(c => 
      c.habitId === habit.id && 
      c.date >= formatDate(firstDay) && 
      c.date <= formatDate(lastDay)
    ).length;
    const progress = habit.goal ? Math.round((completed / habit.goal) * 100) : Math.round((completed / days.length) * 100);
    return { habit, completed, progress: Math.min(progress, 100) };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-4xl font-bold text-[#4ADE80]">{monthStr}</h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-right">
          <div className="text-5xl font-bold text-[#4ADE80]">{successRate}%</div>
          <div className="text-sm text-gray-400">Success Rate</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#0a0a0a] rounded-lg p-6">
        <h3 className="text-sm font-semibold mb-4">Daily Completions</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4ADE80"
              strokeWidth={3}
              dot={{ fill: '#4ADE80', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Habit Grid */}
      <div className="bg-[#0a0a0a] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 sticky left-0 bg-[#0a0a0a] z-10">HABIT</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">GOAL</th>
                {days.map((day, idx) => (
                  <th key={idx} className="px-2 py-3 text-center text-xs font-medium">
                    <div className="text-gray-400">{day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</div>
                    <div className="text-white">{day.getDate()}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">PROGRESS</th>
              </tr>
            </thead>
            <tbody>
              {habitProgress.map(({ habit, completed, progress }) => (
                <tr key={habit.id} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="px-4 py-3 sticky left-0 bg-[#0a0a0a] z-10">
                    <div className="text-sm font-medium">{habit.name}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{habit.goal || days.length}</td>
                  {days.map((day, idx) => {
                    const done = isCompleted(habit.id, day);
                    return (
                      <td key={idx} className="px-2 py-3 text-center">
                        {done && (
                          <div
                            className="w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: habit.color }}
                          >
                            ✓
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-center text-xs font-bold text-white transition-all"
                          style={{ width: `${progress}%`, backgroundColor: habit.color }}
                        >
                          {progress > 20 && `${progress}%`}
                        </div>
                      </div>
                      {progress <= 20 && <span className="text-xs text-gray-400 w-10">{progress}%</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}