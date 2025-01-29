import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styled from "styled-components";
import { fetchEvents, addEvent, updateEvent, deleteEvent } from "../Page/firebase";  // firebase.js에서 import

const MyFullCalendar = ({ setSelectedDate, setSelectedEvents }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  // 컴포넌트가 처음 로드될 때 Firestore에서 이벤트 가져오기
  useEffect(() => {
    const loadEvents = async () => {
      const eventsFromFirebase = await fetchEvents();
      setEvents(eventsFromFirebase);
    };
    loadEvents();
  }, []);

  // 날짜 클릭 시 새로운 이벤트 추가
  const handleAddEvent = async (date) => {
    const localDate = new Date(date);
    const formattedDate = `${localDate.getFullYear()}-${(localDate.getMonth() + 1).toString().padStart(2, '0')}-${localDate.getDate().toString().padStart(2, '0')}`;

    const newEvent = { title: "New Event", date: formattedDate };
    const addedEvent = await addEvent(newEvent);

    setEvents([...events, addedEvent]);

    setSelectedDate(formattedDate);
    const eventsForDate = [...events, addedEvent].filter(
      (event) => event.date === formattedDate
    );
    setSelectedEvents(eventsForDate);
  };

  // 이벤트 클릭 시 모달 열기
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setNewTitle(info.event.title);
    setIsModalOpen(true);
  };

  // 이벤트 수정
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

  // 이벤트 삭제
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    await deleteEvent(selectedEvent.id);

    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== selectedEvent.id)
    );
    setIsModalOpen(false);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        editable={true}
        selectable={true}
        dayCellContent={(arg) => {
          return (
            <div style={{ position: 'relative', height: '100%' }}>
              <AddEventButton onClick={() => handleAddEvent(arg.date)}>
                +
              </AddEventButton>
              <span style={{ marginLeft: '20px' }}>{arg.dayNumberText}</span>
            </div>
          );
        }}
      />

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
    </div>
  );
};

export default MyFullCalendar;

// + 버튼 스타일
const AddEventButton = styled.button`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  font-size: 14px;
  line-height: 18px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  text-align: center;
  z-index: 10;
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
