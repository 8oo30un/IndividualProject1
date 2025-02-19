import React, { useEffect, useState } from "react";
import { auth, firestore } from "./firebase";
import { useNavigate } from "react-router-dom";
import SideBar from "../Component/SiderBar";
import {
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import styled, { createGlobalStyle } from "styled-components";
import MyFullCalendar from "../API/Calendar";
import EventContainer from "../API/EventContainer";
import RightBar from "../Component/RightBar";
import {
  darkModeState,
  selectedDateState,
  selectedEventsState,
  selectedRoutinesState,
} from "../State/recoilAtoms"; // recoil 상태 import
import { useRecoilState, useRecoilValue } from "recoil";

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [memo, setMemo] = useState("");
  const [userMemories, setUserMemories] = useState([]);

  // Recoil 상태 사용
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);
  const [selectedEvents, setSelectedEvents] =
    useRecoilState(selectedEventsState);
  const [routines, setRoutines] = useRecoilState(selectedRoutinesState);
  const darkMode = useRecoilValue(darkModeState); // 다크모드 상태 가져오기

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchMemories(user.uid); // 유저 로그인 시 메모를 불러옴
      } else {
        navigate("/login"); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 메모 저장 함수
  const handleSaveMemo = async () => {
    if (memo.trim() === "") return; // 빈 메모는 저장하지 않음
    try {
      const userRef = doc(firestore, "users", user.uid);
      const memoriesCollection = collection(userRef, "memories");
      await addDoc(memoriesCollection, {
        content: memo,
        timestamp: new Date(),
      });
      setMemo(""); // 메모 내용 초기화
      fetchMemories(user.uid); // 메모 목록 다시 불러오기
    } catch (error) {
      console.error("Error saving memo:", error);
    }
  };

  // Firestore에서 유저의 메모 불러오기
  const fetchMemories = async (uid) => {
    const userRef = doc(firestore, "users", uid);
    const memoriesCollection = collection(userRef, "memories");
    const querySnapshot = await getDocs(memoriesCollection);
    const memories = [];
    querySnapshot.forEach((doc) => {
      memories.push({ id: doc.id, ...doc.data() }); // 문서 ID도 포함
    });
    setUserMemories(memories);
  };

  // 메모 삭제 함수
  const handleDeleteMemo = async (memoId) => {
    try {
      const userRef = doc(firestore, "users", user.uid);
      const memoryRef = doc(userRef, "memories", memoId); // 해당 메모 문서 참조
      await deleteDoc(memoryRef); // Firestore에서 메모 삭제
      fetchMemories(user.uid); // 삭제 후 메모 목록 다시 불러오기
    } catch (error) {
      console.error("Error deleting memo:", error);
    }
  };

  const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ darkMode }) => (darkMode ? "#111" : "#f5f5f5")};
    color: ${({ darkMode }) => (darkMode ? "#f5f5f5" : "#000")};
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
  }
`;

  return (
    <MainContainer>
      <GlobalStyle darkMode={darkMode} />
      {user ? (
        <div>
          <SideBar />
          <RightBar />
          <PageConatainer darkMode={darkMode}>
            <FunctionConatianer darkMode={darkMode}>
              <CalendarConatainer darkMode={darkMode}>
                {/* MyFullCalendar에서 날짜와 이벤트 상태를 부모로 전달 */}
                <MyFullCalendar
                  setSelectedDate={setSelectedDate}
                  setSelectedEvents={setSelectedEvents}
                />
              </CalendarConatainer>

              <RightContainer darkMode={darkMode}>
                <TodayContainer darkMode={darkMode}>
                  <EventContainer
                    selectedDate={selectedDate || "선택된 날짜가 없습니다"}
                    selectedEvents={selectedEvents || []}
                    routines={routines || []} // 추가
                  />
                </TodayContainer>
                <MemoContainer darkMode={darkMode}>
                  <AddMemoBox darkMode={darkMode}>
                    <input
                      type="text"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="새로운 메모를 입력하세요"
                    />
                    <button onClick={handleSaveMemo}>메모 저장</button>
                  </AddMemoBox>
                  <div>
                    {/* 저장된 메모들 */}
                    <ul>
                      {userMemories.map((memory) => (
                        <li key={memory.id}>
                          {memory.content}
                          <button onClick={() => handleDeleteMemo(memory.id)}>
                            ✖️
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </MemoContainer>
              </RightContainer>
            </FunctionConatianer>
          </PageConatainer>
        </div>
      ) : (
        <p>로그인 중...</p>
      )}
    </MainContainer>
  );
};

const MainContainer = styled.div`
  display: flex;
  // border: 10px solid black;
