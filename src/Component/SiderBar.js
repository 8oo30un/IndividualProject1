import styled from "styled-components";

const SideBar = () => {

return(
  <Container>
    <div>홈</div>
    <div>기록보기</div>
    <div>메뉴2</div>
    <div>메뉴3</div>
    <div>로그아웃</div>
  </Container>
);


}

const Container = styled.div`
border: 1px solid black;

display: flex;
position: fixed;
top:0%;
width: 100%;
justify-content: space-between;
/* z-index: 1000;  // 다른 요소들보다 위에 표시되도록 설정 */

`;

export default SideBar;