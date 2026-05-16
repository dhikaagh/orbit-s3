'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { connectionSchema, ConnectionInput } from '@/lib/schema';
import { useAuthStore } from '@/store/auth-store';
import { verifyConnection } from '@/services/auth';
import { toast } from 'sonner';
import { Loader2, Lock, Key, Globe, Link2 } from 'lucide-react';

export default function ConnectionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectionInput>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      region: 'us-east-1',
    },
  });

  const onSubmit = async (data: ConnectionInput) => {
    setIsLoading(true);
    try {
      const result = await verifyConnection(data);
      if (result.status === 'success') {
        setCredentials(data);
        toast.success(result.message);
        router.push('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hubungkan ke S3</h1>
        <p className="text-sm text-gray-500">Masukkan kredensial AWS Anda untuk memulai eksplorasi.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Access Key ID */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Key size={16} className="text-blue-500" />
            Access Key ID
          </label>
          <input
            {...register('accessKeyId')}
            type="text"
            placeholder="AKIA..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.accessKeyId && (
            <p className="text-xs text-red-500">{errors.accessKeyId.message}</p>
          )}
        </div>

        {/* Secret Access Key */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Lock size={16} className="text-blue-500" />
            Secret Access Key
          </label>
          <input
            {...register('secretAccessKey')}
            type="password"
            placeholder="••••••••••••"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.secretAccessKey && (
            <p className="text-xs text-red-500">{errors.secretAccessKey.message}</p>
          )}
        </div>

        {/* Region */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe size={16} className="text-blue-500" />
            Region
          </label>
          <input
            {...register('region')}
            type="text"
            placeholder="us-east-1"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.region && (
            <p className="text-xs text-red-500">{errors.region.message}</p>
          )}
        </div>

        {/* Endpoint (Optional) */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Link2 size={16} className="text-blue-500" />
            Custom Endpoint (Opsional)
          </label>
          <input
            {...register('endpoint')}
            type="text"
            placeholder="https://s3.example.com"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.endpoint && (
            <p className="text-xs text-red-500">{errors.endpoint.message}</p>
          )}
          <p className="text-[10px] text-gray-400 italic">Isi jika menggunakan R2, MinIO, atau provider lain.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Menghubungkan...
            </>
          ) : (
            'Hubungkan S3'
          )}
        </button>
      </form>

      <div className="pt-4 border-top text-center">
        <p className="text-[10px] text-gray-400">
          Kredensial Anda aman dan hanya disimpan di memori browser Anda.
        </p>
      </div>
    </div>
  );
}
