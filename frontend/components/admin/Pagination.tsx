interface PaginationProps {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="outline-btn px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
      >←</button>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{page} / {pages}</span>
      <button
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        className="outline-btn px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
      >→</button>
    </div>
  );
}
