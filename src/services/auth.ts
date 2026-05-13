'use server';

import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '@/lib/s3';
import { ConnectionInput } from '@/lib/schema';

export async function verifyConnection(creds: ConnectionInput) {
  try {
    const client = createS3Client({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      region: creds.region,
      endpoint: creds.endpoint,
    });

    // Menjalankan perintah sederhana untuk mengetes koneksi
    await client.send(new ListBucketsCommand({}));

    return { success: true, message: 'Koneksi berhasil!' };
  } catch (error: any) {
    console.error('S3 Connection Error:', error);
    return { 
      success: false, 
      message: error.message || 'Gagal terhubung ke S3. Periksa kembali kredensial Anda.' 
    };
  }
}
