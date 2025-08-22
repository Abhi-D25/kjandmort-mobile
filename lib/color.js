import { scaleLinear } from 'd3-scale'

// King Julien inspired color palette - playful lilac to lavender gradient
export const CUISINE_COLORS = [
  '#FFFFFF',    // 0 visits - white
  '#F3E8FF',    // 1 visit - very light purple
  '#E9D5FF',    // 2-3 visits - light lavender  
  '#D6BCFA',    // 4-5 visits - medium lavender
  '#C084FC',    // 6-8 visits - purple
  '#A855F7',    // 9+ visits - rich purple
]

// Dynamic thresholds based on max visit count
export const getColorThresholds = (maxCount) => {
  if (maxCount <= 1) return [0, 1]
  if (maxCount <= 3) return [0, 1, 2, 3]
  if (maxCount <= 8) return [0, 1, 3, 5, 8]
  
  // For higher counts, create dynamic thresholds
  const step = Math.ceil(maxCount / 5)
  return [0, 1, step, step * 2, step * 3, maxCount]
}

// Get color for visit count
export const getColorForCount = (count, maxCount) => {
  if (count === 0) return CUISINE_COLORS[0]
  
  const thresholds = getColorThresholds(maxCount)
  const colorScale = scaleLinear()
    .domain(thresholds)
    .range(CUISINE_COLORS.slice(0, thresholds.length))
  
  return colorScale(count)
}

// Get color intensity (0-1) for country
export const getColorIntensity = (count, maxCount) => {
  if (count === 0) return 0
  if (maxCount === 0) return 0
  return Math.min(count / maxCount, 1)
}

// Theme colors for the app
export const THEME_COLORS = {
  primary: '#A855F7',      // Royal purple (King Julien)
  secondary: '#F59E0B',    // Gold/amber accent
  success: '#10B981',      // Emerald green
  background: '#FAFAFA',   // Light gray background
  card: '#FFFFFF',         // White cards
  text: '#1F2937',         // Dark gray text
  muted: '#6B7280',        // Muted gray text
}