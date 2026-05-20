// Element soniga qarab eng yaxshi (balanslangan) ustun sonini tanlaydi.
// Maqsad: oxirgi qatorda yolg'iz qolgan element bo'lmasin.
export function balancedColumns(count: number): number {
  if (count <= 1) return 1;
  if (count <= 4) return count;          // 2, 3, 4
  if (count === 5) return 3;              // 3 + 2
  if (count === 6) return 3;              // 3 + 3
  // 7+: 6..4 oralig'idan eng balanslangan ustunni tanlaymiz
  let best = 4;
  let bestRem = -1;
  for (let c = 6; c >= 4; c--) {
    const rem = count % c;
    if (rem === 0) return c;              // mukammal
    if (rem > bestRem) {
      bestRem = rem;
      best = c;
    }
  }
  return best;
}
