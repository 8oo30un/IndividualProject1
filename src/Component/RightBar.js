import { useRecoilState } from "recoil";
import styled from "styled-components";
import { darkModeState } from "../State/recoilAtoms";

const RightBar = () => {
  const [darkMode, setDarkMode] = useRecoilState(darkModeState); // 다크 모드 상태 사용

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newDarkMode = !prev;
      localStorage.setItem("darkMode", newDarkMode); // 로컬 스토리지에 상태 저장
      return newDarkMode;
    });
  };

  return (
    <MainContainer>
      <Box1>홈</Box1>
      <Box2>운동</Box2>
      <DarkModeButton onClick={toggleDarkMode}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </DarkModeButton>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  border: 1px solid black;

  right: 0;
  top: 15%;
  display: flex;
  position: fixed;
  flex-direction: column;
  width: 60px;
  height: 300px;
  z-index: 1000; // 다른 요소들보다 위에 표시되도록 설정
`;

const Box1 = styled.div`
  width: 100%;
  height: 50%;
`;

const Box2 = styled.div`
  width: 100%;
  height: 50%;
`;

const DarkModeButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  background-color: ${({ darkMode }) => (darkMode ? "#444" : "#705C53")};
  color: ${({ darkMode }) => (darkMode ? "#f5f5f5" : "#fff")};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  border-radius: 4px;

  &:hover {
    background-color: ${({ darkMode }) => (darkMode ? "#666" : "#9a9a9a")};
  }
`;

export default RightBar;
