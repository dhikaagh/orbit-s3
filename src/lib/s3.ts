import { S3Client } from '@aws-sdk/client-s3';

export const createS3Client = (credentials: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
}) => {
  return new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    endpoint: credentials.endpoint || undefined,
    forcePathStyle: !!credentials.endpoint, // Biasanya dibutuhkan untuk non-AWS S3 seperti MinIO
  });
};
