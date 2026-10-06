import { filtersToParams } from '@/api/endpoints';

describe('filtersToParams', () => {
  it('serialises filters the way the website does', () => {
    const qs = filtersToParams(
      { q: ' product ', industries: ['Consulting', 'AI / Machine Learning'], schools: [487, 33], sort_by: 'recent', help_others: [] },
      2,
    );
    const p = new URLSearchParams(qs);
    expect(p.get('q')).toBe('product');
    expect(p.get('industries')).toBe('Consulting,AI / Machine Learning');
    expect(p.get('schools')).toBe('487,33');
    expect(p.get('sort_by')).toBe('recent');
    expect(p.has('help_others')).toBe(false);
    expect(p.get('page')).toBe('2');
    expect(p.get('limit')).toBe('50');
  });
});
