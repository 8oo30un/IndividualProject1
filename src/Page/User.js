import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebase';
import { useNavigate } from 'react-router-dom';
import SideBar from '../Component/SiderBar';
import { doc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import styled from 'styled-components';
import MyFullCalendar from '../API/Calendar';
import EventContainer from '../API/EventContainer';

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [memo, setMemo] = useState('');
  const [userMemories, setUserMemories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchMemories(user.uid); // 유저 로그인 시 메모를 불러옴
      } else {
        navigate('/login'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  // 메모 저장 함수
  const handleSaveMemo = async () => {
    if (memo.trim() === '') return; // 빈 메모는 저장하지 않음
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const memoriesCollection = collection(userRef, 'memories');
      await addDoc(memoriesCollection, {
        content: memo,
        timestamp: new Date(),
      });
      setMemo(''); // 메모 내용 초기화
      fetchMemories(user.uid); // 메모 목록 다시 불러오기
    } catch (error) {
      console.error('Error saving memo:', error);
    }
  };

  // Firestore에서 유저의 메모 불러오기
  const fetchMemories = async (uid) => {
    const userRef = doc(firestore, 'users', uid);
    const memoriesCollection = collection(userRef, 'memories');
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
      const userRef = doc(firestore, 'users', user.uid);
      const memoryRef = doc(userRef, 'memories', memoId); // 해당 메모 문서 참조
      await deleteDoc(memoryRef); // Firestore에서 메모 삭제
      fetchMemories(user.uid); // 삭제 후 메모 목록 다시 불러오기
    } catch (error) {
      console.error('Error deleting memo:', error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <SideBar />
          <PageConatainer>
            <FunctionConatianer>
              <CalendarConatainer>
                {/* MyFullCalendar에서 날짜와 이벤트 상태를 부모로 전달 */}
                <MyFullCalendar setSelectedDate={setSelectedDate} setSelectedEvents={setSelectedEvents} />

              </CalendarConatainer>

              <RightContainer>
                <TodayContainer>
                  <EventContainer selectedDate={selectedDate || '선택된 날짜가 없습니다'} selectedEvents={selectedEvents || []} />
                </TodayContainer>
                <MemoContainer>
                  <AddMemoBox>
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
                          <button onClick={() => handleDeleteMemo(memory.id)}>삭제</button>
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
      )
      }
    </div >
  );
};


const PageConatainer = styled.div`
margin-top: 40px;
margin-left: 70px;
margin-right: 70px;
/* border: 10px solid red; */
/* z-index: 900; */
`;

const CalendarConatainer = styled.div`
border: 1px solid black;
/* display: flex; */

align-content: center;
width: 70%;
`;

const FunctionConatianer = styled.div`
/* border: 10px solid red; */
display: flex;
/* width: 2000px; */
align-content: space-between;
`;

const RightContainer = styled.div`
border: 1px solid black;
display: flex;
flex-direction: column;
width: 30%;
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
  background-color: #fff44f;
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
      border: 1px solid rgb(120,129,140);
      
    }
  }
}

  p {
    font-style: italic;
    color: #999;
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
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px; /* 버튼과 간격 */
}

button {
  margin-right: 5px;
  width: 100px; /* 버튼 너비 */
  height: 40px; /* 버튼 세로 크기 */
  padding: 10px;
  font-size: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
}

button:hover {
  background-color: #e0e0e0;
}

`;

export default UserPage;
