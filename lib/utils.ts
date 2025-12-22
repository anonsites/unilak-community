export function timeAgo(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval + " year" + (interval === 1 ? "" : "s") + " ago";
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + " month" + (interval === 1 ? "" : "s") + " ago";
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + " day" + (interval === 1 ? "" : "s") + " ago";
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
  }
  
  return "Just now";
}

// Utility to handle Supabase returns that might be arrays or single objects
export type Unwrapped<T> = NonNullable<T> extends (infer U)[] ? U : NonNullable<T>;

export const unwrap = <T,>(data: T): Unwrapped<T> | null => {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return (data[0] ?? null) as Unwrapped<T> | null;
  }
  return data as unknown as Unwrapped<T>;
};