`;

const PageConatainer = styled.div`
  margin-top: 40px;
  margin-left: 70px;
  margin-right: 70px;
  background-color: ${({ darkMode }) => (darkMode ? "#2c2c2c" : "#fff")};
  color: ${({ darkMode }) => (darkMode ? "#f5f5f5" : "#000")};
`;

const CalendarConatainer = styled.div`
  display: flex;
  flex-direction: column; /* 세로로 정렬 */
  justify-content: flex-start;
  width: 70%;
  min-height: 100vh; /* 부모 컨테이너 최소 높이 설정 */
  height: auto; /* 내용에 맞춰 확장 */
  // border: 1px solid ${({ darkMode }) => (darkMode ? "#444" : "#ccc")};
  background-color: ${({ darkMode }) => (darkMode ? "#333" : "#f9f9f9")};
  overflow: visible; /* 내부 요소가 넘쳐도 보이도록 설정 */
  //지금 배경이 캘린더 높이에 같이 안늘어남
`;

const FunctionConatianer = styled.div`
  /* border: 10px solid red; */
  display: flex;
  /* width: 2000px; */
  align-content: space-between;
  background-color: ${({ darkMode }) => (darkMode ? "#444" : "#fff")};
`;

const RightContainer = styled.div`
  // border: 1px solid black;
  display: flex;
  flex-direction: column;
  width: 30%;
  background-color: ${({ darkMode }) => (darkMode ? "#222" : "#fff")};
`;

const TodayContainer = styled.div`
  height: 50%;
`;

const MemoContainer = styled.div`
  display: flex;
  /* flex-direction: column; */
  width: 100%; /* 또는 원하는 너비 */
  /* padding: 10px; */
  flex-direction: column;
  background-color: ${({ darkMode }) => (darkMode ? "#222" : "#fff")};

  ul {
    padding: 10px;
    display: flex;
    flex-wrap: wrap; /* 아이템들이 넘칠 경우 새로운 줄로 이동 */
    gap: 10px; /* 아이템 간 간격 */
    margin: 0;
    list-style-type: none;

    li {
      width: 48.5%; /* 메모 항목의 가로 크기 */
      min-height: 70px; /* 최소 높이를 설정 */
      background-color: ${({ darkMode }) => (darkMode ? "#333" : "#eddfe0")};
      margin-bottom: 8px;
      font-weight: bold;
      display: flex;
      flex-direction: column; /* 내용이 늘어나도록 세로로 정렬 */
      justify-content: space-between;
      padding: 5px;
      border-radius: 5px;
      box-sizing: border-box;
      position: relative; /* 삭제 버튼을 절대 위치로 배치하기 위해 설정 */
      padding-bottom: 35px; /* 삭제 버튼이 아래에 있도록 충분한 공간 추가 */

      button {
        position: absolute; /* 버튼을 절대 위치로 설정 */
        bottom: 5px; /* li의 하단에서 5px 위에 배치 */
        right: 5px; /* li의 우측에서 5px 안쪽에 배치 */
        border-radius: 20px;
        background-color: ${({ darkMode }) => (darkMode ? "#888" : "")};
        border: none;
      }
    }
  }

  p {
    font-style: italic;
    color: ${({ darkMode }) => (darkMode ? "#aaa" : "#999")};
  }
`;

const AddMemoBox = styled.div`
  display: flex;
  margin-top: 10px;
  /* border: 1px solid black; */

  input {
    margin-left: 5px;
    width: 90%; /* 상위 영역의 90% 너비 */
    height: 20px; /* 세로 크기 늘리기 */
    padding: 10px;
    font-size: 10px;
    border: 1px solid ${({ darkMode }) => (darkMode ? "#666" : "#ccc")};
    border-radius: 5px;
    background-color: ${({ darkMode }) => (darkMode ? "#333" : "#fff")};
    color: ${({ darkMode }) => (darkMode ? "#f5f5f5" : "#000")};
    margin-right: 10px; /* 버튼과 간격 */
  }

  button {
    margin-right: 5px;
    width: 100px; /* 버튼 너비 */
    height: 40px; /* 버튼 세로 크기 */
    padding: 10px;
    font-size: 10px;
    border: 1px solid ${({ darkMode }) => (darkMode ? "#666" : "#ccc")};
    border-radius: 5px;
    background-color: ${({ darkMode }) => (darkMode ? "#333" : "#f0f0f0")};
    cursor: pointer;
    color: ${({ darkMode }) => (darkMode ? "#f5f5f5" : "#000")};
  }

  button:hover {
    background-color: ${({ darkMode }) => (darkMode ? "#444" : "#e0e0e0")};
  }
`;

export default UserPage;
