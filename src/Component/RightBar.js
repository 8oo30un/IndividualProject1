import styled from "styled-components";

const RightBar = () => {
  return (
    <MainContainer>
      <Box1>홈</Box1>
      <Box2>운동</Box2>
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
  background-color: red;
`;

const Box2 = styled.div`
  width: 100%;
  height: 50%;
  background-color: blue;
`;

export default RightBar;
