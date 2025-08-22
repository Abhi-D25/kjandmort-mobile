import { scaleQuantize } from 'd3-scale'

// Feature flag for globe outlines
export const GLOBE_OUTLINES_ENABLED = true

// Updated King Julien inspired color palette - darker scale for better visibility
export const CUISINE_HEAT_PALETTE = [
  '#D6B4F0',  // 1 visit - medium lavender (darker for visibility)
  '#C799EC',  // 2-3 visits - medium purple
  '#B87DE7',  // 4-5 visits - deeper purple
  '#A962E3',  // 6-8 visits - rich purple
  '#9A47DF',  // 9-12 visits - deep purple
  '#8B2CDB',  // 13+ visits - very deep purple
]

// Neutral stroke color for unvisited countries
export const NEUTRAL_STROKE = '#D1D5DB'

// Get heat scale based on max count
export const getHeatScale = (maxCount) => {
  if (maxCount <= 1) {
    return (count) => count === 0 ? '#FFFFFF' : CUISINE_HEAT_PALETTE[0]
  }
  
  // Create quantized scale
  const scale = scaleQuantize()
    .domain([1, maxCount])
    .range(CUISINE_HEAT_PALETTE)
  
  return (count) => {
    if (count === 0) return '#FFFFFF'
    return scale(count)
  }
}

// Get color for visit count with improved logic
export const colorForCount = (count, maxCount) => {
  if (count === 0) return '#FFFFFF'
  
  const scale = getHeatScale(maxCount)
  return scale(count)
}

// Alternative export with different name for compatibility
export const getColorForCount = colorForCount

// Get stroke color for globe outlines
export const getStrokeColor = (count, maxCount) => {
  if (count === 0) return NEUTRAL_STROKE
  return colorForCount(count, maxCount)
}

// Get color thresholds for legend display
export const getColorThresholds = (maxCount) => {
  if (maxCount <= 1) return [0, 1]
  if (maxCount <= 6) return [0, 1, 2, 3, 4, 5, maxCount].filter(n => n <= maxCount)
  
  // For higher counts, create meaningful breakpoints
  const breakpoints = [1]
  const step = Math.ceil(maxCount / 5)
  
  for (let i = 1; i < 5; i++) {
    const point = Math.min(step * (i + 1), maxCount)
    if (point > breakpoints[breakpoints.length - 1]) {
      breakpoints.push(point)
    }
  }
  
  if (breakpoints[breakpoints.length - 1] < maxCount) {
    breakpoints.push(maxCount)
  }
  
  return [0, ...breakpoints]
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