import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SplashScreen from '../components/SplashScreen';
import { useState, useEffect } from 'react';

const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (isVerifying) {
    return <SplashScreen onComplete={() => setIsVerifying(false)} />;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
