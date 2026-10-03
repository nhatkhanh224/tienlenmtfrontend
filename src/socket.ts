import { io, Socket } from 'socket.io-client';
import { getBackendUrl } from './config';

export const socket: Socket = io(getBackendUrl(), {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export function getUserId(): string {
  return sessionStorage.getItem('userId') || '';
}

export function getUsername(): string {
  return localStorage.getItem('username') || 'Player_' + getUserId().slice(-4);
}

interface SocketAuthResponse {
  ok: boolean;
  userId?: string;
  username?: string;
  error?: string;
}

export async function authenticateSocket(): Promise<{ userId: string; username: string }> {
  const token = localStorage.getItem('token');
  const username = getUsername();
  if (!token) return { userId: '', username };

  return new Promise((resolve, reject) => {
    socket.timeout(8000).emit('auth', { token }, (timeoutError: Error | null, response: SocketAuthResponse) => {
      if (timeoutError) {
        reject(new Error('Không thể xác thực kết nối tới máy chủ.'));
        return;
      }
      if (!response?.ok || !response.userId || !response.username) {
        reject(new Error(response?.error || 'Phiên đăng nhập không hợp lệ.'));
        return;
      }

      sessionStorage.setItem('userId', response.userId);
      localStorage.setItem('username', response.username);
      resolve({ userId: response.userId, username: response.username });
    });
  });
}

socket.on('connect', () => {
  if (localStorage.getItem('token')) {
    void authenticateSocket().catch((error) => console.error('Socket authentication error:', error));
  }
});
