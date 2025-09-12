import React, { useMemo } from 'react';
import { ScheduleConfig, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { ClockIcon, CalendarDaysIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarViewProps {
  config: ScheduleConfig;
}

interface Slot {
  time: string;
  capacity: number;
}

const generateSlots = (config: ScheduleConfig): Map<DayOfWeek, Slot[]> => {
  const allSlots = new Map<DayOfWeek, Slot[]>();

  config.weeklySchedule.forEach(daySetting => {
    if (daySetting.isEnabled && daySetting.startTime && daySetting.endTime && config.slotDuration > 0) {
      const daySlots: Slot[] = [];
      let currentTime = new Date(`1970-01-01T${daySetting.startTime}:00`);
      const endTime = new Date(`1970-01-01T${daySetting.endTime}:00`);

      while (currentTime < endTime) {
        const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        let capacity = 1;
        // Find the most specific rule (latest start time) that applies to the current slot time.
        const relevantRule = daySetting.overbookingRules
            .slice() 
            .sort((a, b) => b.startTime.localeCompare(a.startTime)) 
            .find(rule => timeStr >= rule.startTime && timeStr < rule.endTime);
            
        if (relevantRule) {
            capacity = relevantRule.capacity;
        }

        daySlots.push({ time: timeStr, capacity });
        currentTime.setMinutes(currentTime.getMinutes() + config.slotDuration);
      }
      allSlots.set(daySetting.day as DayOfWeek, daySlots);
    } else {
        allSlots.set(daySetting.day as DayOfWeek, []);
    }
  });

  return allSlots;
};

const CalendarView: React.FC<CalendarViewProps> = ({ config }) => {
  const { t } = useLanguage();
  const dailySlots = useMemo(() => generateSlots(config), [config]);
  
  const totalAppointments = useMemo(() => {
    return Array.from(dailySlots.values()).flat().reduce((sum, slot) => sum + slot.capacity, 0);
  }, [dailySlots]);

  const hasSlots = totalAppointments > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{t('calendar.title')}</h2>
        {hasSlots && (
            <p className="mt-1 text-sm text-gray-600">{t('calendar.totalAppointments', { count: totalAppointments })}</p>
        )}
      </div>

      {hasSlots ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {DAYS_OF_WEEK.map(day => {
            const slots = dailySlots.get(day) || [];
            if (slots.length === 0) return null;

            return (
              <div key={day}>
                <h3 className="font-bold text-center text-lg mb-3 text-gray-700 sticky top-24 bg-white/80 backdrop-blur-sm py-2">{t(`days.${day}`)}</h3>
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div key={slot.time} className="relative flex items-center justify-center p-2.5 rounded-lg bg-gray-100/80 border border-gray-200 text-sm font-semibold text-gray-800 shadow-sm">
                      <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                      {slot.time}
                      {slot.capacity > 1 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[var(--color-primary)] rounded-full border-2 border-white" aria-label={`${slot.capacity} appointments`}>
                          {slot.capacity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900">{t('calendar.noSlots.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('calendar.noSlots.description')}</p>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
