// Conversion rate: 30,000 Robux ≈ £85 GBP
const ROBUX_TO_GBP_RATE = 85 / 30000;

export function robuxToGBP(robux: number): number {
  return robux * ROBUX_TO_GBP_RATE;
}

export function formatGBP(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function formatRobux(amount: number): string {
  return `R$ ${amount.toLocaleString()}`;
}
