// UserPage.js
import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

const UserPage = () => {
  const navigate = useNavigate(); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login'); // 로그아웃 후 로그인 페이지로 리디렉션
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>사용자 페이지</h2>
          <p>환영합니다, {user.displayName || "닉네임이 설정되지 않았습니다."}</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <p>로그인 중...</p>
      )}
    </div>
  );
};

export default UserPage;
