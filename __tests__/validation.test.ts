import { validatePasswordChange } from '@/utils/validation';

describe('validatePasswordChange', () => {
  it('requires all fields', () => {
    expect(validatePasswordChange('', 'Abcdefg1', 'Abcdefg1')).toMatch(/fill in all/);
  });
  it('enforces the web password rules', () => {
    expect(validatePasswordChange('Old12345', 'Ab1', 'Ab1')).toMatch(/8 characters/);
    expect(validatePasswordChange('Old12345', 'abcdefg1', 'abcdefg1')).toMatch(/uppercase/);
    expect(validatePasswordChange('Old12345', 'ABCDEFG1', 'ABCDEFG1')).toMatch(/lowercase/);
    expect(validatePasswordChange('Old12345', 'Abcdefgh', 'Abcdefgh')).toMatch(/number/);
  });
  it('requires matching, different passwords', () => {
    expect(validatePasswordChange('Old12345', 'Abcdefg1', 'Abcdefg2')).toMatch(/do not match/);
    expect(validatePasswordChange('Abcdefg1', 'Abcdefg1', 'Abcdefg1')).toMatch(/different/);
    expect(validatePasswordChange('Old12345', 'Abcdefg1', 'Abcdefg1')).toBeNull();
  });
});
