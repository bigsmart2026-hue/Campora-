/// <reference types="vite/client" />

declare module 'firebase/functions' {
  export function getFunctions(app?: any): any;
  export function httpsCallable(functions: any, name: string): (data?: any) => Promise<{ data: any }>;
}

interface PaystackPop {
  setup(config: {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    metadata?: Record<string, unknown>;
    callback: (response: any) => void;
    onClose: () => void;
  }): {
    openIframe: () => void;
  };
}

declare const PaystackPop: PaystackPop;
