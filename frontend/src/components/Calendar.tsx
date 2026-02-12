import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import '../styles/calendar.css';

interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
}

export default function Calendar({ selected, onSelect }: CalendarProps) {
  const today = new Date();

  return (
    <div className="mx-5 mb-4 p-3 bg-surface rounded-2xl flex justify-center">
      <DayPicker
        mode="single"
        locale={ko}
        selected={selected}
        defaultMonth={selected}
        onSelect={(date) => {
          if (date) onSelect(date);
        }}
        disabled={{ after: today }}
        required
      />
    </div>
  );
}
