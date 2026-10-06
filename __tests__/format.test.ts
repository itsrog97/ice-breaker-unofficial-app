import {
  badgeCount,
  cloudinaryThumb,
  dayLabel,
  fullName,
  initials,
  isValidEmail,
  labelFor,
  relativeTime,
  schoolYear,
  timeAgo,
  titleAtCompany,
} from '@/utils/format';

describe('format utils', () => {
  it('builds full names and ignores placeholder last names', () => {
    expect(fullName({ first_name: 'Ada', last_name: 'Lovelace' })).toBe('Ada Lovelace');
    expect(fullName({ first_name: 'Sam', last_name: '.' })).toBe('Sam');
    expect(fullName(null)).toBe('');
  });

  it('derives initials', () => {
    expect(initials({ first_name: 'ada', last_name: 'lovelace' })).toBe('AL');
    expect(initials({})).toBe('?');
  });

  it('formats school/year like the website', () => {
    expect(schoolYear('NBS', 2025)).toBe("NBS '25");
    expect(schoolYear(null, 2028)).toBe("'28");
    expect(schoolYear('NYU', null)).toBe('NYU');
    expect(schoolYear(null, null)).toBe('');
  });

  it('joins title and company', () => {
    expect(titleAtCompany('PM', 'Acme')).toBe('PM at Acme');
    expect(titleAtCompany(null, 'Acme')).toBe('Acme');
  });

  it('adds a cloudinary square transform once', () => {
    const url = 'https://res.cloudinary.com/x/image/upload/v1/icebreaker/profiles/u.jpg';
    expect(cloudinaryThumb(url, 96)).toBe('https://res.cloudinary.com/x/image/upload/c_fill,w_96,h_96,f_auto,q_auto/v1/icebreaker/profiles/u.jpg');
    const already = 'https://res.cloudinary.com/x/image/upload/c_fill,w_64,h_64/v1/a.jpg';
    expect(cloudinaryThumb(already, 96)).toBe(already);
    expect(cloudinaryThumb('https://example.com/a.png', 96)).toBe('https://example.com/a.png');
    expect(cloudinaryThumb(null, 96)).toBeUndefined();
  });

  it('formats relative times', () => {
    const now = new Date('2026-09-30T12:00:00Z');
    expect(relativeTime('2026-09-30T11:59:40Z', now)).toBe('now');
    expect(relativeTime('2026-09-30T11:55:00Z', now)).toBe('5m');
    expect(relativeTime('2026-09-30T09:00:00Z', now)).toBe('3h');
    expect(relativeTime('2026-09-28T12:00:00Z', now)).toBe('2d');
    expect(relativeTime('2026-09-01T12:00:00Z', now)).toBe('Sep 1');
    expect(relativeTime('garbage', now)).toBe('');
    expect(timeAgo('2026-09-30T09:00:00Z', now)).toBe('3h ago');
    expect(timeAgo('2026-09-29T11:00:00Z', now)).toBe('Yesterday');
  });

  it('labels days', () => {
    const now = new Date(2026, 8, 30, 12);
    expect(dayLabel(new Date(2026, 8, 30, 8).toISOString(), now)).toBe('Today');
    expect(dayLabel(new Date(2026, 8, 29, 8).toISOString(), now)).toBe('Yesterday');
  });

  it('maps option values to labels', () => {
    expect(labelFor('finding_a_new_role', [{ value: 'finding_a_new_role', label: 'Finding a new role' }])).toBe('Finding a new role');
    expect(labelFor('business_services')).toBe('Business Services');
  });

  it('validates emails', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
  });

  it('caps badge counts', () => {
    expect(badgeCount(0)).toBeNull();
    expect(badgeCount(5)).toBe('5');
    expect(badgeCount(150)).toBe('99+');
  });
});
