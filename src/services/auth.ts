'use server';

import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '@/lib/s3';
import { ConnectionInput } from '@/lib/schema';
import { JSendResponse } from '@/common/types';

export async function verifyConnection(creds: ConnectionInput): Promise<JSendResponse> {
  try {
    const client = createS3Client({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      region: creds.region,
      endpoint: creds.endpoint,
    });

    // Menjalankan perintah sederhana untuk mengetes koneksi
    await client.send(new ListBucketsCommand({}));

    return { 
      status: 'success', 
      message: 'Koneksi berhasil!',
      data: null 
    };
  } catch (error) {
    console.error('S3 Connection Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Gagal terhubung ke S3. Periksa kembali kredensial Anda.';
    
    // Fail for client-side issues (credential errors), Error for server-side
    return { 
      status: 'fail', 
      message: errorMessage,
      data: null
    };
  }
}
