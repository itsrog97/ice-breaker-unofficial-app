/** Password rules mirrored from the web "Change Password" dialog. */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'digit', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
] as const;

export function validatePasswordChange(current: string, next: string, confirm: string): string | null {
  if (!current || !next || !confirm) return 'Please fill in all fields.';
  const failed = PASSWORD_RULES.find((r) => !r.test(next));
  if (failed) return `New password needs: ${failed.label.toLowerCase()}.`;
  if (next !== confirm) return 'New passwords do not match.';
  if (next === current) return 'New password must be different from your current password.';
  return null;
}
