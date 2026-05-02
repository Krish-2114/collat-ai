/** Map pin: tip at bottom centre of the viewBox (Google-style teardrop). */
export function MapPinIcon({ className, large }: { className?: string; large?: boolean }) {
  const w = large ? 32 : 27
  const h = large ? 40 : 34
  return (
    <svg className={className} width={w} height={h} viewBox="0 0 24 36" aria-hidden>
      <path
        d="M12 1.5C6.8 1.5 2.5 5.8 2.5 11c0 4.2 2.1 8.3 5.6 13.1 2.3 3.3 4.4 5.9 4.4 5.9s2.1-2.6 4.4-5.9C20.4 19.3 22.5 15.2 22.5 11 22.5 5.8 18.2 1.5 12 1.5z"
        className="fill-primary-600"
        stroke="white"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="3.4" className="fill-white" />
      <ellipse cx="12" cy="33.2" rx="2.6" ry="1" className="fill-stone-900/16" />
    </svg>
  )
}
