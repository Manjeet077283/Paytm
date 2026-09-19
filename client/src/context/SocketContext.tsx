import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  lastEvent: { event: string; payload: any } | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeTaskId: null,
  setActiveTaskId: () => {},
  lastEvent: null
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<{ event: string; payload: any } | null>(null);

  useEffect(() => {
    const backendHost = (import.meta.env.VITE_API_URL || '').trim() || window.location.origin;
    const s = io(backendHost, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to WorkMate Server');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('⚡ [Socket.IO] Disconnected from WorkMate Server');
      setIsConnected(false);
    });

    // Listen to all relevant agent events
    const events = [
      'TASK_STARTED',
      'STEP_STARTED',
      'STEP_COMPLETED',
      'ANALYSIS_RUNNING',
      'ANOMALY_DETECTION',
      'VERIFICATION_PASSED',
      'APPROVAL_REQUESTED',
      'REPORT_GENERATED',
      'TASK_COMPLETED',
      'TASK_FAILED',
      'LOG_EMITTED'
    ];

    events.forEach((eventName) => {
      s.on(eventName, (payload: any) => {
        setLastEvent({ event: eventName, payload });
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // When activeTaskId changes, join the socket room
  useEffect(() => {
    if (socket && activeTaskId) {
      socket.emit('join_task', activeTaskId);
    }
  }, [socket, activeTaskId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeTaskId, setActiveTaskId, lastEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
