// EventContainer.js
import React from "react";
import styled from "styled-components";

// EventContainer.js
const EventContainer = ({ selectedDate, selectedEvents, routines }) => {
  // 디버깅: routines가 배열인지 확인
  // useEffect(() => {
  //   console.log("routines", routines);
  // }, [routines]);

  // const validRoutines =
  //   routines && typeof routines === "object" ? Object.values(routines) : [];

  // const filteredRoutines = selectedEvents
  //   .map((event) => routines[event.id]) // selectedEvents의 id에 해당하는 루틴을 가져오기
  //   .filter((routineArray) => routineArray && routineArray.length > 0); // 루틴이 있는 경우만 필터링

  return (
    <Container>
      <h3>{selectedDate ? `${selectedDate}의 일정` : "날짜를 선택해주세요"}</h3>
      {selectedEvents && selectedEvents.length > 0 ? (
        <ul>
          {selectedEvents.map((event, index) => {
            // 해당 event.id에 맞는 루틴을 필터링
            const filteredRoutines = routines[event.id] || [];

            return (
              <li key={index}>
                {/* 일정 제목 출력 */}
                <div>{event.title}</div>

                {/* 루틴 목록 출력 */}
                {filteredRoutines.length > 0 ? (
                  <ul>
                    {filteredRoutines.map((routine, subIndex) => (
                      <li key={`${index}-${subIndex}`}>{routine}</li>
                    ))}
                  </ul>
                ) : (
                  <></>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>일정이 없습니다.</p>
      )}
    </Container>
  );
};

export default EventContainer;

// Styled Components
const Container = styled.div`
  height: 100%;
  border: 1px solid #ccc;
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

      div {
        font-size: 16px;
        font-weight: 600;
      }

      p {
        font-style: italic;
        color: #999;
      }

      ul {
        padding-left: 20px;

        li {
          font-size: 12px; /* 루틴 글씨 크기를 작게 설정 */
          background-color: #eddfe0; /* 초록색 배경 */
          color: black; /* 텍스트 색상 흰색으로 설정 */
          padding: 5px;
          margin-bottom: 5px;
          margin-right: 5px;
          border-radius: 4px; /* 배경과 글씨를 깔끔하게 구분할 수 있도록 둥글게 처리 */
          display: inline-block; /* 내용에 맞게 배경 길이가 자동 조정되도록 설정 */
        }
      }
    }
  }

  p {
    font-style: italic;
    color: #999;
  }
`;
