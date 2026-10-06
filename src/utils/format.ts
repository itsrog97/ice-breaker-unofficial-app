/** Formatting helpers shared across screens. Pure functions — unit tested. */

export function fullName(p: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  if (!p) return '';
  return [p.first_name, p.last_name]
    .map((s) => (s ?? '').trim())
    .filter((s) => s && s !== '.')
    .join(' ');
}

export function initials(p: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  const f = p?.first_name?.trim()?.[0] ?? '';
  const l = p?.last_name?.trim()?.replace('.', '')?.[0] ?? '';
  return (f + l).toUpperCase() || '?';
}

/** "NBS '25" style label (school alias + class year). */
export function schoolYear(alias: string | null | undefined, year: number | null | undefined): string {
  if (!alias && !year) return '';
  if (!year) return alias ?? '';
  const yy = String(year).slice(-2);
  return alias ? `${alias} '${yy}` : `'${yy}`;
}

export function titleAtCompany(title?: string | null, company?: string | null): string {
  if (title && company) return `${title} at ${company}`;
  return title || company || '';
}

/**
 * Rewrites a Cloudinary upload URL to request a square crop at the given size,
 * the same transformation the web app uses (c_fill,w_N,h_N,f_auto,q_auto).
 */
export function cloudinaryThumb(url: string | null | undefined, size: number): string | undefined {
  if (!url) return undefined;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/c_[^/]+\//.test(url)) return url;
  const px = Math.round(size);
  return url.replace('/upload/', `/upload/c_fill,w_${px},h_${px},f_auto,q_auto/`);
}

/** Relative time like the web app: "now", "5m", "3h", "2d", "Sep 28". */
export function relativeTime(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Longer variant used in notifications: "3h ago", "Yesterday". */
export function timeAgo(iso: string | null | undefined, now: Date = new Date()): string {
  const r = relativeTime(iso, now);
  if (!r || r === 'now') return r ? 'just now' : '';
  if (/^\d+[mh]$/.test(r)) return `${r} ago`;
  if (r === '1d') return 'Yesterday';
  if (/^\d+d$/.test(r)) return `${r} ago`;
  return r;
}

export function clockTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function dayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, now)) return 'Today';
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (same(d, y)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Maps option values (e.g. "finding_a_new_role") to labels using a lookup; falls back to humanised text. */
export function labelFor(value: string, options?: { value: string; label: string }[]): string {
  const hit = options?.find((o) => o.value === value);
  if (hit) return hit.label;
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function badgeCount(n: number | null | undefined): string | null {
  if (!n || n <= 0) return null;
  return n > 99 ? '99+' : String(n);
}
