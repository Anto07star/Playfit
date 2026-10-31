export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const numTransformer = {
  to: (v: number) => v,
  from: (v: string | null) => (v === null || v === undefined ? v : parseFloat(v)),
};
