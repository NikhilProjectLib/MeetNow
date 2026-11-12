/**
 * Browsing is public; only actions (join, create, chat, profile) need login.
 * These helpers send people to /login and bring them back afterwards.
 */

/** Pages anyone can view without signing in. */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/explore" ||
    pathname === "/login" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/contact" ||
    pathname.startsWith("/activity/")
  );
}

/** /login URL that returns to `next` after sign-in. */
export function loginUrl(next?: string): string {
  if (!next || next === "/" || next.startsWith("/login")) return "/login";
  return `/login?next=${encodeURIComponent(next)}`;
}

/** Validate a `next` param so it can only point inside this site. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  if (next.startsWith("/login")) return "/";
  return next;
}
