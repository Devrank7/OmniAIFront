// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Создаем подключение
        const socketInstance = io(API_URL, {
            path: "/socket.io/",
            auth: { token }, // Передаем токен для авторизации
            transports: ['websocket'] // Форсируем вебсокеты
        });

        socketInstance.on('connect', () => {
            console.log('🟢 Socket connected');
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return socket;
};