import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function YearlyView() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { habits, completions } = useHabits();

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getAllDaysInYear = (year: number) => {
    const days = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getMonthData = (year: number, month: number) => {
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Add padding days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    // Add current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    
    // Add padding days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const getIntensity = (date: Date) => {
    const dateStr = formatDate(date);
    const count = completions.filter(c => c.date === dateStr).length;
    const maxPossible = habits.length;
    
    if (count === 0) return 0;
    if (count >= maxPossible) return 4;
    if (count >= maxPossible * 0.75) return 3;
    if (count >= maxPossible * 0.5) return 2;
    return 1;
  };

  const getColorForIntensity = (intensity: number) => {
    const colors = ['#1a1a1a', '#1e4620', '#2d6a30', '#3d8f40', '#4ADE80'];
    return colors[intensity];
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate yearly stats
  const yearStart = new Date(selectedYear, 0, 1);
  const yearEnd = new Date(selectedYear, 11, 31);
  const yearCompletions = completions.filter(c => {
    const date = new Date(c.date);
    return date >= yearStart && date <= yearEnd;
  });
  
  const daysInYear = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalPossible = habits.length * daysInYear;
  const yearSuccessRate = totalPossible > 0 ? Math.round((yearCompletions.length / totalPossible) * 100) : 0;

  // Find best and worst months
  const monthlyStats = months.map((month, idx) => {
    const monthStart = new Date(selectedYear, idx, 1);
    const monthEnd = new Date(selectedYear, idx + 1, 0);
    const monthCompletions = completions.filter(c => {
      const date = new Date(c.date);
      return date >= monthStart && date <= monthEnd;
    }).length;
    const daysInMonth = monthEnd.getDate();
    const monthPossible = habits.length * daysInMonth;
    const rate = monthPossible > 0 ? Math.round((monthCompletions / monthPossible) * 100) : 0;
    return { month, rate, completions: monthCompletions };
  });

  const bestMonth = monthlyStats.reduce((best, current) => 
    current.rate > best.rate ? current : best
  , monthlyStats[0]);

  const worstMonth = monthlyStats.reduce((worst, current) => 
    current.rate < worst.rate ? current : worst
  , monthlyStats[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-4xl font-bold text-[#4ADE80]">{selectedYear}</h2>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-right">
          <div className="text-5xl font-bold text-[#4ADE80]">{yearSuccessRate}%</div>
          <div className="text-sm text-gray-400">Yearly Success Rate</div>
        </div>
      </div>

      {/* Yearly Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] rounded-lg p-4">
          <div className="text-xs text-gray-400">Total Completions</div>
          <div className="text-2xl font-bold text-[#4ADE80]">{yearCompletions.length}</div>
        </div>
        <div className="bg-[#0a0a0a] rounded-lg p-4">
          <div className="text-xs text-gray-400">Total Possible</div>
          <div className="text-2xl font-bold">{totalPossible}</div>
        </div>
        <div className="bg-[#0a0a0a] rounded-lg p-4">
          <div className="text-xs text-gray-400">Best Month</div>
          <div className="text-lg font-bold text-[#4ADE80]">{bestMonth.month}</div>
          <div className="text-xs text-gray-400">{bestMonth.rate}%</div>
        </div>
        <div className="bg-[#0a0a0a] rounded-lg p-4">
          <div className="text-xs text-gray-400">Worst Month</div>
          <div className="text-lg font-bold text-red-400">{worstMonth.month}</div>
          <div className="text-xs text-gray-400">{worstMonth.rate}%</div>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month, monthIdx) => {
          const monthDays = getMonthData(selectedYear, monthIdx);
          
          return (
            <div key={month} className="bg-[#0a0a0a] rounded-lg p-4">
              <h3 className="font-bold mb-3 text-center">{month}</h3>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-xs text-center text-gray-500 font-medium h-6 flex items-center justify-center">
                    {day}
                  </div>
                ))}
                {monthDays.map((day, idx) => {
                  const intensity = day.isCurrentMonth ? getIntensity(day.date) : 0;
                  const color = getColorForIntensity(intensity);
                  const isToday = formatDate(day.date) === formatDate(new Date());
                  
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded flex items-center justify-center text-xs ${
                        day.isCurrentMonth ? 'font-medium' : 'text-gray-600'
                      } ${isToday ? 'ring-2 ring-[#4ADE80]' : ''}`}
                      style={{
                        backgroundColor: color,
                        opacity: day.isCurrentMonth ? 1 : 0.3,
                      }}
                      title={`${day.date.toLocaleDateString()}: ${completions.filter(c => c.date === formatDate(day.date)).length} habits`}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm text-gray-400">Less</span>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <div
            key={intensity}
            className="w-6 h-6 rounded"
            style={{ backgroundColor: getColorForIntensity(intensity) }}
          />
        ))}
        <span className="text-sm text-gray-400">More</span>
      </div>
    </div>
  );
}
