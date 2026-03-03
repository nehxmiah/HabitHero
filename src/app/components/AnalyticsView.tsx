import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Award, Calendar } from 'lucide-react';

export function AnalyticsView() {
  const { habits, completions } = useHabits();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setDate(end.getDate() - 30);
        break;
      case 'year':
        start.setDate(end.getDate() - 365);
        break;
    }
    
    return { start, end };
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const { start, end } = getDateRange();
  const rangeCompletions = completions.filter(c => {
    const date = new Date(c.date);
    return date >= start && date <= end;
  });

  // Calculate overall stats
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalPossible = habits.length * totalDays;
  const successRate = totalPossible > 0 ? Math.round((rangeCompletions.length / totalPossible) * 100) : 0;
  const averagePerDay = totalDays > 0 ? (rangeCompletions.length / totalDays).toFixed(1) : '0';

  // Habit performance data
  const habitPerformance = habits.map(habit => {
    const habitCompletions = rangeCompletions.filter(c => c.habitId === habit.id).length;
    const rate = totalDays > 0 ? Math.round((habitCompletions / totalDays) * 100) : 0;
    return {
      name: habit.name,
      completions: habitCompletions,
      rate,
      color: habit.color,
    };
  }).sort((a, b) => b.completions - a.completions);

  // Daily trend data
  const dailyTrend = [];
  for (let i = 0; i < Math.min(totalDays, 30); i++) {
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    const dateStr = formatDate(date);
    const count = completions.filter(c => c.date === dateStr).length;
    dailyTrend.unshift({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    });
  }

  // Category distribution
  const categories = [...new Set(habits.map(h => h.category))];
  const categoryData = categories.map(category => {
    const categoryHabits = habits.filter(h => h.category === category);
    const categoryCompletions = rangeCompletions.filter(c => 
      categoryHabits.some(h => h.id === c.habitId)
    ).length;
    
    return {
      name: category.split(' & ')[0], // Shorten names
      value: categoryCompletions,
    };
  });

  const COLORS = ['#4ADE80', '#3B82F6', '#A78BFA', '#FBBF24', '#EF4444', '#10B981', '#06B6D4', '#8B5CF6'];

  // Streak calculation
  const streaks = habits.map(habit => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDate(date);
      
      if (completions.some(c => c.habitId === habit.id && c.date === dateStr)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return {
      habit: habit.name,
      streak: maxStreak,
      color: habit.color,
    };
  }).sort((a, b) => b.streak - a.streak);

  const topStreak = streaks[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold text-[#4ADE80]">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              timeRange === 'week' ? 'bg-[#4ADE80] text-black' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              timeRange === 'month' ? 'bg-[#4ADE80] text-black' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              timeRange === 'year' ? 'bg-[#4ADE80] text-black' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Success Rate</span>
            <TrendingUp className="w-5 h-5 text-[#4ADE80]" />
          </div>
          <div className="text-4xl font-bold text-[#4ADE80]">{successRate}%</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Completions</span>
            <Calendar className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div className="text-4xl font-bold">{rangeCompletions.length}</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Avg Per Day</span>
            <TrendingUp className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div className="text-4xl font-bold">{averagePerDay}</div>
        </div>

        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Best Streak</span>
            <Award className="w-5 h-5 text-[#FBBF24]" />
          </div>
          <div className="text-4xl font-bold text-[#FBBF24]">{topStreak?.streak || 0}</div>
          <div className="text-xs text-gray-400 mt-1 truncate">{topStreak?.habit}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Daily Completion Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4ADE80"
                strokeWidth={2}
                dot={{ fill: '#4ADE80', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit Performance */}
      <div className="bg-[#0a0a0a] rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Habit Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={habitPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="completions" fill="#4ADE80" name="Completions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Habits */}
        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4ADE80]" />
            Top Performing Habits
          </h3>
          <div className="space-y-3">
            {habitPerformance.slice(0, 5).map((habit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-600 w-8">#{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{habit.name}</span>
                    <span className="text-sm text-gray-400">{habit.completions} times</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${habit.rate}%`, backgroundColor: habit.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Longest Streaks */}
        <div className="bg-[#0a0a0a] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FBBF24]" />
            Longest Streaks
          </h3>
          <div className="space-y-3">
            {streaks.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-600 w-8">#{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.habit}</span>
                    <span className="text-sm font-bold text-[#FBBF24]">{item.streak} days</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min((item.streak / 30) * 100, 100)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
