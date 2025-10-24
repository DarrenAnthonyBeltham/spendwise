import { useState, useRef, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/20/solid';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns';

interface CustomDatePickerProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  id: string;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CustomDatePicker({ startDate, endDate, onDateRangeChange, id }: CustomDatePickerProps) {
  const initialStartDate = startDate ? parseISO(startDate) : null;
  const initialEndDate = endDate ? parseISO(endDate) : null;

  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: initialStartDate,
    end: initialEndDate,
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const [currentMonth, setCurrentMonth] = useState(initialStartDate || new Date());
  const [secondMonth, setSecondMonth] = useState(addMonths(initialStartDate || new Date(), 1));

  const popoverButtonRef = useRef<HTMLButtonElement>(null);

  const handleDayClick = (day: Date) => {
    if (!selectedRange.start || selectedRange.end) {
      setSelectedRange({ start: day, end: null });
      setHoveredDate(null);
    } else if (selectedRange.start && isBefore(day, selectedRange.start)) {
      setSelectedRange({ start: day, end: selectedRange.start });
      setHoveredDate(null);
    } else {
      setSelectedRange((prev) => ({ ...prev, end: day }));
      setHoveredDate(null);
    }
  };

  const handleApply = (close: () => void) => {
    if (selectedRange.start) {
      const start = format(selectedRange.start, 'yyyy-MM-dd');
      const end = selectedRange.end ? format(selectedRange.end, 'yyyy-MM-dd') : start;
      onDateRangeChange(start, end);
    } else {
        onDateRangeChange('', '');
    }
    close();
  };

  const handleClear = (close: () => void) => {
    setSelectedRange({ start: null, end: null });
    onDateRangeChange('', '');
    close();
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSecondMonth((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSecondMonth((prev) => addMonths(prev, 1));
  };

  const renderMonth = (month: Date) => {
    const days = getDaysInMonth(month);
    const firstDayOfWeek = days[0].getDay();

    return (
      <div className="flex-1 min-w-[280px]">
        <div className="grid grid-cols-7 text-xs text-center text-gray-400">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-sm">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 w-9"></div>
          ))}
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, month);
            const isInRange = selectedRange.start && selectedRange.end &&
              ((isAfter(day, selectedRange.start) && isBefore(day, selectedRange.end)) ||
               (isSameDay(day, selectedRange.start) && isSameDay(day, selectedRange.end)) && selectedRange.start !== selectedRange.end);

            const isStart = selectedRange.start && isSameDay(day, selectedRange.start);
            const isEnd = selectedRange.end && isSameDay(day, selectedRange.end);

            const isHovering = selectedRange.start && !selectedRange.end && hoveredDate &&
              ((isAfter(day, selectedRange.start) && isBefore(day, hoveredDate)) ||
               (isBefore(day, selectedRange.start) && isAfter(day, hoveredDate)));

            return (
              <div
                key={day.toISOString()}
                className={`relative flex items-center justify-center h-9 w-9 rounded-full cursor-pointer transition-colors duration-100
                  ${!isCurrentMonth ? 'text-gray-600' : 'text-slate-100'}
                  ${isToday(day) && 'font-bold bg-sky-800'}
                  ${(isStart || isEnd) ? 'bg-sky-600 text-white font-semibold rounded-full' : ''}
                  ${isInRange || isHovering ? 'bg-sky-700/50 rounded-none' : ''}
                  ${selectedRange.start && !selectedRange.end && isSameDay(day, selectedRange.start) ? 'rounded-full' : ''}
                `}
                onClick={() => isCurrentMonth && handleDayClick(day)}
                onMouseEnter={() => selectedRange.start && !selectedRange.end && isCurrentMonth && setHoveredDate(day)}
                onMouseLeave={() => selectedRange.start && !selectedRange.end && isCurrentMonth && setHoveredDate(null)}
              >
                 <span className={`${(isStart || isEnd) ? 'relative z-10' : ''}`}>
                    {format(day, 'd')}
                </span>
                {(isInRange || isHovering) && (
                    <div className={`absolute inset-0 ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''} bg-sky-700/50`}></div>
                )}
                 {isStart && !isEnd && <div className="absolute inset-y-0 right-0 w-1/2 bg-sky-700/50 z-0"></div>}
                 {isEnd && !isStart && <div className="absolute inset-y-0 left-0 w-1/2 bg-sky-700/50 z-0"></div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const getButtonLabel = () => {
    if (selectedRange.start && selectedRange.end) {
      if (isSameDay(selectedRange.start, selectedRange.end)) {
        return format(selectedRange.start, 'dd/MM/yyyy');
      }
      return `${format(selectedRange.start, 'dd/MM/yyyy')} - ${format(selectedRange.end, 'dd/MM/yyyy')}`;
    }
    if (selectedRange.start) {
      return `${format(selectedRange.start, 'dd/MM/yyyy')} - ...`;
    }
    return 'Select Date Range';
  };

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button
            ref={popoverButtonRef}
            id={id}
            className="mt-1 flex items-center justify-between w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          >
            <span className="flex-grow text-left text-slate-100">
              {getButtonLabel()}
            </span>
            <CalendarDaysIcon className="h-5 w-5 text-gray-400 ml-2" aria-hidden="true" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-50 mt-2 transform -translate-x-1/2 left-1/2 w-auto max-w-full">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                <div className="bg-slate-800 p-4 flex flex-col md:flex-row gap-4">
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between pb-2">
                      <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="p-1 text-slate-400 hover:text-slate-100"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <span className="font-semibold text-white">
                        {format(currentMonth, 'MMMM yyyy')}
                      </span>
                      <button
                        type="button"
                        onClick={goToNextMonth}
                        className="p-1 text-slate-400 hover:text-slate-100"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {renderMonth(currentMonth)}
                  </div>

                  <div className="hidden md:flex flex-col flex-1 border-l border-slate-700 pl-4">
                    <div className="flex items-center justify-between pb-2">
                      <h2 className="text-sm font-semibold text-slate-100">
                        {format(secondMonth, 'MMMM yyyy')}
                      </h2>
                    </div>
                    {renderMonth(secondMonth)}
                  </div>
                </div>

                <div className="bg-slate-700 p-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleClear(close)}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-md hover:bg-slate-600 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(close)}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

export default CustomDatePicker;