import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './firebase/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { GamePage } from './pages/GamePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
