import "server-only";

// Temporary safety patch: make Object.entries tolerate null/undefined on the server.
// Returns an empty array instead of throwing. This unblocks SSR while we locate the source.
const __origEntries = Object.entries.bind(Object);

Object.entries = ((obj: any) => {
  if (obj == null) return [];
  return __origEntries(obj as any);
}) as any;

export {};
