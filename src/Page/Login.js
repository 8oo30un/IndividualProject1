import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // 로그인 후 user.displayName에 저장된 이름을 UserPage로 전달
        navigate('/user', { state: { userName: user.displayName } });
      }
    } catch (error) {
      console.error('로그인 오류:', error.message);
    }
  };

  return (
    <div>
      <h2>구글 로그인</h2>
      <button onClick={handleGoogleSignIn}>구글 계정으로 로그인</button>
    </div>
  );
};

export default LoginPage;