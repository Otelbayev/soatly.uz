interface Props { rows?: number; cols: number; }

export default function TableSkeleton({ rows = 5, cols }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}>
              <div
                className="h-4 rounded animate-pulse"
                style={{ background: 'var(--bg-surface2)', width: j === 0 ? '40px' : '80%' }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
