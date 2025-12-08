import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { authUtils } from '../utils/auth'
import api from '../utils/api';

const EligibilityForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    // Mapping
    brandName: '',
    locationMapping: '',
    brandStrength: '',
    socialMediaEngagement: '',
    dspRatings: '',

    // Operating
    bmDeliverySales: '',
    deliveryAOV: '',
    cogsAnalysis: '',
    dspRateType: '',
    dspRatePercent: '',
    wastageRisk: '',
    numberOfMenuItems: '',
    packagingType: '',
    menuSupplyChainComplexity: [],
    launchCapex: '',
    launchCapexPieces: '',
    smallwaresNeeded: '',
    smallwaresCost: '',

    // Expansion
    activationOpportunities: [],
    domesticOpportunities: [],
    dspMarketingCommitment: '',

    // Special Conditions
    retrofittingNeeded: '',
    additionalSpaceRequired: '',
    procurementSuppliers: '',
    multipleDeliveries: '',
    additionalTrainingTravel: '',
    launchTravelCosts: '',
    specialReportingIntegrations: '',
    equipmentAvailability: '',

    // Additional Considerations
    skopePartnerRelationships: '',
    sublicensingPotential: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCheckboxChange = (name, option) => {
    setFormData(prev => {
      const current = Array.isArray(prev[name]) ? prev[name] : []
      const exists = current.includes(option)

      // exclusive "None of the above" handling
      if (option === 'None of the above') {
        const updated = exists ? [] : ['None of the above']
        return { ...prev, [name]: updated }
      }

      // if selecting a regular option, remove "None of the above" if present
      const filtered = current.filter(item => item !== 'None of the above')
      const updated = exists
        ? filtered.filter(item => item !== option)
        : [...filtered, option]

      return { ...prev, [name]: updated }
    })

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    // Mapping
    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required'
    }
    // Location mapping is optional
    if (!formData.brandStrength) {
      newErrors.brandStrength = 'Please select brand strength'
    }
    if (!formData.socialMediaEngagement.trim()) {
      newErrors.socialMediaEngagement = 'Please describe social media engagement'
    }
    if (!formData.dspRatings.trim()) {
      newErrors.dspRatings = 'Average DSP ratings are required'
    }

    // Operating
    if (!formData.bmDeliverySales || !formData.bmDeliverySales.trim()) {
      newErrors.bmDeliverySales = 'B&M delivery sales per storefront per day are required'
    }
    if (!formData.deliveryAOV) {
      newErrors.deliveryAOV = 'Delivery AOV is required'
    }
    if (!formData.cogsAnalysis.trim()) {
      newErrors.cogsAnalysis = 'Please describe COGS / theoretical food cost'
    }
    if (!formData.dspRateType) {
      newErrors.dspRateType = 'Please specify DSP rate type'
    }
    if ((formData.dspRateType === 'exclusive' || formData.dspRateType === 'nonExclusive') && !formData.dspRatePercent) {
      newErrors.dspRatePercent = 'Please enter the DSP rate percentage'
    }
    if (!formData.wastageRisk) {
      newErrors.wastageRisk = 'Please select wastage risk level'
    }
    if (!formData.numberOfMenuItems) {
      newErrors.numberOfMenuItems = 'Number of menu items (SKUs) is required'
    }
    if (!formData.packagingType) {
      newErrors.packagingType = 'Please select packaging type'
    }
    if (!formData.menuSupplyChainComplexity || formData.menuSupplyChainComplexity.length === 0) {
      newErrors.menuSupplyChainComplexity = 'Please select at least one menu/supply chain complexity'
    }
    if (formData.launchCapex !== 'yes' && formData.launchCapex !== 'no') {
      newErrors.launchCapex = 'Please specify if additional kitchen equipment is needed'
    }
    if (formData.launchCapex === 'yes') {
      if (formData.launchCapexPieces === '' || formData.launchCapexPieces == null) {
        newErrors.launchCapexPieces = 'Please select number of pieces required'
      }
    }
    if (!formData.smallwaresCost.trim()) {
      newErrors.smallwaresCost = 'Please provide smallwares cost'
    }

    // Expansion
    if (!formData.activationOpportunities || formData.activationOpportunities.length === 0) {
      newErrors.activationOpportunities = 'Please select at least one activation opportunity'
    }
    if (!formData.domesticOpportunities || formData.domesticOpportunities.length === 0) {
      newErrors.domesticOpportunities = 'Please select at least one domestic/international opportunity'
    }
    if (!formData.dspMarketingCommitment.trim()) {
      newErrors.dspMarketingCommitment = 'Please describe DSP marketing commitment'
    }

    // Special Conditions
    if (!formData.retrofittingNeeded) {
      newErrors.retrofittingNeeded = 'Please specify whether retrofits are needed'
    }
    if (!formData.additionalSpaceRequired) {
      newErrors.additionalSpaceRequired = 'Please specify if additional space/storage is needed'
    }
    if (!formData.procurementSuppliers) {
      newErrors.procurementSuppliers = 'Please specify if procurement/suppliers are needed'
    }
    if (!formData.multipleDeliveries) {
      newErrors.multipleDeliveries = 'Please specify if multiple deliveries per day are needed'
    }
    if (!formData.additionalTrainingTravel) {
      newErrors.additionalTrainingTravel = 'Please specify if additional training/travel is required'
    }
    if (!formData.launchTravelCosts) {
      newErrors.launchTravelCosts = 'Please specify if brand representatives will come for training'
    }
    if (!formData.specialReportingIntegrations) {
      newErrors.specialReportingIntegrations = 'Please specify if special reporting/integrations are needed'
    }
    if (!formData.equipmentAvailability.trim()) {
      newErrors.equipmentAvailability = 'Please describe equipment availability / purchase needs'
    }

    // Additional Considerations
    if (!formData.skopePartnerRelationships.trim()) {
      newErrors.skopePartnerRelationships = 'Please describe SKOPE partner relationships'
    }
    // Sublicensing potential is optional

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })

    const user = authUtils.getUser()
    const payload = {
      ...formData,
      submittedBy: user?.id || null,
      submittedByEmail: user?.email || null
    }

    try {
      const response = await api.post('/api/eligibility', payload)

      // Store score result, AI summary, and brand name from backend response
      try {
        localStorage.setItem('selectedBrandName', formData.brandName.trim())
        localStorage.setItem('eligibilityScore', JSON.stringify({
          score: response.data.score,
          decision: response.data.decision,
          meetsThreshold: response.data.meetsThreshold,
          sectionScores: response.data.sectionScores,
          brandName: formData.brandName.trim(),
          aiAnalysisSummary: response.data.aiAnalysisSummary
        }))
      } catch (storageError) {
        console.error('Unable to cache score or brand name', storageError)
      }

      setStatus({ type: 'success', message: 'Submission received! Analyzing...' })
      setTimeout(() => navigate('/analyzing'), 600)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Unable to submit the eligibility form. Please try again.'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Brand Evaluation – Eligibility Form
            </h1>
            <p className="text-gray-600">
              Please provide detailed information about the brand for evaluation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {status.message && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  status.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {status.message}
              </div>
            )}
            {/* Mapping Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Mapping
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    className={`input-field ${errors.brandName ? 'border-red-500' : ''}`}
                    placeholder="Enter brand name"
                  />
                  {errors.brandName && (
                    <p className="mt-1 text-sm text-red-600">{errors.brandName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Enter the locations of all outlets and your brand’s headquarters. *
                  </label>
                  <textarea
                    name="locationMapping"
                    value={formData.locationMapping}
                    onChange={handleChange}
                    rows="3"
                    className={`input-field ${errors.locationMapping ? 'border-red-500' : ''}`}
                    placeholder="Review/Mapping of B&Ms compared to kitchens in Ecosystem - A pre-requisite"
                  />
                  {errors.locationMapping && (
                    <p className="mt-1 text-sm text-red-600">{errors.locationMapping}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  How would you classify your brand's market reach? *
                  </label>
                  <select
                    name="brandStrength"
                    value={formData.brandStrength}
                    onChange={handleChange}
                    className={`input-field ${errors.brandStrength ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select</option>
                    <option value="new concept">New Concept</option>
                    <option value="local">Local</option>
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                  {errors.brandStrength && (
                    <p className="mt-1 text-sm text-red-600">{errors.brandStrength}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    How large is your brand's reach on social media platforms? *
                  </label>
                  <input
                    type="text"
                    name="socialMediaEngagement"
                    value={formData.socialMediaEngagement}
                    onChange={handleChange}
                    className={`input-field ${errors.socialMediaEngagement ? 'border-red-500' : ''}`}
                    placeholder="e.g., 15000 followers, 25k followers (combined facebook + instagram + ..)"
                  />
                  {errors.socialMediaEngagement && (
                    <p className="mt-1 text-sm text-red-600">{errors.socialMediaEngagement}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  What are the average Delivery Apps ratings(DSP ratings)? *
                  </label>
                  <input
                    type="text"
                    name="dspRatings"
                    value={formData.dspRatings}
                    onChange={handleChange}
                    className={`input-field ${errors.dspRatings ? 'border-red-500' : ''}`}
                    placeholder="e.g., 4.3 on Swiggy, 4.1 on Zomato"
                  />
                  {errors.dspRatings && (
                    <p className="mt-1 text-sm text-red-600">{errors.dspRatings}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Operating Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Operating
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    How much does each outlet earn daily from delivery orders? *
                  </label>
                  <input
                    type="text"
                    name="bmDeliverySales"
                    value={formData.bmDeliverySales}
                    onChange={handleChange}
                    className={`input-field ${errors.bmDeliverySales ? 'border-red-500' : ''}`}
                    placeholder="e.g., 15000, 12 lac/month, 50000 per day"
                  />
                  {errors.bmDeliverySales && (
                    <p className="mt-1 text-sm text-red-600">{errors.bmDeliverySales}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  What is the average money spent in one order(Average Order Value)? *
                  </label>
                  <input
                    type="number"
                    name="deliveryAOV"
                    value={formData.deliveryAOV}
                    onChange={handleChange}
                    min="0"
                    className={`input-field ${errors.deliveryAOV ? 'border-red-500' : ''}`}
                    placeholder="e.g., 450"
                  />
                  {errors.deliveryAOV && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryAOV}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  What is your estimated COGS % (including packaging) for your current menu? *
                  </label>
                  <textarea
                    name="cogsAnalysis"
                    value={formData.cogsAnalysis}
                    onChange={handleChange}
                    rows="1"
                    className={`input-field ${errors.cogsAnalysis ? 'border-red-500' : ''}`}
                    placeholder="e.g., 28%"
                  />
                  {errors.cogsAnalysis && (
                    <p className="mt-1 text-sm text-red-600">{errors.cogsAnalysis}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  What type of delivery app commission structure do you follow? *
                  </label>
                  <select
                    name="dspRateType"
                    value={formData.dspRateType}
                    onChange={handleChange}
                    className={`input-field ${errors.dspRateType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select type</option>
                    <option value="exclusive">Exclusive (no DSP rate caps)</option>
                    <option value="nonExclusive">Non-Exclusive</option>
                    <option value="mixed">Mixed / Market dependent</option>
                  </select>
                  {errors.dspRateType && (
                    <p className="mt-1 text-sm text-red-600">{errors.dspRateType}</p>
                  )}
                  {(formData.dspRateType === 'exclusive' || formData.dspRateType === 'nonExclusive') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                      What is your delivery app commission percentage? *
                      </label>
                      <input
                        type="text"
                        name="dspRatePercent"
                        value={formData.dspRatePercent}
                        onChange={handleChange}
                        className={`input-field ${errors.dspRatePercent ? 'border-red-500' : ''}`}
                        placeholder="e.g. 25%"
                      />
                      {errors.dspRatePercent && (
                        <p className="mt-1 text-sm text-red-600">{errors.dspRatePercent}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Wastage Risk (Shelf Life & Ingredients) *
                  </label>
                  <select
                    name="wastageRisk"
                    value={formData.wastageRisk}
                    onChange={handleChange}
                    className={`input-field ${errors.wastageRisk ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select level</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {errors.wastageRisk && (
                    <p className="mt-1 text-sm text-red-600">{errors.wastageRisk}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Number of Menu Items (SKUs Required) *
                    </label>
                    <input
                      type="number"
                      name="numberOfMenuItems"
                      value={formData.numberOfMenuItems}
                      onChange={handleChange}
                      min="0"
                      className={`input-field ${errors.numberOfMenuItems ? 'border-red-500' : ''}`}
                      placeholder="e.g., 35"
                    />
                    {errors.numberOfMenuItems && (
                      <p className="mt-1 text-sm text-red-600">{errors.numberOfMenuItems}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Packaging Type *
                    </label>
                    <select
                      name="packagingType"
                      value={formData.packagingType}
                      onChange={handleChange}
                      className={`input-field ${errors.packagingType ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select packaging</option>
                      <option value="branded">Branded Packaging Required</option>
                      <option value="generic">Generic Packaging OK</option>
                      <option value="mixed">Mix of Branded & Generic</option>
                    </select>
                    {errors.packagingType && (
                      <p className="mt-1 text-sm text-red-600">{errors.packagingType}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Does your menu need extra staff, special ingredients, or minimum order sizes? *
                  </label>
                  <div className="space-y-2">
                    {[
                      'Need Extra Staff',
                      'Special Ingredients',
                      'Minimum Order Size',
                      'None of the above',
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.menuSupplyChainComplexity.includes(option)}
                          onChange={() => handleCheckboxChange('menuSupplyChainComplexity', option)}
                          disabled={
                            option !== 'None of the above' &&
                            formData.menuSupplyChainComplexity.includes('None of the above')
                          }
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 disabled:opacity-60"
                        />
                        <span className="text-sm text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.menuSupplyChainComplexity && (
                    <p className="mt-1 text-sm text-red-600">{errors.menuSupplyChainComplexity}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                    Do we need to buy additional kitchen equipment for your brand? *
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="launchCapex"
                          value="no"
                          checked={formData.launchCapex === 'no'}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-900">No</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="launchCapex"
                          value="yes"
                          checked={formData.launchCapex === 'yes'}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-900">Yes</span>
                      </label>
                    </div>
                    {errors.launchCapex && (
                      <p className="mt-1 text-sm text-red-600">{errors.launchCapex}</p>
                    )}

                    {formData.launchCapex === 'yes' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Number of pieces required *
                        </label>
                        <select
                          name="launchCapexPieces"
                          value={formData.launchCapexPieces}
                          onChange={handleChange}
                          className={`input-field ${errors.launchCapexPieces ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select</option>
                          <option value="0">0 pieces</option>
                          <option value="1">1 piece</option>
                          <option value="2">2 pieces</option>
                          <option value="3">3 pieces</option>
                          <option value="4">4 or more pieces</option>
                        </select>
                        {errors.launchCapexPieces && (
                          <p className="mt-1 text-sm text-red-600">{errors.launchCapexPieces}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                    What is the cost of additional smallwares required beyond current vessel use? *
                    </label>
                    <input
                      type="text"
                      name="smallwaresCost"
                      value={formData.smallwaresCost}
                      onChange={handleChange}
                      className={`input-field ${errors.smallwaresCost ? 'border-red-500' : ''}`}
                      placeholder="e.g., 5000, 12k, 30,000"
                    />
                    {errors.smallwaresCost && (
                      <p className="mt-1 text-sm text-red-600">{errors.smallwaresCost}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expansion Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Expansion
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Which of the following activation opportunities apply to your brand? (Select all that apply) *
                  </label>
                  <div className="space-y-2">
                    {[
                      'Strong revenue/turnover potential',
                      'Associated with a larger partner ecosystem',
                      'White space / new market opportunity',
                      'Active presence in current markets'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.activationOpportunities.includes(option)}
                          onChange={() => handleCheckboxChange('activationOpportunities', option)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.activationOpportunities && (
                    <p className="mt-1 text-sm text-red-600">{errors.activationOpportunities}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  Which of the following Domestic/International opportunities apply to your brand? (Select all that apply)? *
                  </label>
                  <div className="space-y-2">
                    {[
                      'Existing International Presence',
                      'Available Supply Chain',
                      'Marketing Commitment',
                      'International Brand Equity'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.domesticOpportunities.includes(option)}
                          onChange={() => handleCheckboxChange('domesticOpportunities', option)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.domesticOpportunities && (
                    <p className="mt-1 text-sm text-red-600">{errors.domesticOpportunities}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  What is your monthly marketing budget for delivery apps? *
                  </label>
                  <input
                    type="text"
                    name="dspMarketingCommitment"
                    value={formData.dspMarketingCommitment}
                    onChange={handleChange}
                    className={`input-field ${errors.dspMarketingCommitment ? 'border-red-500' : ''}`}
                    placeholder="e.g., 15000, 50k, 1.5 lac"
                  />
                  {errors.dspMarketingCommitment && (
                    <p className="mt-1 text-sm text-red-600">{errors.dspMarketingCommitment}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Conditions Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Special Conditions
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                  Do we need to change anything in our kitchen setup? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="retrofittingNeeded"
                        value="no"
                        checked={formData.retrofittingNeeded === 'no'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="retrofittingNeeded"
                        value="yes"
                        checked={formData.retrofittingNeeded === 'yes'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                  </div>
                  {errors.retrofittingNeeded && (
                    <p className="mt-1 text-sm text-red-600">{errors.retrofittingNeeded}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Additional Space / Storage Needed? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="additionalSpaceRequired"
                        value="no"
                        checked={formData.additionalSpaceRequired === 'no'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                    name="additionalSpaceRequired"
                        value="yes"
                        checked={formData.additionalSpaceRequired === 'yes'}
                    onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                  </div>
                  {errors.additionalSpaceRequired && (
                    <p className="mt-1 text-sm text-red-600">{errors.additionalSpaceRequired}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Procurement / Suppliers Needed? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="procurementSuppliers"
                        value="no"
                        checked={formData.procurementSuppliers === 'no'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                    name="procurementSuppliers"
                        value="yes"
                        checked={formData.procurementSuppliers === 'yes'}
                    onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                  </div>
                  {errors.procurementSuppliers && (
                    <p className="mt-1 text-sm text-red-600">{errors.procurementSuppliers}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Multiple Deliveries Needed per Day? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="multipleDeliveries"
                        value="no"
                        checked={formData.multipleDeliveries === 'no'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="multipleDeliveries"
                        value="yes"
                        checked={formData.multipleDeliveries === 'yes'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                  </div>
                  {errors.multipleDeliveries && (
                    <p className="mt-1 text-sm text-red-600">{errors.multipleDeliveries}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Additional Training / Travel Required for Launch? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="additionalTrainingTravel"
                        value="no"
                        checked={formData.additionalTrainingTravel === 'no'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                    name="additionalTrainingTravel"
                        value="yes"
                        checked={formData.additionalTrainingTravel === 'yes'}
                    onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                  </div>
                  {errors.additionalTrainingTravel && (
                    <p className="mt-1 text-sm text-red-600">{errors.additionalTrainingTravel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Will brand representatives come for training? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="launchTravelCosts"
                        value="no"
                        checked={formData.launchTravelCosts === 'no'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                    name="launchTravelCosts"
                        value="yes"
                        checked={formData.launchTravelCosts === 'yes'}
                    onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                  </div>
                  {errors.launchTravelCosts && (
                    <p className="mt-1 text-sm text-red-600">{errors.launchTravelCosts}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Special Reporting / Integrations Needed? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="specialReportingIntegrations"
                        value="no"
                        checked={formData.specialReportingIntegrations === 'no'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-900">No</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                    name="specialReportingIntegrations"
                        value="yes"
                        checked={formData.specialReportingIntegrations === 'yes'}
                    onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                  </div>
                  {errors.specialReportingIntegrations && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialReportingIntegrations}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Equipment within Skope Inventory? *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="equipmentAvailability"
                        value="yes"
                        checked={formData.equipmentAvailability === 'yes'}
                        onChange={handleChange}
                        className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 ${errors.equipmentAvailability ? 'border-red-500' : ''}`}
                      />
                      <span className="text-sm text-gray-900">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                    name="equipmentAvailability"
                        value="no"
                        checked={formData.equipmentAvailability === 'no'}
                    onChange={handleChange}
                        className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 ${errors.equipmentAvailability ? 'border-red-500' : ''}`}
                  />
                      <span className="text-sm text-gray-900">No, needs purchase</span>
                    </label>
                  </div>
                  {errors.equipmentAvailability && (
                    <p className="mt-1 text-sm text-red-600">{errors.equipmentAvailability}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Considerations Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Additional Considerations
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    SKOPE Partner Relationships *
                  </label>
                  <textarea
                    name="skopePartnerRelationships"
                    value={formData.skopePartnerRelationships}
                    onChange={handleChange}
                    rows="3"
                    className={`input-field ${errors.skopePartnerRelationships ? 'border-red-500' : ''}`}
                    placeholder="Any existing internal executive relationships with this brand?"
                  />
                  {errors.skopePartnerRelationships && (
                    <p className="mt-1 text-sm text-red-600">{errors.skopePartnerRelationships}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                  Can this brand be easily scaled to many kitchens using our supply chain?
                  </label>
                  <textarea
                    name="sublicensingPotential"
                    value={formData.sublicensingPotential}
                    onChange={handleChange}
                    rows="3"
                    className={`input-field ${errors.sublicensingPotential ? 'border-red-500' : ''}`}
                    placeholder="Assess if the brand can hit VK criteria, simplify supply chain, and be sub-licensed"
                  />
                  {errors.sublicensingPotential && (
                    <p className="mt-1 text-sm text-red-600">{errors.sublicensingPotential}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative btn-primary bg-black hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                {loading ? (
                  // NO animation during loading
                  <span>Submitting...</span>
                ) : (
                  // SLIDE TEXT ANIMATION
                  <span className="relative block overflow-hidden">
                    {/* First text — slides UP */}
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                      <span className="block">Submit for Analysis</span>
                    </span>

                    {/* Second text — comes FROM BOTTOM */}
                    <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      Submit for Analysis
                    </span>
                  </span>
                )}
              </button>

            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default EligibilityForm
