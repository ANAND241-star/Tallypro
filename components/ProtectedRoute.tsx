
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { user, isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to appropriate login page based on role requirement
        const redirectPath = requiredRole === 'admin' ? '/admin-login' : '/login';
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    if (requiredRole === 'admin' && !isAdmin) {
        // User is logged in but not an admin
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
