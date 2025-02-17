import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Questions from './pages/Questions';
import Report from './pages/Report';
import { supabase } from './lib/supabaseClient';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/questions" />} />
          <Route
            path="/profile"
            element={session ? <Profile session={session} /> : <Navigate to="/login" />}
          />
          <Route
            path="/questions"
            element={session ? <Questions session={session} /> : <Navigate to="/login" />}
          />
          <Route
            path="/report"
            element={session ? <Report session={session} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;