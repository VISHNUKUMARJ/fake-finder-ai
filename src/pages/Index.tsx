
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("fakefinder_isLoggedIn") === "true";

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate, isLoggedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FakeFinder AI</h1>
        <p className="text-xl text-gray-600">Redirecting you...</p>
      </div>
    </div>
  );
};

export default Index;
