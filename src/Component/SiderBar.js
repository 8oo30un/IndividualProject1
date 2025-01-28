import styled from "styled-components";
import { useUser } from "../API/UserContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../Page/firebase";

const SideBar = () => {
  const user = useUser();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login"); // 로그아웃 후 로그인 페이지로 리디렉션
  };

  return (
    <Container>
      <div>홈</div>
      <div>기록보기</div>
      <div>메뉴2</div>
      <div>메뉴3</div>
      {user ? (
        <UserInfo>
          <UserIconImg src={user.photoURL} alt="Profile" />
          <UserName>
            <span>{user.displayName || "닉네임 없음"}</span>
          </UserName>
          <button onClick={handleLogout}>로그아웃</button>
        </UserInfo>
      ) : (
        <p>로그인 정보를 불러오는 중...</p>
      )}
    </Container>
  );
};

const Container = styled.div`
  border: 1px solid black;

  background-color: #cdcdcd;
  display: flex;
  position: fixed;
  top: 0%;
  width: 100%;
  justify-content: space-between;
  z-index: 1000; // 다른 요소들보다 위에 표시되도록 설정
`;

export default SideBar;
// SideBar.js import React from 'react'; import { useUser } from
// '../API/UserContext'; import styled from 'styled-components'; const SideBar =
// () => {   const user = useUser();   return (     <SidebarContainer>
// {user ? (         <UserInfo>           <UserIconImg src={user.photoURL}
// alt="Profile" />           <span>{user.displayName || '닉네임 없음'}</span>
// </UserInfo>       ) : (         <p>로그인 정보를 불러오는 중...</p>       )}
// </SidebarContainer>   ); }; const SidebarContainer = styled.div`   width:
// 250px;   height: 100%;   background-color: #f4f4f4;   border-right: 1px solid
// #ccc;   padding: 10px; `;

const UserName = styled.div`

//   margin-bottom: 5px;
  width: 100px;
`;

const UserInfo = styled.div`
  display: flex;
//   border: 1px solid black;
  align-items: center;
  width: 200px;
    justify-content: space-between;
  /* margin-bottom: 20px; */
`;

const UserIconImg = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  /* margin-right: 10px; */
`;

// export default SideBar;
