/** A4 PDF theme — orange typography (Collat.AI primary), minimal rules only. */
export const PDF = {
  margin: 16,
  contentW: 210 - 32,
  pageH: 297,
  footerY: 286,
  /** Orange accent (Tailwind primary / orange-600). */
  primary500: [249, 115, 22] as [number, number, number],
  primary600: [234, 88, 12] as [number, number, number],
  primary700: [194, 65, 12] as [number, number, number],
  primary800: [154, 52, 18] as [number, number, number],
  primary900: [124, 45, 18] as [number, number, number],
  primary100: [255, 237, 213] as [number, number, number],
  primary50: [255, 247, 237] as [number, number, number],
  /** Divider lines (orange-200). */
  rule: [254, 215, 170] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}
