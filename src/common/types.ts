export type JSendStatus = 'success' | 'fail' | 'error';

export interface JSendResponse<T = any> {
  status: JSendStatus;
  message: string;
  data?: T;
}
