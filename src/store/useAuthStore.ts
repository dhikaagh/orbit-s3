import { create } from 'zustand';

interface S3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
}

interface AuthState {
  credentials: S3Credentials | null;
  isConnected: boolean;
  setCredentials: (creds: S3Credentials) => void;
  clearCredentials: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  credentials: null,
  isConnected: false,
  setCredentials: (creds) => set({ credentials: creds, isConnected: true }),
  clearCredentials: () => set({ credentials: null, isConnected: false }),
}));
