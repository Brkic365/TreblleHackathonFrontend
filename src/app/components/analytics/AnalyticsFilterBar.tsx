"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { DatePicker } from '@ark-ui/react/date-picker';
import { Portal } from '@ark-ui/react/portal';
import { parseDate, getLocalTimeZone } from '@internationalized/date';
import styles from '@/styles/components/AnalyticsFilterBar.module.scss';

interface AnalyticsFilterBarProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  selectedProjects: string[];
  onProjectsChange: (projects: string[]) => void;
  availableProjects: Array<{ id: string; name: string }>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function AnalyticsFilterBar({
  dateRange,
  onDateRangeChange,
  selectedProjects,
  onProjectsChange,
  availableProjects,
  onRefresh,
  isLoading = false
}: AnalyticsFilterBarProps) {
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);

  const handleDateSelect = (details: any) => {
    const { value } = details;
    
    if (!value || value.length === 0) {
      setIsSelectingRange(false);
      setTempStartDate(undefined);
      onDateRangeChange({
        from: undefined,
        to: undefined
      });
      return;
    }
    
    const selectedDate = value[0].toDate(getLocalTimeZone());
    
    if (!isSelectingRange) {
      // First click - set start date
      setTempStartDate(selectedDate);
      setIsSelectingRange(true);
      onDateRangeChange({
        from: selectedDate,
        to: undefined
      });
    } else {
      // Second click - set end date and complete range
      const startDate = tempStartDate || dateRange.from;
      if (startDate) {
        const finalStartDate = selectedDate < startDate ? selectedDate : startDate;
        const finalEndDate = selectedDate < startDate ? startDate : selectedDate;
        
        onDateRangeChange({
          from: finalStartDate,
          to: finalEndDate
        });
        setIsSelectingRange(false);
        setTempStartDate(undefined);
      }
    }
  };

  const handleProjectToggle = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      onProjectsChange(selectedProjects.filter(id => id !== projectId));
    } else {
      onProjectsChange([...selectedProjects, projectId]);
    }
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    } else if (dateRange.from && isSelectingRange) {
      return `Select end date (start: ${format(dateRange.from, 'MMM dd')})`;
    } else if (dateRange.from) {
      return `From ${format(dateRange.from, 'MMM dd, yyyy')}`;
    }
    return 'Select start date';
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date Range</label>
          <div className={styles.datePickerContainer}>
            <DatePicker.Root
              selectionMode="single"
              value={(() => {
                // Show the current start date if we're selecting a range, or the from date if we have a complete range
                const currentDate = isSelectingRange ? tempStartDate : dateRange.from;
                const val = currentDate ? [parseDate(currentDate.toISOString().split('T')[0])] : [];
                return val;
              })()}
              onValueChange={handleDateSelect}
              className={styles.datePickerRoot}
            >
              <DatePicker.Control className={styles.datePickerControl}>
                <DatePicker.Input className={styles.datePickerInput} placeholder="Select date" />
                <DatePicker.Trigger className={styles.datePickerButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h6V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z" fill="currentColor"/>
                  </svg>
                  <span>{formatDateRange()}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </DatePicker.Trigger>
                <DatePicker.ClearTrigger className={styles.datePickerClearButton}>
                  Clear
                </DatePicker.ClearTrigger>
              </DatePicker.Control>
              
              <Portal>
                <DatePicker.Positioner className={styles.datePickerPositioner}>
                  <DatePicker.Content className={styles.datePickerContent}>
                    <DatePicker.View view="day">
                      <DatePicker.Context>
                        {(datePicker) => (
                          <>
                            <DatePicker.ViewControl className={styles.datePickerViewControl}>
                              <DatePicker.PrevTrigger className={styles.datePickerNavButton}>
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </DatePicker.PrevTrigger>
                              <DatePicker.ViewTrigger className={styles.datePickerViewTrigger}>
                                <DatePicker.RangeText className={styles.datePickerRangeText} />
                              </DatePicker.ViewTrigger>
                              <DatePicker.NextTrigger className={styles.datePickerNavButton}>
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </DatePicker.NextTrigger>
                            </DatePicker.ViewControl>
                            
                            <DatePicker.Table className={styles.datePickerTable}>
                              <DatePicker.TableHead className={styles.datePickerTableHead}>
                                <DatePicker.TableRow className={styles.datePickerTableRow}>
                                  {datePicker.weekDays.map((weekDay, id) => (
                                    <DatePicker.TableHeader key={id} className={styles.datePickerTableHeader}>
                                      {weekDay.short}
                                    </DatePicker.TableHeader>
                                  ))}
                                </DatePicker.TableRow>
                              </DatePicker.TableHead>
                              <DatePicker.TableBody className={styles.datePickerTableBody}>
                                {datePicker.weeks.map((week, id) => (
                                  <DatePicker.TableRow key={id} className={styles.datePickerTableRow}>
                                    {week.map((day, id) => (
                                      <DatePicker.TableCell key={id} value={day} className={styles.datePickerTableCell}>
                                        <DatePicker.TableCellTrigger className={styles.datePickerTableCellTrigger}>
                                          {day.day}
                                        </DatePicker.TableCellTrigger>
                                      </DatePicker.TableCell>
                                    ))}
                                  </DatePicker.TableRow>
                                ))}
                              </DatePicker.TableBody>
                            </DatePicker.Table>
                          </>
                        )}
                      </DatePicker.Context>
                    </DatePicker.View>
                    
                    <div className={styles.datePickerActions}>
                      <button
                        className={styles.datePickerAction}
                        onClick={() => {
                          const today = new Date();
                          const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                          setIsSelectingRange(false);
                          setTempStartDate(undefined);
                          onDateRangeChange({ from: lastWeek, to: today });
                        }}
                      >
                        Last 7 days
                      </button>
                      <button
                        className={styles.datePickerAction}
                        onClick={() => {
                          const today = new Date();
                          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                          setIsSelectingRange(false);
                          setTempStartDate(undefined);
                          onDateRangeChange({ from: lastMonth, to: today });
                        }}
                      >
                        Last 30 days
                      </button>
                      <button
                        className={styles.datePickerAction}
                        onClick={() => {
                          const today = new Date();
                          const lastQuarter = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                          setIsSelectingRange(false);
                          setTempStartDate(undefined);
                          onDateRangeChange({ from: lastQuarter, to: today });
                        }}
                      >
                        Last 90 days
                      </button>
                    </div>
                  </DatePicker.Content>
                </DatePicker.Positioner>
              </Portal>
            </DatePicker.Root>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Projects</label>
          <div className={styles.projectSelectorContainer}>
            <button
              className={styles.projectSelectorButton}
              onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" fill="currentColor"/>
              </svg>
              <span>
                {selectedProjects.length === 0 
                  ? 'All Projects' 
                  : selectedProjects.length === 1 
                    ? availableProjects.find(p => p.id === selectedProjects[0])?.name || '1 Project'
                    : `${selectedProjects.length} Projects`
                }
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {isProjectSelectorOpen && (
              <div className={styles.projectSelectorDropdown}>
                <div className={styles.projectSelectorHeader}>
                  <button
                    className={styles.projectSelectorAction}
                    onClick={() => {
                      onProjectsChange([]);
                      setIsProjectSelectorOpen(false);
                    }}
                  >
                    All Projects
                  </button>
                </div>
                <div className={styles.projectSelectorDivider} />
                <div className={styles.projectSelectorList}>
                  {availableProjects.map((project) => (
                    <label key={project.id} className={styles.projectSelectorItem}>
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleProjectToggle(project.id)}
                      />
                      <span className={styles.projectSelectorItemText}>{project.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {onRefresh && (
          <div className={styles.filterActions}>
            <button
              className={styles.refreshButton}
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh data"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16"
                className={isLoading ? styles.spinning : ''}
              >
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" fill="currentColor"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Overlay for closing project selector */}
      {isProjectSelectorOpen && (
        <div 
          className={styles.filterOverlay}
          onClick={() => {
            setIsProjectSelectorOpen(false);
          }}
        />
      )}
    </div>
  );
}