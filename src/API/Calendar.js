import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const MyFullCalendar = ({ setSelectedDate, setSelectedEvents }) => {
  // 이벤트를 상태로 관리
  const [events, setEvents] = useState([
    { id: 1, title: 'Meeting', date: '2025-01-20' },
    { id: 2, title: 'Project Deadline', date: '2025-01-21' },
    { id: 3, title: 'Team Lunch', date: '2025-01-22' },
    { id: 4, title: 'Team Lunch2', date: '2025-01-22' },
  ]);

  // 오늘 날짜를 자동으로 선택하여 이벤트를 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    setSelectedDate(today);
    const eventsForToday = events.filter((event) => event.date === today);
    setSelectedEvents(eventsForToday);
  }, [events, setSelectedDate, setSelectedEvents]);

  // 날짜 클릭 시 이벤트 추가
  const handleDateClick = (info) => {
    const newEvent = { id: Date.now(), title: 'New Event', date: info.dateStr };
    setEvents([...events, newEvent]); // 기존 이벤트에 새로운 이벤트 추가

    setSelectedDate(info.dateStr);
    const eventsForDate = [...events, newEvent].filter((event) => event.date === info.dateStr);
    setSelectedEvents(eventsForDate);
  };

  // 이벤트 클릭 시 이름 변경 또는 삭제
  const handleEventClick = (info) => {
    const eventId = info.event.id; // 클릭한 이벤트의 ID 가져오기
    const action = prompt('Type "edit" to rename or "delete" to remove this event:', 'edit/delete');

    if (action === 'edit') {
      const newTitle = prompt('Enter a new title for the event:', info.event.title);
      if (newTitle) {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id.toString() === eventId ? { ...event, title: newTitle } : event
          )
        );
      }
    } else if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this event?')) {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id.toString() !== eventId));
      }
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick} // 이벤트 클릭 핸들러 추가
        editable={true}
        selectable={true}
      />
    </div>
  );
};

export default MyFullCalendar;
