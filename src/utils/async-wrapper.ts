import { formatAppError, type AppError } from "./handle-error";

export async function safeAwait<T>(
  promise: Promise<T>,
): Promise<[T, null] | [null, AppError]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return [null, formatAppError(error)];
  }
}
