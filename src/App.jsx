import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyRecipes from './pages/MyRecipes.jsx';
import RecipeView from './pages/RecipeView.jsx';
import RecipeEdit from './pages/RecipeEdit.jsx';
import Browse from './pages/Browse.jsx';
import ShoppingListPage from './pages/ShoppingListPage.jsx';
import Profile from './pages/Profile.jsx';
import LeftoverScanner from './pages/LeftoverScanner.jsx';
import Settings from './pages/Settings.jsx';
import './i18n/config.js';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/leftover-scanner" element={<LeftoverScanner />} />
            <Route path="/user/:username" element={<Profile />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-recipes"
              element={
                <ProtectedRoute>
                  <MyRecipes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopping-list"
              element={
                <ProtectedRoute>
                  <ShoppingListPage />
                </ProtectedRoute>
              }
            />
            <Route path="/recipe/:id" element={<RecipeView />} />
            <Route
              path="/recipe/new"
              element={
                <ProtectedRoute>
                  <RecipeEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe/:id/edit"
              element={
                <ProtectedRoute>
                  <RecipeEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
