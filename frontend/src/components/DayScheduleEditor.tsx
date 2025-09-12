import React, { useState } from 'react';
import type { DaySchedule, OverbookingRule } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TrashIcon } from './icons';

interface DayScheduleEditorProps {
  daySchedule: DaySchedule;
  onUpdate: (updatedSchedule: DaySchedule) => void;
}

const DayScheduleEditor: React.FC<DayScheduleEditorProps> = ({ daySchedule, onUpdate }) => {
  const { t } = useLanguage();
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState({ startTime: '09:00', endTime: '17:00', capacity: 2 });

  const handleToggle = () => {
    onUpdate({ ...daySchedule, isEnabled: !daySchedule.isEnabled });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...daySchedule, [e.target.name]: e.target.value });
  };

  const handleAddRuleClick = () => {
    setNewRule({ startTime: daySchedule.startTime, endTime: daySchedule.endTime, capacity: 2 });
    setIsAddingRule(true);
  };

  const handleNewRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRule(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value, 10) || 1 : value }));
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRule.startTime >= newRule.endTime || newRule.capacity < 1) {
        // Basic validation feedback could be added here
        return;
    }
    const ruleToAdd: OverbookingRule = {
        ...newRule,
        id: `rule-${daySchedule.day}-${Date.now()}`
    };
    onUpdate({ ...daySchedule, overbookingRules: [...daySchedule.overbookingRules, ruleToAdd].sort((a,b) => a.startTime.localeCompare(b.startTime)) });
    setIsAddingRule(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    onUpdate({ ...daySchedule, overbookingRules: daySchedule.overbookingRules.filter(r => r.id !== ruleId) });
  };


  return (
    <div className={`p-4 rounded-xl transition-colors duration-300 ${daySchedule.isEnabled ? 'bg-white shadow-sm border border-gray-200' : 'bg-gray-100'}`}>
      <div className="flex items-center justify-between">
        <span className={`font-bold text-lg ${daySchedule.isEnabled ? 'text-[var(--color-text-primary)]' : 'text-gray-500'}`}>{t(`days.${daySchedule.day}`)}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={daySchedule.isEnabled} onChange={handleToggle} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
        </label>
      </div>
      {daySchedule.isEnabled && (
        <div className="mt-4 divide-y divide-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
            <div>
              <label htmlFor={`startTime-${daySchedule.day}`} className="block text-sm font-medium text-gray-700">{t('schedule.startTime')}</label>
              <input
                type="time"
                id={`startTime-${daySchedule.day}`}
                name="startTime"
                value={daySchedule.startTime}
                onChange={handleTimeChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor={`endTime-${daySchedule.day}`} className="block text-sm font-medium text-gray-700">{t('schedule.endTime')}</label>
              <input
                type="time"
                id={`endTime-${daySchedule.day}`}
                name="endTime"
                value={daySchedule.endTime}
                onChange={handleTimeChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <h4 className="text-md font-semibold text-gray-700 mb-3">{t('schedule.overbooking.title')}</h4>
             <div className="space-y-2">
                {daySchedule.overbookingRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg text-sm border border-gray-200">
                        <div className="flex items-center gap-4">
                           <p><span className="font-semibold">{rule.startTime}</span> - <span className="font-semibold">{rule.endTime}</span></p>
                           <p className="text-gray-600 font-medium">{t('schedule.overbooking.capacity')}: <span className="font-bold text-gray-800">{rule.capacity}</span></p>
                        </div>
                        <button onClick={() => handleDeleteRule(rule.id)} aria-label={t('schedule.overbooking.delete')} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}

                {isAddingRule ? (
                   <form onSubmit={handleSaveRule} className="p-3 bg-orange-50/50 rounded-lg border border-orange-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div>
                                <label htmlFor={`ob-start-${daySchedule.day}`} className="font-medium text-gray-700">{t('schedule.overbooking.startTime')}</label>
                                <input type="time" id={`ob-start-${daySchedule.day}`} name="startTime" value={newRule.startTime} onChange={handleNewRuleChange} required className="mt-1 w-full p-2 rounded-md border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" />
                            </div>
                             <div>
                                <label htmlFor={`ob-end-${daySchedule.day}`} className="font-medium text-gray-700">{t('schedule.overbooking.endTime')}</label>
                                <input type="time" id={`ob-end-${daySchedule.day}`} name="endTime" value={newRule.endTime} onChange={handleNewRuleChange} required className="mt-1 w-full p-2 rounded-md border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" />
                            </div>
                            <div>
                                <label htmlFor={`ob-cap-${daySchedule.day}`} className="font-medium text-gray-700">{t('schedule.overbooking.capacity')}</label>
                                <input type="number" id={`ob-cap-${daySchedule.day}`} name="capacity" value={newRule.capacity} onChange={handleNewRuleChange} required min="1" className="mt-1 w-full p-2 rounded-md border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" />
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-3">
                            <button type="button" onClick={() => setIsAddingRule(false)} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">{t('schedule.overbooking.cancel')}</button>
                            <button type="submit" className="px-3 py-1.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-md transition-colors">{t('schedule.overbooking.saveRule')}</button>
                        </div>
                   </form>
                ) : (
                    daySchedule.overbookingRules.length === 0 && <p className="text-sm text-gray-500 px-2 py-1">{t('schedule.overbooking.noRules')}</p>
                )}
                
                {!isAddingRule && (
                    <button onClick={handleAddRuleClick} className="mt-2 w-full text-center px-4 py-2 text-sm font-semibold text-[var(--color-primary)] border-2 border-dashed border-orange-300 hover:bg-orange-50 rounded-lg transition-colors">
                        + {t('schedule.overbooking.addRule')}
                    </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayScheduleEditor;