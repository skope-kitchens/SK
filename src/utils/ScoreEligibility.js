// backend/utils/scoreEligibility.js

// ----------------- helpers -----------------
const extractNumber = (text) => {
  if (text == null) return null
  if (typeof text === 'number') return text
  const s = String(text)

  // k/K (e.g., 13.5k)
  const kMatch = s.match(/([\d,.]+)\s*k\b/i)
  if (kMatch) return Number(kMatch[1].replace(/,/g, '')) * 1000

  // lakhs: "12 lac", "12 lakh"
  const lacMatch = s.match(/([\d,.]+)\s*(lac|lakh|lacs|lakhs)\b/i)
  if (lacMatch) return Number(lacMatch[1].replace(/,/g, '')) * 100000

  // percent like '42%'
  const pctMatch = s.match(/([\d.]+)\s*%/)
  if (pctMatch) return Number(pctMatch[1])

  // generic numeric
  const match = s.match(/[\d.]+/g)
  if (!match) return null
  return Number(match[0].replace(/,/g, ''))
}

const averageNumbersInText = (text) => {
  if (text == null) return null
  const matches = String(text).match(/[\d.]+/g)
  if (!matches || matches.length === 0) return null
  const nums = matches.map((n) => Number(n))
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

const percentFromText = (text) => {
  if (text == null) return null
  if (typeof text === 'number') return text
  const s = String(text)
  const p = s.match(/([\d.]+)\s*%/)
  if (p) return Number(p[1])
  return extractNumber(s)
}

const isYes = (v) => {
  if (v == null) return false
  const s = String(v).trim().toLowerCase()
  return s === 'yes' || s === 'y' || s === 'true' || s === '1'
}

// ----------------- main scorer -----------------
export function computeEligibilityScore(submission = {}) {
  // ---------- GROUP A: MAPPING (3 Q) weight 10% ----------
  // 1) Brand strength -> select value
  const brandStrengthValue = String(submission.brandStrength || '').toLowerCase().trim()
  let brandStrengthScore = 2
  if (brandStrengthValue) {
    if (brandStrengthValue === 'new concept') brandStrengthScore = 1
    else if (brandStrengthValue === 'local') brandStrengthScore = 2
    else if (brandStrengthValue === 'national') brandStrengthScore = 3
    else if (brandStrengthValue === 'international') brandStrengthScore = 4
  }

  // 2) Social media (followers heuristic)
  const socialText = submission.socialMediaEngagement || ''
  let followers = null
  const kMatch = String(socialText).match(/([\d.]+)\s*k/i)
  if (kMatch) followers = Number(kMatch[1]) * 1000
  else followers = extractNumber(socialText)

  let socialScore = 2
  if (followers != null) {
    if (followers < 15000) socialScore = 1
    else if (followers < 25000) socialScore = 2
    else if (followers < 400000) socialScore = 3
    else socialScore = 4
  }

  // 3) DSP Ratings (avg across text)
  const avgDsp = averageNumbersInText(submission.dspRatings)
  let dspScore = 2
  if (avgDsp != null) {
    if (avgDsp < 4.0) dspScore = 1
    else if (avgDsp < 4.3) dspScore = 2
    else if (avgDsp < 4.6) dspScore = 3
    else dspScore = 4
  }

  const mappingRaw = brandStrengthScore + socialScore + dspScore // min=3, max=12
  const mappingMin = 3 * 1
  const mappingMax = 3 * 4
  const mappingNorm =
    mappingMax === mappingMin ? 0 : (mappingRaw - mappingMin) / (mappingMax - mappingMin)

  // ---------- GROUP B: OPERATING (10 Q) weight 50% ----------
  // 1) B&M Delivery Sales (per day). Accept monthly strings like "12 lac/month" -> /30
  let salesPerDay = null
  if (submission.bmDeliverySales != null) {
    const s = String(submission.bmDeliverySales).toLowerCase()
    const num = extractNumber(s)
    if (num != null) {
      if (s.includes('month') || s.includes('/month') || s.includes('per month') || s.includes('lac') || s.includes('lakh')) {
        salesPerDay = num / 30
      } else {
        salesPerDay = num
      }
    }
  }
  let salesScore = 2
  if (salesPerDay != null) {
    if (salesPerDay < 10000) salesScore = 1
    else if (salesPerDay < 15000) salesScore = 2
    else if (salesPerDay < 25000) salesScore = 3
    else salesScore = 4
  }

  // 2) Delivery AOV
  const aov = extractNumber(submission.deliveryAOV)
  let aovScore = 2
  if (aov != null) {
    if (aov < 250) aovScore = 1
    else if (aov < 300) aovScore = 2
    else if (aov < 400) aovScore = 3
    else aovScore = 4
  }

  // 3) COGS %
  const cogs = percentFromText(submission.cogsAnalysis)
  let cogsScore = 2
  if (cogs != null) {
    if (cogs > 32) cogsScore = 1
    else if (cogs >= 29) cogsScore = 2
    else if (cogs >= 26) cogsScore = 3
    else cogsScore = 4
  }

  // 4) DSP Rate % (prefer explicit percent field dspRatePercent, else try dspRateType text)
  const dspRateType = String(submission.dspRateType || '').toLowerCase().trim()
  const dspRate = extractNumber(submission.dspRatePercent ?? submission.dspRateType)
  let dspRateScore = 2
  if (dspRate != null) {
    if (dspRateType === 'exclusive') {
      // Exclusive: <18% = 4pts, 18-22% = 3pts, 22-26% = 2pts, >26% = 1pt
      if (dspRate < 18) dspRateScore = 4
      else if (dspRate < 22) dspRateScore = 3
      else if (dspRate <= 26) dspRateScore = 2
      else dspRateScore = 1
    } else if (dspRateType === 'nonexclusive' || dspRateType === 'non-exclusive') {
      // Non-exclusive: <21% = 4pts, 21-25% = 3pts, 25-29% = 2pts, >29% = 1pt
      if (dspRate < 21) dspRateScore = 4
      else if (dspRate < 25) dspRateScore = 3
      else if (dspRate <= 29) dspRateScore = 2
      else dspRateScore = 1
    } else {
      // Fallback for mixed or other types
      if (dspRate > 26) dspRateScore = 1
      else if (dspRate >= 22) dspRateScore = 2
      else if (dspRate >= 18) dspRateScore = 3
      else dspRateScore = 4
    }
  }

  // 5) Wastage (shelf life)
  const wastageText = String(submission.wastageRisk || '').toLowerCase()
  let wastageScore = 3
  if (wastageText.includes('month')) {
    const m = extractNumber(wastageText)
    if (m != null) {
      if (m < 1) wastageScore = 1
      else if (m < 3) wastageScore = 2
      else if (m < 3) wastageScore = 3
      else wastageScore = 4
    } else wastageScore = 3
  } else if (wastageText.includes('day')) {
    const d = extractNumber(wastageText)
    if (d != null) {
      if (d < 3) wastageScore = 1
      else if (d <= 7) wastageScore = 2
      else wastageScore = 3
    } else wastageScore = 2
  } else {
    if (wastageText.includes('low')) wastageScore = 4
    else if (wastageText.includes('medium')) wastageScore = 2
    else if (wastageText.includes('high')) wastageScore = 1
    else wastageScore = 3
  }

  // 6) Number of menu items
  const menuCount = extractNumber(submission.numberOfMenuItems)
  let menuScore = 2
  if (menuCount != null) {
    if (menuCount > 45) menuScore = 1
    else if (menuCount > 30) menuScore = 2
    else if (menuCount >= 15) menuScore = 3
    else menuScore = 4
  }

  // 7) Branded packaging count (or packagingType fallback)
  const packagingCount = extractNumber(submission.packagingCount ?? submission.packagingType)
  let packagingScore = 3
  if (packagingCount != null) {
    if (packagingCount > 7) packagingScore = 1
    else if (packagingCount > 4) packagingScore = 2
    else if (packagingCount >= 3) packagingScore = 3
    else packagingScore = 4
  } else {
    // if packagingType provided as 'branded'|'generic'|'mixed' handle that
    const pType = String(submission.packagingType || '').toLowerCase()
    if (pType === 'branded') packagingScore = 2
    else if (pType === 'mixed') packagingScore = 3
    else if (pType === 'generic') packagingScore = 4
  }

  // 8) Menu & supply chain complexity (checkbox count)
  const complexityArr = Array.isArray(submission.menuSupplyChainComplexity)
    ? submission.menuSupplyChainComplexity
    : submission.menuSupplyChainComplexity
    ? [submission.menuSupplyChainComplexity]
    : []

  const hasNone = complexityArr.includes('None of the above')
  const complexityCount =
    hasNone && complexityArr.length === 1
      ? 0
      : complexityArr.length || Number(submission.menuComplexityCount ?? extractNumber(submission.menuSupplyChainComplexity) ?? 0)

  let complexityScore = 4
  if (hasNone && complexityArr.length === 1) {
    complexityScore = 4
  } else if (!isNaN(complexityCount)) {
    if (complexityCount >= 3) complexityScore = 1 // all three selected
    else if (complexityCount === 2) complexityScore = 2
    else if (complexityCount === 1) complexityScore = 3
    else complexityScore = 4 // none selected
  }

  // 9) Launch CAPEX (pieces)
  // Scoring: 0 pieces = 4pts, 1 piece = 3pts, 2 pieces = 2pts, 3+ pieces = 1pt
  const capexPieces = extractNumber(submission.launchCapexPieces)
  let capexScore = 4
  if (capexPieces != null) {
    if (capexPieces === 0) capexScore = 4
    else if (capexPieces === 1) capexScore = 3
    else if (capexPieces === 2) capexScore = 2
    else capexScore = 1  // 3 or more pieces
  }

  // 10) Smallwares cost
  const smallwares = extractNumber(submission.smallwaresCost ?? submission.smallwaresNeeded)
  let smallwaresScore = 2
  if (smallwares != null) {
    if (smallwares > 25000) smallwaresScore = 1
    else if (smallwares >= 20000) smallwaresScore = 2
    else if (smallwares >= 15000) smallwaresScore = 3
    else smallwaresScore = 4
  }

  const operatingRaw =
    salesScore +
    aovScore +
    cogsScore +
    dspRateScore +
    wastageScore +
    menuScore +
    packagingScore +
    complexityScore +
    capexScore +
    smallwaresScore // min=10 max=40

  const operatingMin = 10 * 1
  const operatingMax = 10 * 4
  const operatingNorm =
    operatingMax === operatingMin ? 0 : (operatingRaw - operatingMin) / (operatingMax - operatingMin)

  // ---------- GROUP C: EXPANSION (3 Q) weight 20% ----------
  // Activation opportunities (checkbox count: 1..4 -> 1..4 pts)
  const activationArr = Array.isArray(submission.activationOpportunities)
    ? submission.activationOpportunities
    : submission.activationOpportunities
    ? [submission.activationOpportunities]
    : []
  const activationCount = activationArr.length
  let activationScore = 1
  if (activationCount >= 4) activationScore = 4
  else if (activationCount === 3) activationScore = 3
  else if (activationCount === 2) activationScore = 2
  else if (activationCount === 1) activationScore = 1

  // Domestic / international opportunities (checkbox count: 1..4 -> 1..4 pts)
  const domesticArr = Array.isArray(submission.domesticOpportunities)
    ? submission.domesticOpportunities
    : submission.domesticOpportunities
    ? [submission.domesticOpportunities]
    : []
  const domesticCount = domesticArr.length
  let domesticScore = 1
  if (domesticCount >= 4) domesticScore = 4
  else if (domesticCount === 3) domesticScore = 3
  else if (domesticCount === 2) domesticScore = 2
  else if (domesticCount === 1) domesticScore = 1

  const marketingNum = extractNumber(submission.dspMarketingCommitment)
  let marketingScore = 2
  if (marketingNum != null) {
    if (marketingNum > 150000) marketingScore = 1
    else if (marketingNum >= 100000) marketingScore = 2
    else if (marketingNum >= 75000) marketingScore = 3
    else marketingScore = 4
  }

  const expansionRaw = activationScore + domesticScore + marketingScore // min=3 max=12
  const expansionMin = 3 * 1
  const expansionMax = 3 * 4
  const expansionNorm =
    expansionMax === expansionMin ? 0 : (expansionRaw - expansionMin) / (expansionMax - expansionMin)

  // ---------- GROUP D: SPECIAL CONDITIONS (8 yes/no) weight 20% ----------
  const specialKeys = [
    'retrofittingNeeded',
    'additionalSpaceRequired',
    'procurementSuppliers',
    'multipleDeliveries',
    'additionalTrainingTravel',
    'launchTravelCosts',
    'specialReportingIntegrations',
    'equipmentAvailability'
  ]

  const specialValues = specialKeys.map((k) => {
    const v = submission[k]
    if (k === 'equipmentAvailability') {
      if (!v) return 1
      const s = String(v).toLowerCase()
      if (s.includes('purchase') || s.includes('not') || s.includes('no') || s.includes('need')) return 0
      return 1
    }
    return isYes(v) ? 0 : 1
  })

  const specialRaw = specialValues.reduce((a, b) => a + b, 0) // 0..8
  const specialMin = 0
  const specialMax = 8
  const specialNorm = specialMax === 0 ? 0 : specialRaw / specialMax

  // ---------- Combine weights ----------
  const weights = {
    mapping: 0.10,
    operating: 0.50,
    expansion: 0.20,
    special: 0.20
  }

  const combinedPercent =
    mappingNorm * weights.mapping +
    operatingNorm * weights.operating +
    expansionNorm * weights.expansion +
    specialNorm * weights.special // 0..1

  // Map combinedPercent 0..1 to 1..10 (linear)
  let totalScore1to10 = Number((combinedPercent * 9 + 1).toFixed(2))
  if (totalScore1to10 < 1) totalScore1to10 = 1
  if (totalScore1to10 > 10) totalScore1to10 = 10

  const meetsThreshold = totalScore1to10 >= 8.5
  const decision = meetsThreshold ? 'MOVE_FORWARD' : 'RE_EVALUATE'

  // Short reasoning (helpful bullets)
  const reasoning = []
  reasoning.push(
    `Brand strength: ${brandStrengthScore}/4, Social: ${socialScore}/4, DSP rating: ${dspScore}/4`
  )
  reasoning.push(
    `Operating subscore (normalized): ${(operatingNorm).toFixed(3)} — sales:${salesScore}, AOV:${aovScore}, COGS:${cogsScore}`
  )
  reasoning.push(`Special conditions: ${specialRaw}/${specialMax} positive flags`)

  return {
    brand_name: submission.brandName || null,
    section_scores: {
      mapping: { raw: mappingRaw, min: mappingMin, max: mappingMax, normalized: Number(mappingNorm.toFixed(4)) },
      operating: { raw: operatingRaw, min: operatingMin, max: operatingMax, normalized: Number(operatingNorm.toFixed(4)) },
      expansion: { raw: expansionRaw, min: expansionMin, max: expansionMax, normalized: Number(expansionNorm.toFixed(4)) },
      special_conditions: { raw: specialRaw, min: specialMin, max: specialMax, normalized: Number(specialNorm.toFixed(4)) }
    },
    total_score_1_to_10: totalScore1to10,
    meetsThreshold,
    decision,
    reasoning
  }
}
