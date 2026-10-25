"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

type Listener = (toasts: ToastItem[]) => void;
const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];

function broadcast() {
  const snapshot = toasts.map((t) => ({ ...t }));
  listeners.forEach((l) => l(snapshot));
}

export function createToast(item: Omit<ToastItem, "id">): string {
  const id = Math.random().toString(36).slice(2, 9);
  const toast: ToastItem = { ...item, id, duration: item.duration ?? 4000 };
  toasts = [toast, ...toasts].slice(0, 6);
  broadcast();
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  broadcast();
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [localToasts, setLocalToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.add(setLocalToasts);
    setLocalToasts([...toasts]);
    return () => {
      listeners.delete(setLocalToasts);
    };
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">): string => createToast(item),
    []
  );

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  const value = useMemo(
    () => ({ toast, dismiss }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        {localToasts.map((t) => (
          <ToastItemView
            key={t.id}
            item={t}
            onDismiss={() => dismiss(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItemView({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const isDestructive = item.variant === "destructive";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 shadow-xl pointer-events-auto animate-in slide-in-from-right-4 duration-300",
        isDestructive
          ? "border-destructive bg-destructive text-destructive-foreground"
          : "border-border bg-background text-foreground"
      )}
    >
      <div className="flex flex-col gap-1">
        {item.title && (
          <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
        )}
        {item.description && (
          <p className="text-xs leading-tight opacity-90 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="ml-auto opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current rounded"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
