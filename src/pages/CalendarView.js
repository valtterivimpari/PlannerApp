// CalendarView.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CalendarView.css';

function CalendarView() {
  const location = useLocation();
  const navigate = useNavigate();
  // Destructure all needed state from location.state (including city)
  const { tripId, startDate, nights, destinationIndex, events, city } = location.state || {};

  // Use local state for events so we can update after edit/delete
  const [eventsState, setEventsState] = useState(Array.isArray(events) ? events : [events]);

  // Generate calendar days
  const [calendarDays, setCalendarDays] = useState([]);
  useEffect(() => {
    let days = [];
    const start = new Date(startDate);
    for (let i = 0; i < nights; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const options = { day: 'numeric', month: 'short', weekday: 'short' };
      let formatted = d.toLocaleDateString('fi-FI', options);
      days.push({ date: d, formatted });
    }
    setCalendarDays(days);
  }, [startDate, nights]);

  // Local state for modal and editing
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Helper: convert time string "HH:MM" to minutes for sorting
  const timeToMinutes = timeStr => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Update custom entries on the server
  const updateCustomEntries = async (updatedEntries) => {
    const token = localStorage.getItem('token');
    try {
      if (destinationIndex !== undefined) {
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let tripData = response.data;
        if (tripData.destinations && typeof tripData.destinations === 'string') {
          tripData.destinations = JSON.parse(tripData.destinations);
        }
        tripData.destinations[destinationIndex].discover = updatedEntries;
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations: tripData.destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let tripData = response.data;
        tripData.discover = updatedEntries;
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { discover: updatedEntries },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Error updating custom entries:", error);
    }
  };

  const handleDeleteEvent = async (eventToDelete) => {
    const updatedEvents = eventsState.filter(ev => ev !== eventToDelete);
    await updateCustomEntries(updatedEvents);
    setEventsState(updatedEvents);
    setSelectedEvent(null);
  };

  const handleEditInitiate = (event) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setEditForm({ ...event });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    const updatedEvents = eventsState.map(ev =>
      ev === selectedEvent ? editForm : ev
    );
    await updateCustomEntries(updatedEvents);
    setEventsState(updatedEvents);
    setSelectedEvent(editForm);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // Back button handler: navigate back to Discover page with needed state
  const handleBack = () => {
    navigate(`/discover/${encodeURIComponent(city)}/${startDate}`, {
      state: { tripId, city, startDate, nights, destinationIndex }
    });
  };

  return (
    <div className="calendar-view-container">
      <button className="calendar-back-button" onClick={handleBack}>
        Back to Discover
      </button>
      <h2>Calendar View</h2>
      <div className="calendar-grid">
        {calendarDays.map(day => {
          const dayEvents = eventsState.filter(ev => ev.checkinDate === day.formatted);
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
                    onClick={() => { setSelectedEvent(ev); setIsEditing(false); }}
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
        <div className="modal-overlay" onClick={() => { setSelectedEvent(null); setIsEditing(false); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedEvent.type === 'todo' ? "To Do Details" : "Eat & Drink Details"}</h3>
            {isEditing ? (
              <>
                {selectedEvent.type === 'todo' ? (
                  <>
                    <label>To do:</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                    <label>Time:</label>
                    <input
                      type="time"
                      name="time"
                      value={editForm.time}
                      onChange={handleEditChange}
                    />
                  </>
                ) : (
                  <>
                    <label>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                    />
                    <label>Time:</label>
                    <input
                      type="time"
                      name="visitTime"
                      value={editForm.visitTime}
                      onChange={handleEditChange}
                    />
                    <label>Comments:</label>
                    <textarea
                      name="comments"
                      value={editForm.comments}
                      onChange={handleEditChange}
                    />
                  </>
                )}
                <label>Categories (comma-separated):</label>
                <input
                  type="text"
                  name="categories"
                  value={editForm.categories.join(', ')}
                  onChange={(e) =>
                    setEditForm(prev => ({ ...prev, categories: e.target.value.split(',').map(s => s.trim()) }))
                  }
                />
                <div className="modal-buttons">
                  <button onClick={handleEditSave}>Save</button>
                  <button onClick={handleEditCancel}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                {selectedEvent.type === 'todo' ? (
                  <>
                    <p><strong>To do:</strong> {selectedEvent.description}</p>
                    <p><strong>Time:</strong> {selectedEvent.time}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Name:</strong> {selectedEvent.name}</p>
                    <p><strong>Time:</strong> {selectedEvent.visitTime}</p>
                    <p><strong>Comments:</strong> {selectedEvent.comments}</p>
                  </>
                )}
                <p>
                  <strong>Categories:</strong> {selectedEvent.categories.join(', ')}
                </p>
                <p>
                  <strong>Date:</strong> {selectedEvent.checkinDate} - {selectedEvent.checkoutDate}
                </p>
                <div className="modal-buttons">
                  <button onClick={() => handleEditInitiate(selectedEvent)}>Edit</button>
                  <button onClick={() => handleDeleteEvent(selectedEvent)}>Delete</button>
                  <button onClick={() => setSelectedEvent(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
