// src/store/useUserStore.ts
import { create } from 'zustand';

// Типы данных
interface User {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    avatar?: string;
    business_context?: string;
    is_premium?: boolean;

}

interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    // Actions (Действия)
    fetchUser: () => Promise<void>;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: false, // Изначально false, запустим при вызове fetch
    error: null,

    fetchUser: async () => {
        set({ isLoading: true, error: null });

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

            const res = await fetch(`${API_URL}/users/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Unauthorized");

            const data = await res.json();
            set({ user: data.user, isLoading: false });

        } catch (error: any) {
            console.error(error);
            // Если ошибка — сбрасываем юзера и чистим токен
            localStorage.removeItem("token");
            set({ user: null, isLoading: false, error: error.message });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ user: null });
        // Редирект будем делать в компоненте, так как хуки роутера тут не работают напрямую
    }
}));