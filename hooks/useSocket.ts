import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // ОПРЕДЕЛЯЕМ URL ДЛЯ СОКЕТА
        // Если мы в продакшене (браузер), используем текущий домен (undefined).
        // Если API_URL это полный путь (http://localhost:4500), используем его.
        // Если API_URL это просто "/api", игнорируем его и берем корень сайта.
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        const connectionUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : undefined;

        console.log("🔌 Connecting socket to:", connectionUrl || "Current Domain");

        const socketInstance = io(connectionUrl, {
            path: "/socket.io/", // Это совпадает с location в Nginx
            auth: { token },
            transports: ['websocket'], // Только вебсокеты, без поллинга
            reconnectionAttempts: 5,
            // Добавляем secure: true для HTTPS
            secure: true,
        });

        socketInstance.on('connect', () => {
            console.log('🟢 Socket connected:', socketInstance.id);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('🔴 Socket Connection Error:', err);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return socket;
};