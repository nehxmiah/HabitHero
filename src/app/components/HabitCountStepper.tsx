import { Minus, Plus } from 'lucide-react';

interface HabitCountStepperProps {
  current: number;
  target: number;
  color: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function HabitCountStepper({ current, target, color, onIncrement, onDecrement }: HabitCountStepperProps) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrement}
        disabled={current === 0}
        className="w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <div className="flex-1 min-w-[120px]">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-bold text-black">{current}/{target}</span>
          <span className="text-xs text-black opacity-75">{Math.round(progress)}%</span>
        </div>
        <div className="bg-black bg-opacity-20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: 'rgba(0,0,0,0.4)' }}
          />
        </div>
      </div>

      <button
        onClick={onIncrement}
        disabled={current >= target}
        className="w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
