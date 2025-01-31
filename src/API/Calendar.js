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

  useEffect(() => {
    const loadEvents = async () => {
      const eventsFromFirebase = await fetchEvents();
      setEvents(eventsFromFirebase);
    };
    loadEvents();
  }, []);

  const handleAddEvent = async (date) => {
    if (!isEditMode) return;

    console.log("Clicked date (raw):", date);

    // 날짜를 로컬 시간으로 변환
    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    ); // UTC 보정

    const formattedDate = localDate.toISOString().split("T")[0];

    const newEvent = { title: "New Event", date: formattedDate };
    const addedEvent = await addEvent(newEvent);
    setEvents([...events, addedEvent]);
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

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    await deleteEvent(selectedEvent.id);
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== selectedEvent.id)
    );
    setIsModalOpen(false);
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 오늘 날짜를 setSelectedDate에 저장
    const today = new Date();
    const formattedDate = formatDateToKorean(today); // 한국어 형식으로 오늘 날짜 포맷
    setSelectedDate(formattedDate); // 오늘 날짜를 setSelectedDate로 저장

  // 오늘 날짜에 해당하는 이벤트들을 setSelectedEvents에 저장
  const todayEvents = events.filter(
    (event) => new Date(event.date).toDateString() === today.toDateString()
  );
  setSelectedEvents(todayEvents); // 오늘 날짜에 해당하는 이벤트들 저장
}, [events, setSelectedDate, setSelectedEvents]); // events가 변경될 때마다 실행되도록 의존성 배열 추가


  const formatDateToKorean = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long", // 요일 포함
    };
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
  };

  const handleDateClick = (info) => {
    const clickedDate = info.date;
    const formattedDate = formatDateToKorean(clickedDate); // 클릭한 날짜를 한국어 형식으로 포맷
    setSelectedDate(formattedDate); // 클릭된 날짜를 setSelectedDate로 저장

    if (isEditMode) {
      // edit 버튼이 활성화되어 있을 때만 handleAddEvent 호출
      handleAddEvent(clickedDate);
    }

    // 클릭된 날짜에 해당하는 이벤트들을 필터링하여 setSelectedEvents에 저장
    const selectedDateEvents = events.filter(
      (event) => new Date(event.date).toDateString() === clickedDate.toDateString()
    );
    setSelectedEvents(selectedDateEvents); // 클릭된 날짜에 해당하는 이벤트들 저장
  };

  
  return (
    <Container isEditMode={isEditMode}>
      <CalendarWrapper>
        <GlobalStyles />
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick} // dateClick 이벤트 핸들러에 handleDateClick 추가
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
            return isToday ? "today-cell" : "";
          }}
          eventContent={(eventInfo) => {
            return (
              <div
                style={{
                  backgroundColor: "#705C53",
                  color: "white",
                  padding: "5px",
                }}
              >
                {eventInfo.event.title}
              </div>
            );
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
  // margin-left: 40px;
  // margin-right: 40px;
  width: 95%;
  height: 100vh; // 화면 전체 높이
  display: flex;
  flex-direction: column;
`;

// const Header = styled.div`
// border: 1px solid black;
//   display: flex;
//   justify-content: center;
//   padding: 10px;
// `;

// const EditButton = styled.button`
//   padding: 8px 12px;
//   background: #007bff;
//   color: white;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
// `;

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
    background-color: #b7b7b7 !important; /* 오늘 날짜의 배경색을 노란색으로 설정 */
  }
`;
