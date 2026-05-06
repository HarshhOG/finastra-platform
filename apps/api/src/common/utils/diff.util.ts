interface DiffField {
  field: string;
  before: string | null;
  after: string | null;
}

export function buildDiff(before: Record<string, unknown>, after: Record<string, unknown>) {
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return keys.reduce<DiffField[]>((accumulator, key) => {
    const previous = before[key];
    const next = after[key];

    if (JSON.stringify(previous) === JSON.stringify(next)) {
      return accumulator;
    }

    accumulator.push({
      field: key,
      before: previous == null ? null : JSON.stringify(previous),
      after: next == null ? null : JSON.stringify(next)
    });

    return accumulator;
  }, []);
}
