// Error normalization. UI only ever sees an AppError with a friendly
// message + a retryable flag — never a raw network/CORS/parsing exception.

export class AppError extends Error {
  constructor(kind, message, { retryable = false, status } = {}) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
    this.retryable = retryable;
    this.status = status;
  }
}

// Map an HTTP status to an error kind the UI understands.
export function kindForStatus(status) {
  if (status === 429) return "quota";
  if (status === 401 || status === 403) return "auth";
  return "upstream";
}

export function messageForKind(kind) {
  switch (kind) {
    case "quota":
      return "The free-tier rate limit was reached. Wait a moment and try again.";
    case "auth":
      return "The model service rejected the request — check the API key.";
    case "offline":
      return "You're offline. Reconnect to continue.";
    case "unsupported":
      return "Your browser can't write directly to a folder — files will download instead.";
    case "validation":
      return "Please check what you entered and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// Turn any fetch failure into an AppError. A TypeError is the classic
// "network request failed" signature (offline, CORS block, DNS).
export function classifyFetchError(error, { status } = {}) {
  if (error instanceof AppError) return error;
  if (typeof status === "number") {
    const kind = kindForStatus(status);
    return new AppError(kind, messageForKind(kind), {
      retryable: kind === "upstream",
      status,
    });
  }
  if (error instanceof TypeError) {
    return new AppError("offline", messageForKind("offline"), { retryable: true });
  }
  return new AppError("upstream", messageForKind("upstream"), { retryable: true });
}
