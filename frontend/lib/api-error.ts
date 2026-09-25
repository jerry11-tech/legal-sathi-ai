export function readApiError(data: unknown): string {
  const d = data as any;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d
      .map((item: any) =>
        typeof item === 'string'
          ? item
          : `${item?.msg || 'Validation error'}${item?.loc?.length ? ` (${item.loc.slice(1).join('.')})` : ''}`
      )
      .join('; ');
  }
  if (d && typeof d === 'object') {
    const direct = d.message || d.msg || d.detail;
    if (typeof direct === 'string') return direct;
    try {
      return JSON.stringify(d);
    } catch {
      return 'Something went wrong. Please try again.';
    }
  }
  return '';
}