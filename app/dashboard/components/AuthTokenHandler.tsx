"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthTokenHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            localStorage.setItem("token", tokenFromUrl);
            // Clean up the URL
            window.history.replaceState(null, '', '/dashboard');
        }
    }, [searchParams, router]);

    return null; // This component renders nothing
}