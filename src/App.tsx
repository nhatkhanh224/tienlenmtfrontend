import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/:roomId" element={<GameTable />} />
        <Route path="*" element={<Navigate to="/lobby" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
