import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styled, { createGlobalStyle } from "styled-components";
import {
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from "../Page/firebase";

const MyFullCalendar = ({ setSelectedDate, setSelectedEvents }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [maxRowHeight, setMaxRowHeight] = useState(0);

  useEffect(() => {
    const loadEvents = async () => {
      const eventsFromFirebase = await fetchEvents();
      setEvents(eventsFromFirebase);
    };
    loadEvents();
  }, []);

  const eventContent = (eventInfo) => {
    return (
      <EventWrapper>
        <EventText title={eventInfo.event.title}>{eventInfo.event.title}</EventText>
      </EventWrapper>
    );
  };

  const handleEventClick = (info) => {
    if (!isEditMode) return;
    setSelectedEvent(info.event);
    setNewTitle(info.event.title);
    setIsModalOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    await updateEvent(selectedEvent.id, newTitle);
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === selectedEvent.id ? { ...event, title: newTitle } : event
      )
    );
    setIsModalOpen(false);
  };

  const handleAddEvent = async (date) => {
    if (!isEditMode) return;
  
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()); // UTC 보정
  
    const formattedDate = localDate.toISOString().split("T")[0];
  
    const newEvent = { title: "New Event", date: formattedDate };
    const addedEvent = await addEvent(newEvent);
  
    setEvents((prevEvents) => {
      const updatedEvents = [...prevEvents, addedEvent];
      return updatedEvents;
    });
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
  
    await deleteEvent(selectedEvent.id);
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.filter((event) => event.id !== selectedEvent.id);
      return updatedEvents;
    });
  
    setSelectedEvent(null);
    setIsModalOpen(false);
  };
  
  // 날짜의 최대 높이를 계산하는 함수
  const adjustMaxRowHeight = () => {
    setMaxRowHeight(0); // 높이를 초기화하여 다시 계산할 수 있도록 함
  
    setTimeout(() => {
      const rows = document.querySelectorAll(".fc-daygrid-day");
      let maxHeight = 0;
  
      rows.forEach((row) => {
        const height = row.scrollHeight;
        if (height > maxHeight) maxHeight = height;
      });
  
      setMaxRowHeight(maxHeight);
    }, 50); // DOM 업데이트 후 실행되도록 약간의 딜레이 추가
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      adjustMaxRowHeight();
    });
  }, [events]);
  

  useEffect(() => {
    const today = new Date();
    const formattedDate = formatDateToKorean(today);
    setSelectedDate(formattedDate);

    const todayEvents = events.filter(
      (event) => new Date(event.date).toDateString() === today.toDateString()
    );
    setSelectedEvents(todayEvents);
  }, [events, setSelectedDate, setSelectedEvents]);

  const formatDateToKorean = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
  };

  const handleDateClick = (info) => {
    const clickedDate = info.date;
    const formattedDate = formatDateToKorean(clickedDate);
    setSelectedDate(formattedDate);

    if (isEditMode) {
      handleAddEvent(clickedDate);
    }

    const selectedDateEvents = events.filter(
      (event) => new Date(event.date).toDateString() === clickedDate.toDateString()
    );
    setSelectedEvents(selectedDateEvents);
  };

  return (
    <Container isEditMode={isEditMode}>
      <CalendarWrapper>
        <GlobalStyles maxRowHeight={maxRowHeight} />
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={eventContent}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="100%"
          contentHeight="auto"
          aspectRatio={1.5}
          themeSystem="standard"
          headerToolbar={{
            left: "prev,next today editButton",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          customButtons={{
            editButton: {
              text: isEditMode ? "Done" : "Edit",
              click: () => setIsEditMode(!isEditMode),
            },
          }}
          dayCellClassNames={(args) => {
            const today = new Date();
            const isToday =
              args.date.getDate() === today.getDate() &&
              args.date.getMonth() === today.getMonth() &&
              args.date.getFullYear() === today.getFullYear();
              return isToday ? "today-cell hoverable-cell" : "hoverable-cell";
            }}
        />
      </CalendarWrapper>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>이벤트 수정</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <ButtonGroup>
              <button onClick={handleUpdateEvent}>수정</button>
              <button onClick={handleDeleteEvent}>삭제</button>
              <button onClick={() => setIsModalOpen(false)}>취소</button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default MyFullCalendar;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: ${({ isEditMode }) => (isEditMode ? "#B7B7B7" : "#F5F5F7")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
`;

const CalendarWrapper = styled.div`
  margin-top: 40px;
  width: 95%;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  padding-right: 37px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  z-index: 1001;

  h3 {
    margin-bottom: 10px;
  }

  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    margin: 0 5px;
  }

  button:nth-child(1) {
    background: #4caf50;
    color: white;
  }
  button:nth-child(2) {
    background: #f44336;
    color: white;
  }
  button:nth-child(3) {
    background: #ccc;
  }

  button:hover {
    opacity: 0.8;
  }
`;

const GlobalStyles = createGlobalStyle`
  .fc-button {
    background-color: #705C53 !important;
    border: none !important;
    color: white !important;
    padding: 8px 12px !important;
    border-radius: 4px !important;
    font-size: 14px !important;
  }

  .fc-button:hover {
    background-color: #9a9a9a !important;
  }

  .today-cell {
    background-color: #b7b7b7 !important;
  }

  .fc-event-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fc-daygrid-day {
    height: ${(props) => props.maxRowHeight}px !important;
  }

    /* 날짜 셀에 호버 효과 추가 */
  .hoverable-cell:hover {
    background-color: #e0e0e0 !important; /* 원하는 색상으로 변경 */
    transition: background-color 0.3s ease;
  }
`;

const EventWrapper = styled.div`
  background-color: #705C53;
  color: white;
  padding: 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const EventText = styled.span`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
