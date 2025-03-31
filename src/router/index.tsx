import React from 'react';
import { Navigate } from 'react-router-dom';
import DiaryPage from '../pages/Diary';
import Home from '../pages/Home';
import { StatisticsPage } from '../pages/Statistics';
import AIAnalysisPage from '../pages/Analysis';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import MainLayout from '../layouts/MainLayout';
import { PrivateRoute } from '../components/PrivateRoute';
import Profile from '../pages/Profile';

const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/',
    element: <PrivateRoute><MainLayout /></PrivateRoute>,
    children: [
      {
        path: '/',
        element: <Navigate to="/home" replace />
      },
      {
        path: '/home',
        element: <PrivateRoute><Home /></PrivateRoute>
      },
      {
        path: '/diary',
        element: <PrivateRoute><DiaryPage /></PrivateRoute>
      },
      {
        path: '/statistics',
        element: <PrivateRoute><StatisticsPage /></PrivateRoute>
      },
      {
        path: '/analysis',
        element: <PrivateRoute><AIAnalysisPage /></PrivateRoute>
      },
      {
        path: '/profile',
        element: <PrivateRoute><Profile /></PrivateRoute>
      }
    ]
  }
];

export default routes; 