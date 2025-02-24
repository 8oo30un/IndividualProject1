import styled from "styled-components";
import { useUser } from "../API/UserContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../Page/firebase";
import { darkModeState } from "../State/recoilAtoms";
import { useRecoilValue } from "recoil";
import { useEffect } from "react";

const SideBar = () => {
  const user = useUser();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login"); // 로그아웃 후 로그인 페이지로 리디렉션
  };
  const darkMode = useRecoilValue(darkModeState); // 다크모드 상태 가져오기

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.lordicon.com/lordicon.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Container darkMode={darkMode}>
      <div>
        <lord-icon
          src="https://cdn.lordicon.com/wmwqvixz.json"
          trigger="hover"
          colors={darkMode ? "primary:#ffffff" : "primary:#705C53"}
          style={{ width: "25px", height: "25px" }}
        ></lord-icon>
      </div>
      <div>기록보기</div>
      <div>메뉴2</div>
      <div>메뉴3</div>
      {user ? (
        <UserInfo>
          <UserIconImg src={user.photoURL} alt="Profile" />
          <UserName>
            <span>{user.displayName || "닉네임 없음"}</span>
          </UserName>
          <LogInButton onClick={handleLogout} darkMode={darkMode}>
            로그아웃
          </LogInButton>
        </UserInfo>
      ) : (
        <p>로그인 정보를 불러오는 중...</p>
      )}
    </Container>
  );
};

const Container = styled.div`
  // border: 1px solid black;
  background-color: ${({ darkMode }) => (darkMode ? "#444" : "#eddfe0")};
  display: flex;
  position: fixed;
  top: 0%;
  width: 100%;
  justify-content: space-between;
  z-index: 1000; // 다른 요소들보다 위에 표시되도록 설정
  padding: 4px;
`;

export default SideBar;

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

const LogInButton = styled.button`
  margin-right: 5%;
  padding: 5px;
  background-color: ${({ darkMode }) => (darkMode ? "#705c53" : "#b7b7b7")};
  color: ${({ darkMode }) => (darkMode ? "#f5f5f5" : "#222")};
  border: none;
  cursor: pointer;
  // transition: background-color 0.3s ease, color 0.3s ease;
  border-radius: 4px;

  &:hover {
    background-color: ${({ darkMode }) => (darkMode ? "#666" : "#9a9a9a")};
  }
`;

// export default SideBar;
