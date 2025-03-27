'use client';

// Simplified toast component
import { createContext, useContext } from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

const ToastContext = createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

export const useToast = () => {
  return useContext(ToastContext);
};

// Simple implementation that uses console.log
export const toast = (props: ToastProps) => {
  console.log(
    `Toast: ${props.variant || 'default'} - ${props.title}`,
    props.description
  );
  // In a real app, this would show a toast notification
  alert(`${props.title}: ${props.description}`);
};
