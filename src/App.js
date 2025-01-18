// import logo from './logo.svg';
// import './App.css';

import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./Page/Login";
// import HomePage from "./Page/Home";
// import SignUpPage from "./Page/SignUp";
import UserPage from "./Page/User";
import { UserProvider } from "./API/UserContext";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        {/* <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path = "/user/:id" element={<HomePage />} />
  </Routes> */}

        <Routes>
          {/* <Route path="/signup" element={<SignUpPage />} /> */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route exact path="/" element={<LoginPage />} /> {/* 기본 페이지 */}
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
