import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { socket, authenticateSocket } from '../socket';

interface RoomInfo {
  id: string;
  playersCount: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  bet: number;
  hostName: string;
}

const Lobby: React.FC = () => {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('Guest');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (!token || !storedUsername) {
      navigate('/login');
      return;
    }

    const user = authenticateSocket();
    setUsername(user.username);

    socket.emit('lobby:get_rooms');

    const handleRoomsUpdate = (data: RoomInfo[]) => {
      setRooms(data);
    };

    const handleRoomCreated = (data: { roomId: string }) => {
      navigate(`/game/${data.roomId}`);
    };

    const handleError = (msg: string) => {
      alert(`Lỗi: ${msg}`);
    };

    socket.on('lobby:rooms', handleRoomsUpdate);
    socket.on('room:created', handleRoomCreated);
    socket.on('error', handleError);

    return () => {
      socket.off('lobby:rooms', handleRoomsUpdate);
      socket.off('room:created', handleRoomCreated);
      socket.off('error', handleError);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    navigate('/login');
  };

  const handleCreateRoom = () => {
    socket.emit('room:create', { bet: 1000 });
  };

  const handleJoinRoom = (roomId: string) => {
    socket.emit('room:join', { roomId });
    navigate(`/game/${roomId}`);
  };

  const handlePlayOffline = () => {
    navigate('/game/offline');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="glass-panel animate-pop-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            fontSize: '2.5rem', background: 'var(--primary-color)', borderRadius: '50%',
            width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            🤠
          </div>
          <div>
            <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.6rem' }}>{username}</h2>
            <div style={{ color: '#ffd700', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
              💰 10,000 Xu
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.95rem' }} onClick={handlePlayOffline}>
            🤖 Chơi Offline với Bot
          </button>
          <button className="btn" style={{ padding: '10px 20px', fontSize: '1rem', background: 'linear-gradient(45deg, #10b981, #059669)' }} onClick={handleCreateRoom}>
            ➕ TẠO BÀN MỚI
          </button>
          <button className="btn btn-secondary" style={{ padding: '10px 15px', fontSize: '0.9rem', background: '#e74c3c' }} onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: 'white', letterSpacing: '1px' }}>🌐 Danh Sách Bàn Online ({rooms.length})</h3>
        <span style={{ fontSize: '0.85rem', color: '#2ed573' }}>● Đã kết nối Socket Server</span>
      </div>

      {/* Danh sách phòng */}
      {rooms.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#ccc' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🃏</div>
          <p style={{ fontSize: '1.1rem' }}>Chưa có bàn nào được tạo. Hãy nhấn <strong>"TẠO BÀN MỚI"</strong> để bắt đầu!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {rooms.map(room => (
            <div key={room.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', transition: 'transform 0.2s' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '5px', color: 'var(--secondary-color)' }}>Bàn #{room.id}</h3>
                <p style={{ opacity: 0.8, margin: 0, fontSize: '0.9rem' }}>
                  Chủ bàn: <strong style={{ color: 'white' }}>{room.hostName}</strong> | Cược: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{room.bet.toLocaleString()} Xu</span>
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: i < room.playersCount ? 'var(--secondary-color)' : 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}></div>
                  ))}
                </div>
                
                <button 
                  className={room.status === 'WAITING' && room.playersCount < 4 ? 'btn btn-secondary' : 'btn'}
                  disabled={room.status === 'PLAYING' || room.playersCount === 4}
                  style={{ opacity: (room.status === 'PLAYING' || room.playersCount === 4) ? 0.5 : 1, width: '120px' }}
                  onClick={() => handleJoinRoom(room.id)}
                >
                  {room.status === 'PLAYING' ? 'Đang chơi' : room.playersCount === 4 ? 'Đã đầy' : 'VÀO BÀN'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Lobby;
