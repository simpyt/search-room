type ApiType = 'openai' | 'homegate';

export function logApiStart(
  api: ApiType,
  operation: string,
  context?: Record<string, unknown>
): number {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] [${api.toUpperCase()}] START ${operation}`,
    context ? JSON.stringify(context) : ''
  );
  return performance.now();
}

export function logApiSuccess(
  api: ApiType,
  operation: string,
  startTime: number,
  details?: Record<string, unknown>
): void {
  const duration = Math.round(performance.now() - startTime);
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] [${api.toUpperCase()}] ✓ ${operation} completed in ${duration}ms`,
    details ? JSON.stringify(details) : ''
  );
}

export function logApiError(
  api: ApiType,
  operation: string,
  startTime: number,
  error: unknown
): void {
  const duration = Math.round(performance.now() - startTime);
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    `[${timestamp}] [${api.toUpperCase()}] ✗ ${operation} failed after ${duration}ms:`,
    message
  );
}
