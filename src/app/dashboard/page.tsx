'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui or similar, but I'll use a standard button if not sure

export default function DashboardPage() {
  const { credentials, isConnected, clearCredentials } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearCredentials();
    router.push('/');
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold">Akses Ditolak</h1>
        <p>Anda harus terhubung ke S3 terlebih dahulu.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Kembali ke Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard S3 Explorer</h1>
          <p className="text-gray-500 text-sm">Region: {credentials?.region}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-2">Status Koneksi</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Terhubung</span>
          </div>
        </div>

        {/* Placeholder untuk Bucket List di Fase 1 */}
        <div className="md:col-span-2 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
          <p className="text-gray-400">Daftar Bucket akan muncul di sini (Fase 1)</p>
        </div>
      </div>
    </div>
  );
}
