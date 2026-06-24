export function numberInputValue(value: number) {
  return Number.isFinite(value) ? String(value) : "";
}

export function numberInputChange(value: string) {
  return value === "" ? Number.NaN : Number(value);
}
