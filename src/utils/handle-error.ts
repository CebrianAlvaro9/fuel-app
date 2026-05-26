export type AppError = {
  message: string;
  name: string;
  code?: string;
  status?: number;
  internalError?: unknown;
};

export const formatAppError = (error: unknown): AppError => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      name: "AbortError",
      message: "The request was aborted",
    };
  }
  if (error instanceof Error) {
    const status =
      (error as { status?: number }).status ??
      (error as { statusCode?: number }).statusCode;
    const code = (error as { code?: string }).code;

    return {
      name: error.name,
      message: error.message,
      code: typeof code === "string" ? code : "INTERNAL_ERROR",
      status: typeof status === "number" ? status : 500,
      internalError: error,
    };
  }

  if (typeof error === "string") {
    return {
      name: "CustomError",
      message: error,
      code: "CUSTOM_ERROR",
    };
  }

  return {
    name: "UnknownError",
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    internalError: error,
  };
};
