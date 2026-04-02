"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { socket } from "@/socket";
import { useUserStore } from "@/lib/stores/user.store";
import { useStore } from "zustand";
import { TNotificationItem } from "@/lib/api/notification";
import { useNotificationStore } from "@/lib/stores/notification.store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>{children}</SocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function SocketProvider({ children }: { children: React.ReactNode }) {
  const user = useStore(useUserStore, (s) => s.user);
  const setUser = useStore(useUserStore, (s) => s.setUser);
  const notifications = useStore(useNotificationStore, (s) => s.notifications);
  const setNotifications = useStore(useNotificationStore, (s) => s.setNotifications);

  useEffect(() => {
    function onConnect() {
      console.log("✅ WebSocket connected:", socket.id);
    }

    function onDisconnect() {
      console.log("❌ WebSocket disconnected");
    }

    function onTokenVerified(data: { valid: boolean }) {
      if (!data.valid) {
        console.warn("⚠️ Token invalid/expired, logging out...");
        setUser(null);
        socket.disconnect();
      }
    }

    function onNotification(notification: TNotificationItem) {
      // Handle incoming notification (e.g. show toast, update state, etc.)
      console.log("🔔 New notification received:", notification);
      setNotifications([notification, ...notifications]);
    }

    // Only connect if user is logged in
    if (user) {
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("token-verified", onTokenVerified);
      socket.on("notification", onNotification);

      if (!socket.connected) {
        socket.connect();
      }

      // Periodically verify token (every 5 minutes, matching backend validation interval)
      const tokenVerificationInterval = setInterval(
        () => {
          if (socket.connected) {
            socket.emit("verify-token");
          }
        },
        5 * 60 * 1000,
      ); // 5 minutes

      return () => {
        clearInterval(tokenVerificationInterval);
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("token-verified", onTokenVerified);
        socket.off("notification", onNotification);
      };
    } else {
      // Disconnect if user logs out
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [user, setUser, notifications, setNotifications]);

  return children;
}
