import { atom } from "recoil";

// 선택된 날짜 상태 atom
export const selectedDateState = atom({
  key: "selectedDateState", // atom의 고유 ID
  default: "", // 초기 값은 빈 문자열
});

// 선택된 이벤트 상태 atom
export const selectedEventsState = atom({
  key: "selectedEventsState",
  default: [], // 초기 값은 빈 배열 (이벤트 목록)
});

export const selectedRoutinesState = atom({
  key: "selectedRoutinesState",
  default: {},
});

export const darkModeState = atom({
  key: "darkModeState", // 고유한 key를 설정
  default: JSON.parse(localStorage.getItem("darkMode") || "false"), // 로컬 스토리지에서 상태 불러오기
});
