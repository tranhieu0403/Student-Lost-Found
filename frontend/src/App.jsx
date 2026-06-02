import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import PrivateRoute from './components/common/PrivateRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PostDetail from './pages/PostDetail.jsx';
import CreatePost from './pages/CreatePost.jsx';
import MyPosts from './pages/MyPosts.jsx';
import Chat from './pages/Chat.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManagePosts from './pages/admin/ManagePosts.jsx';

import { useAuth } from './hooks/useAuth.js';

function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-[100dvh] flex flex-col pb-14 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <div key={location.pathname} className="page-enter">
          <Routes location={location}>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

            <Route path="/posts/:id" element={<PostDetail />} />
            <Route
              path="/posts/create"
              element={<PrivateRoute><CreatePost /></PrivateRoute>}
            />
            <Route
              path="/my-posts"
              element={<PrivateRoute><MyPosts /></PrivateRoute>}
            />
            <Route
              path="/chat"
              element={<PrivateRoute><Chat /></PrivateRoute>}
            />
            <Route
              path="/chat/:partnerId"
              element={<PrivateRoute><Chat /></PrivateRoute>}
            />

            <Route
              path="/admin"
              element={<AdminRoute><AdminLayout /></AdminRoute>}
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="posts" element={<ManagePosts />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
