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
  fetchHealthEvents,
  updateHealthEvent,
  addRoutine,
  fetchRoutines,
} from "../Page/firebase";
import {
  selectedDateState,
  selectedEventsState,
  selectedRoutinesState,
} from "../State/recoilAtoms"; // recoil 상태 import
import { useRecoilState } from "recoil";

const MyFullCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [maxRowHeight, setMaxRowHeight] = useState(0);
  const [newRoutine, setNewRoutine] = useState("");
  const [healthEvents, setHealthEvents] = useState(new Set()); // 헬스 이벤트 ID 저장

  // Recoil 상태 사용
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);
  const [selectedEvents, setSelectedEvents] =
    useRecoilState(selectedEventsState);
  const [routines, setRoutines] = useRecoilState(selectedRoutinesState);

  useEffect(() => {
    const loadEvents = async () => {
      const eventsFromFirebase = await fetchEvents();
      setEvents(eventsFromFirebase);

      const healthEventsFromFirebase = await fetchHealthEvents(); // [수정됨] 헬스 이벤트 불러오기
      setHealthEvents(new Set(healthEventsFromFirebase));
    };
    loadEvents();
  }, []);

  // 🔹 모든 이벤트에 대한 루틴 불러오기
  useEffect(() => {
    const loadAllRoutines = async () => {
      const allRoutines = {};
      for (const event of events) {
        const routinesForEvent = await fetchRoutines(event.id);
        allRoutines[event.id] = routinesForEvent;
      }
      setRoutines(allRoutines); // 🔹 모든 루틴을 Recoil 상태에 저장
      // console.log(allRoutines);
    };
    if (events.length > 0) {
      loadAllRoutines(); // 이벤트가 로드되면 모든 루틴을 불러옴
    }
  }, [events, setRoutines]);

  // 🔹 루틴 추가 핸들러 (Firestore 저장 포함)
  const handleAddRoutine = async () => {
    if (!selectedEvent || !newRoutine.trim()) return;

    await addRoutine(selectedEvent.id, newRoutine);

    // 🔹 모든 루틴을 Recoil 상태에 업데이트
    setRoutines((prevRoutines) => ({
      ...prevRoutines,
      [selectedEvent.id]: [
        ...(prevRoutines[selectedEvent.id] || []),
        newRoutine,
      ],
    }));
    setNewRoutine(""); // 입력 필드 초기화
  };

  const handleDeleteRoutine = (routine) => {
    // 🔹 Recoil 상태에서 루틴 삭제
    setRoutines((prev) => {
      const updatedRoutines = { ...prev };
      updatedRoutines[selectedEvent.id] = updatedRoutines[
        selectedEvent.id
      ].filter((r) => r !== routine);
      return updatedRoutines;
    });
  };

  const eventContent = (eventInfo) => {
    const isHealth = healthEvents.has(eventInfo.event.id);
    // const routinesForEvent = routines[eventInfo.event.id] || [];
    // const routinesText =
    //   routinesForEvent.length > 0 ? ` ${routinesForEvent.join(" ")}` : "";

    return (
      <EventWrapper
        data-tooltip={`☁️  ${eventInfo.event.startStr} - ${eventInfo.event.title}`}
        isHealth={isHealth}
      >
        <EventText title={eventInfo.event.title}>
          {eventInfo.event.title}
        </EventText>
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
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    ); // UTC 보정

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
      const updatedEvents = prevEvents.filter(
        (event) => event.id !== selectedEvent.id
      );
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
      (event) =>
        new Date(event.date).toDateString() === clickedDate.toDateString()
    );
    setSelectedEvents(selectedDateEvents);
  };

  const toggleHealthMode = async () => {
    if (!selectedEvent) return;

    const updatedHealthEvents = new Set(healthEvents);

    if (updatedHealthEvents.has(selectedEvent.id)) {
      updatedHealthEvents.delete(selectedEvent.id); // 헬스 모드 해제
      await updateHealthEvent(selectedEvent.id, false); // [수정됨] Firestore 업데이트
      alert("헬스 모드가 해제되었습니다.");
    } else {
      updatedHealthEvents.add(selectedEvent.id); // 헬스 모드 등록
      await updateHealthEvent(selectedEvent.id, true); // [수정됨] Firestore 업데이트
      alert("헬스 모드로 등록되었습니다!");
    }

    setHealthEvents(updatedHealthEvents);
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
              <button onClick={toggleHealthMode}>
                {healthEvents.has(selectedEvent?.id)
                  ? "헬스 모드 해제"
                  : "헬스 모드 등록"}
              </button>
              <button onClick={() => setIsRoutineModalOpen(true)}>
                루틴 관리
              </button>
              <button onClick={handleUpdateEvent}>수정</button>
              <button onClick={handleDeleteEvent}>삭제</button>
              <button onClick={() => setIsModalOpen(false)}>닫기</button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}

      {isRoutineModalOpen && (
        <ModalOverlay onClick={() => setIsRoutineModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>루틴 관리</h3>
            <RoutineInputBox>
              <RoutineInput
                type="text"
                value={newRoutine}
                onChange={(e) => setNewRoutine(e.target.value)}
                placeholder="루틴 입력"
              />
              <RoutineButton onClick={handleAddRoutine}>✅</RoutineButton>
            </RoutineInputBox>
            <RoutineList>
              {(routines[selectedEvent?.id] || []).map((routine, index) => (
                <RoutineItem key={index}>
                  {routine}
                  <RoutineButton onClick={() => handleDeleteRoutine(routine)}>
                    ❎
                  </RoutineButton>
                </RoutineItem>
              ))}
            </RoutineList>
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
    padding: 8px 10px !important;
    border-radius: 4px !important;
    font-size: 14px !important;
        height: 35px !important; /* 버튼 높이 조절 */

  }

   .fc-button-group {
    gap: 8px !important; /* 버튼 간격 조정 */
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
  background-color: ${(props) => (props.isHealth ? "#FF6B6B" : "#705C53")};
  color: white;
  padding: 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  position: relative; /* 부모 요소에서 툴팁을 절대 위치로 설정하기 위해 relative 추가 */
  z-index: 10; /* EventWrapper의 z-index 추가 */

  /* 부모 요소의 overflow가 hidden이라면 visible로 설정 */
  overflow: visible;

  &:hover::after {
    content: attr(data-tooltip); /* data-tooltip 속성을 툴팁으로 표시 */
    position: fixed;
    top: 10px; /* 화면 상단에 고정 */
    left: 50%; /* 화면의 가운데에 정렬 */
    transform: translateX(-50%); /* 중앙 정렬 */
    background: ${(props) => (props.isHealth ? "#FF6B6B" : "#705C53")};
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    display: block;
    z-index: 9999; /* 툴팁이 다른 요소 위에 뜨게 설정 */
    pointer-events: none; /* 툴팁에서 클릭이 가능하지 않도록 설정 */
    opacity: 0; /* 처음에는 투명하게 시작 */
    transition: opacity 0.3s ease, top 0.3s ease; /* 애니메이션 추가 */

    /* 애니메이션: 툴팁이 부드럽게 나타나도록 설정 */
    animation: tooltip-animation 0.3s forwards;
  }

  /* 애니메이션 정의 */
  @keyframes tooltip-animation {
    0% {
      opacity: 0;
      top: 10px;
    }
    100% {
      opacity: 1;
      top: 50px; /* 애니메이션이 끝난 후 위치 */
    }
  }
`;

const EventText = styled.span`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RoutineButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  align-items: center;
`;

const RoutineList = styled.ul`
  list-style: none;
  padding: 0;
`;

const RoutineInput = styled.input`
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* 패딩 포함 높이 유지 */
`;

const RoutineItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  background-color: #f5f5f7;
  border-radius: 4px;
  margin: 5px 0;
  padding: 8px;
`;

const RoutineInputBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;
