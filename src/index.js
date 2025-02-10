import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { RecoilRoot } from "recoil";

const root = ReactDOM.createRoot(document.getElementById("root")); // createRoot 메서드를 사용
root.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>
);
