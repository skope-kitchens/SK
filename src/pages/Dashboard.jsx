import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authUtils } from '../utils/auth'


const Dashboard = () => {
  const navigate = useNavigate()
  const [brandName, setBrandName] = useState('Your Brand')
  const status = 'Approved'
  const summaryPoints = [
    'All compliance documents verified successfully.',
    'Supply chain checks completed with no pending actions.',
    'Financial assessment indicates low risk and stable margins.',
    'Next onboarding milestones scheduled for Q1 fulfillment.',
  ]

  useEffect(() => {
    try {
      const storedBrand = localStorage.getItem('selectedBrandName')
      if (storedBrand) {
        setBrandName(storedBrand)
      }
    } catch (err) {
      console.error('Unable to access stored brand name', err)
    }
  }, [])

  const handleLogout = () => {
    authUtils.clearAuth()
    try {
      localStorage.removeItem('selectedBrandName')
    } catch (err) {
      console.error('Unable to clear brand cache', err)
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Brand Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {brandName}
              </h1>
              <p className="mt-3 text-base text-slate-500">
                Welcome back! Here is the latest status of your onboarding review.
              </p>

              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  {status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
            >
              Logout
            </button>
            <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"><a href="/docs/NDA.pdf">NDA</a></button>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Analysis Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Health snapshot
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold text-slate-600">
              Updated today
            </span>
          </div>

          <ul className="mt-6 space-y-4">
            {summaryPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600"
              >
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
          <br />
          <Link to='https://www.skopekitchens.com/schedule-a-call' >
          <button
            className="inline-flex items-center ml-80 justify-center px-8 py-4 bg-black text-white text-lg font-medium rounded-lg shadow-md transition-colors group"
          >
            <span className="relative block overflow-hidden">
              <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                <span className="block">Schedule a Call</span>
              </span>
              <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                Schedule a Call
              </span>
            </span>
          </button>
          </Link>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
