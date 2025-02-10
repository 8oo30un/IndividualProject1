// EventContainer.js
import React from "react";
import styled from "styled-components";

// EventContainer.js
const EventContainer = ({ selectedDate, selectedEvents, selectedRoutines }) => {
  return (
    <Container>
      <h3>{selectedDate ? `${selectedDate}의 일정` : "날짜를 선택해주세요"}</h3>
      {selectedEvents && selectedEvents.length > 0 ? (
        <ul>
          {selectedEvents.map((event, index) => (
            <li key={index}>{event.title}</li>
          ))}
        </ul>
      ) : (
        <p>일정이 없습니다.</p>
      )}
      {/* 루틴 목록 */}{" "}
      {selectedRoutines && selectedRoutines.length > 0 ? (
        <ul>
          {selectedRoutines.map((routine, index) => (
            <li key={index}>{routine.title}</li>
          ))}
        </ul>
      ) : (
        <p>루틴이 없습니다.</p>
      )}
    </Container>
  );
};

export default EventContainer;

// Styled Components
const Container = styled.div`
  /* width: 30%; */
  height: 100%;
  border: 1px solid #ccc;
  /* padding: 20px; */
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h3 {
    text-align: center;
    margin-bottom: 10px;
  }

  ul {
    list-style-type: none;
    padding: 10px;

    li {
      margin-bottom: 8px;
      font-weight: bold;
    }
  }

  p {
    font-style: italic;
    color: #999;
  }
`;
