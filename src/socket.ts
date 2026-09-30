import { io, Socket } from 'socket.io-client';
import { getBackendUrl } from './config';

export const socket: Socket = io(getBackendUrl(), {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export function getUserId(): string {
  let userId = sessionStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('userId', userId);
  }
  return userId;
}

export function getUsername(): string {
  return localStorage.getItem('username') || 'Player_' + getUserId().slice(-4);
}

export function authenticateSocket() {
  const userId = getUserId();
  const username = getUsername();
  socket.emit('auth', { userId, username });
  return { userId, username };
}

socket.on('connect', () => {
  authenticateSocket();
});
