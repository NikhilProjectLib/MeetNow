/**
 * Generate a ticket/pass ID like BookMyShow or Indian Railways.
 * Format: MN-XXXXXX (MN = MeetNow prefix, 6 alphanumeric chars)
 */
export function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MN-${code}`;
}
