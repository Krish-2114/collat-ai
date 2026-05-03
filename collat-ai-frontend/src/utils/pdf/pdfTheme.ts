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
  /** Semantic palette for readable reports (Tailwind-aligned RGB). */
  semantic: {
    heading: [26, 26, 26] as [number, number, number],
    body: [74, 74, 74] as [number, number, number],
    muted: [106, 106, 106] as [number, number, number],
    cardBg: [249, 250, 251] as [number, number, number],
    track: [229, 231, 235] as [number, number, number],
    green: [16, 185, 129] as [number, number, number],
    greenDark: [6, 95, 70] as [number, number, number],
    greenBg: [209, 250, 229] as [number, number, number],
    amber: [245, 158, 11] as [number, number, number],
    amberDark: [146, 64, 14] as [number, number, number],
    amberBg: [254, 243, 199] as [number, number, number],
    red: [239, 68, 68] as [number, number, number],
    redDark: [153, 27, 27] as [number, number, number],
    redBg: [254, 226, 226] as [number, number, number],
    blue: [59, 130, 246] as [number, number, number],
    blueBg: [219, 234, 254] as [number, number, number],
  },
}
