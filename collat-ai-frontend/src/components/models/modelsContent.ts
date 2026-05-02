export type ModelVisualVariant = 'valueRange' | 'liquidityRing' | 'riskChecklist'

export type ModelWorkspace = {
  path: '/valuate' | '/liquidity' | '/fraud'
  label: string
}

export type ModelCardContent = {
  id: string
  title: string
  simpleDescription: string
  predicts: string[]
  inputs: string[]
  exampleLines: readonly { label: string; value: string }[]
  workspace: ModelWorkspace
  visual: ModelVisualVariant
  /** Shown when “View Details” scroll target — plain language. */
  details: readonly string[]
  /** Shown when “See Key Factors” — short, non-technical. */
  keyFactors: readonly string[]
  /** Dummy sample lines for “Try Sample Input”. */
  sampleSummary: readonly { label: string; value: string }[]
}

export const MODEL_CARDS: readonly ModelCardContent[] = [
  {
    id: 'value-engine',
    title: 'Value Engine',
    simpleDescription:
      'Tells you what a property is worth today, what it could sell for in a worst-case scenario, and how confident the estimate is.',
    predicts: ['Market value', 'Distress value', 'Price range', 'Confidence level'],
    inputs: [
      'City and locality',
      'Property type',
      'Size and age',
      'Floor and how the home is used',
      'Local area quality signals',
    ],
    exampleLines: [
      { label: 'Market value', value: '₹1.45 Cr – ₹1.62 Cr' },
      { label: 'Distress value', value: '₹98L – ₹1.05 Cr' },
      { label: 'Confidence', value: '92%' },
    ],
    workspace: { path: '/valuate', label: 'Valuation' },
    visual: 'valueRange',
    details: [
      'You get a fair range instead of a single guess. The “worst case” number helps if the property ever had to be sold quickly.',
      'Confidence tells you how much to trust the range for that specific property and location.',
    ],
    keyFactors: ['Location and neighbourhood', 'Size compared with similar homes', 'Age and condition of the building', 'What similar homes sold for nearby'],
    sampleSummary: [
      { label: 'City', value: 'Mumbai' },
      { label: 'Type', value: 'Apartment' },
      { label: 'Area', value: '1,050 sqft' },
      { label: 'Age', value: '8 years' },
    ],
  },
  {
    id: 'liquidity-engine',
    title: 'Liquidity Engine',
    simpleDescription: 'Shows how easy it is to sell the property and how long it might take.',
    predicts: ['Ease of selling', 'Time to sell', 'Liquidity score'],
    inputs: [
      'City and locality',
      'Property type',
      'Size and age',
      'How hot or quiet the local market is',
      'Local area quality signals',
    ],
    exampleLines: [
      { label: 'Score', value: '87 / 100' },
      { label: 'Estimated sale time', value: '~42 days' },
    ],
    workspace: { path: '/liquidity', label: 'Liquidity' },
    visual: 'liquidityRing',
    details: [
      'A higher score usually means more buyers and quicker sales in that area.',
      'The time estimate is a guide — real timing still depends on pricing and paperwork.',
    ],
    keyFactors: ['How many buyers want this type of home', 'How long similar listings stay on the market', 'Property type and location'],
    sampleSummary: [
      { label: 'City', value: 'Bangalore' },
      { label: 'Type', value: 'Apartment' },
      { label: 'Area', value: '920 sqft' },
      { label: 'Score (illustrative)', value: '87 / 100' },
    ],
  },
  {
    id: 'risk-engine',
    title: 'Risk Engine',
    simpleDescription: 'Checks if there are any risks, mismatches, or legal issues with the property.',
    predicts: ['Risk level', 'Ownership match', 'Legal issues'],
    inputs: [
      'City and locality',
      'Property type',
      'Size and basic facts',
      'Ownership and legal data',
      'Official records where available',
    ],
    exampleLines: [
      { label: 'Risk level', value: 'Low' },
      { label: 'Ownership', value: 'Verified' },
      { label: 'Legal issues', value: 'Minimal' },
    ],
    workspace: { path: '/fraud', label: 'Fraud check' },
    visual: 'riskChecklist',
    details: [
      'This is a safety check, not a final legal opinion. It highlights things worth a closer look.',
      'If something flags, it often means “ask your advisor or verify documents” — not an automatic problem.',
    ],
    keyFactors: ['Whether key facts line up across sources', 'Signals that often appear when something is off', 'Basic legal and ownership checks'],
    sampleSummary: [
      { label: 'City', value: 'Pune' },
      { label: 'Type', value: 'Apartment' },
      { label: 'Flags (illustrative)', value: 'None' },
      { label: 'Overall', value: 'Low risk' },
    ],
  },
] as const
