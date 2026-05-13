import { z } from 'zod';

export const connectionSchema = z.object({
  accessKeyId: z.string().min(1, 'Access Key ID wajib diisi'),
  secretAccessKey: z.string().min(1, 'Secret Access Key wajib diisi'),
  region: z.string().min(1, 'Region wajib diisi'),
  endpoint: z.string().url('Endpoint harus berupa URL valid').optional().or(z.literal('')),
});

export type ConnectionInput = z.infer<typeof connectionSchema>;
