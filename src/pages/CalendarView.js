// CalendarView.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './CalendarView.css';

function CalendarView() {
  // Expect trip info and events to be passed via location.state
  const location = useLocation();
  // We expect the state to include startDate, nights, and a combined array of custom entries in "events"
  const { startDate, nights, events } = location.state || {};
  
  // Generate calendar days from startDate for the given number of nights
  const [calendarDays, setCalendarDays] = useState([]);
  
  useEffect(() => {
    let days = [];
    const start = new Date(startDate);
    for (let i = 0; i < nights; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      // Format the date similar to how you format it in your custom entries (e.g. 'fi-FI')
      const options = { day: 'numeric', month: 'short', weekday: 'short' };
      let formatted = d.toLocaleDateString('fi-FI', options);
      days.push({ date: d, formatted });
    }
    setCalendarDays(days);
  }, [startDate, nights]);
  
  // Local state for the selected event to show details
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Helper: convert a time string ("HH:MM") to minutes for sorting
  const timeToMinutes = timeStr => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <div className="calendar-view-container">
      <h2>Calendar View</h2>
      <div className="calendar-grid">
        {calendarDays.map(day => {
          // Filter events whose checkinDate matches the day’s formatted date
          // (Assuming your custom entries have checkinDate formatted the same way)
          const dayEvents = events.filter(ev => ev.checkinDate === day.formatted);
          // Optionally sort the events by time (use "time" for todo and "visitTime" for eat & drink)
          dayEvents.sort((a, b) => {
            const timeA = a.type === 'todo' ? a.time : a.visitTime;
            const timeB = b.type === 'todo' ? b.time : b.visitTime;
            return timeToMinutes(timeA) - timeToMinutes(timeB);
          });
          return (
            <div key={day.formatted} className="calendar-day">
              <div className="day-header">{day.formatted}</div>
              <div className="day-events">
                {dayEvents.map((ev, index) => (
                  <div 
                    key={index} 
                    className="calendar-event" 
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <span className="event-time">
                      {ev.type === 'todo' ? ev.time : ev.visitTime}
                    </span>
                    <span className="event-title">
                      {ev.type === 'todo' ? ev.description : ev.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>
              {selectedEvent.type === 'todo' ? "To Do Details" : "Eat & Drink Details"}
            </h3>
            {selectedEvent.type === 'todo' ? (
              <>
                <p><strong>To do:</strong> {selectedEvent.description}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p>
                  <strong>Categories:</strong> {selectedEvent.categories.join(', ')}
                </p>
                <p>
                  <strong>Date:</strong> {selectedEvent.checkinDate} - {selectedEvent.checkoutDate}
                </p>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {selectedEvent.name}</p>
                <p><strong>Time:</strong> {selectedEvent.visitTime}</p>
                <p>
                  <strong>Categories:</strong> {selectedEvent.categories.join(', ')}
                </p>
                <p><strong>Comments:</strong> {selectedEvent.comments}</p>
                <p>
                  <strong>Date:</strong> {selectedEvent.checkinDate} - {selectedEvent.checkoutDate}
                </p>
              </>
            )}
            <button onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
