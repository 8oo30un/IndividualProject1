import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebase';
import { useNavigate } from 'react-router-dom';
import SideBar from '../Component/SiderBar';
import { doc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import styled from 'styled-components';

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [memo, setMemo] = useState('');
  const [userMemories, setUserMemories] = useState([]);

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

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login'); // 로그아웃 후 로그인 페이지로 리디렉션
  };

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

          <UserContainer>
            <span >환영합니다, {user.displayName || "닉네임이 설정되지 않았습니다."}님!</span>
            <UserIconImg src={user.photoURL} alt="Profile" />
            <button onClick={handleLogout}>로그아웃</button>
          </UserContainer>

          <MemoContainer>
            <div>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="새로운 메모를 입력하세요"
              />
              <button onClick={handleSaveMemo}>메모 저장</button>
            </div>

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
        </div>
      ) : (
        <p>로그인 중...</p>
      )
      }
    </div >
  );
};

const UserContainer=styled.div`
border: 1px solid black;

display: flex;
margin-top: 100px;
margin-left: auto;

width: 250px;
height: 30px;
justify-content: space-between;
align-items: center;
text-align: center;
`;

const UserIconImg=styled.img`
  width: 25px;
  height: 25px;
  border-radius: 20px;
`;

const MemoContainer = styled.div`
border: 1px solid black;
margin-top: 50px;
margin-left: 40%;

display: flex;
align-items: center;
justify-content: space-between;
`;

export default UserPage;
