import { useState, useEffect } from 'react';
import { Play, Pause, Check } from 'lucide-react';

interface HabitDurationTimerProps {
  target: number; // in minutes
  current: number; // in minutes
  color: string;
  onUpdate: (duration: number) => void;
}

export function HabitDurationTimer({ target, current, color, onUpdate }: HabitDurationTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(current * 60); // convert to seconds
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && elapsed < target * 60) {
      interval = setInterval(() => {
        setElapsed(prev => {
          const newValue = prev + 1;
          if (newValue % 60 === 0) {
            onUpdate(Math.floor(newValue / 60));
          }
          return newValue;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, elapsed, target, onUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsed / (target * 60)) * 100, 100);
  const isComplete = elapsed >= target * 60;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsRunning(!isRunning)}
        disabled={isComplete}
        className="w-10 h-10 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isComplete ? (
          <Check className="w-5 h-5" />
        ) : isRunning ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1 min-w-[140px]">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-bold text-black font-mono">{formatTime(elapsed)}</span>
          <span className="text-xs text-black opacity-75">{target} min goal</span>
        </div>
        <div className="bg-black bg-opacity-20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: 'rgba(0,0,0,0.4)' }}
          />
        </div>
      </div>

      <div className="text-xs text-black opacity-75 w-12 text-right">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
