/**
 * Calculates elapsed time in milliseconds from a start timestamp.
 *
 * @param startMs - Start timestamp in milliseconds
 * @returns Elapsed time in milliseconds
 */
export function time(startMs: number): number {
  return Date.now() - startMs;
}
