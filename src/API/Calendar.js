// MyFullCalendar.js
import React, { useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const MyFullCalendar = ({ setSelectedDate, setSelectedEvents }) => {

  const events = useMemo(() => [
    { title: 'Meeting', date: '2025-01-20' },
    { title: 'Project Deadline', date: '2025-01-21' },
    { title: 'Team Lunch', date: '2025-01-22' },
    { title: 'Team Lunch2', date: '2025-01-22' },
  ], []); // 의존성 배열이 비어있어서, 컴포넌트가 처음 렌더링될 때만 events 배열을 생성합니다.

  // 오늘 날짜를 자동으로 선택하여 이벤트를 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 (yyyy-mm-dd)
    setSelectedDate(today);
    const eventsForToday = events.filter((event) => event.date === today); // 오늘 날짜에 해당하는 이벤트 필터링
    setSelectedEvents(eventsForToday);
  },  [events, setSelectedDate, setSelectedEvents]);


  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr); // 클릭된 날짜 저장
    const eventsForDate = events.filter((event) => event.date === info.dateStr); // 해당 날짜의 이벤트 필터링
    setSelectedEvents(eventsForDate); // 필터링된 이벤트 저장
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        editable={true}
        selectable={true}
      />

    </div>
  );
};

export default MyFullCalendar;
