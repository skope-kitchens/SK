import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

const ContactUs = () => {
  const [chefName, setChefName] = useState('')

  useEffect(() => {
    const fetchChef = async () => {
      try {
        const res = await api.get('/api/brand/profile')
        setChefName(res.data?.chefName || '')
      } catch (err) {
        console.error('[ContactUs] Failed to load chefName', err)
        setChefName('')
      }
    }
    fetchChef()
  }, [])

  const displayChefName = chefName || 'Chef'

  const connectTeams = [
    {
      name: displayChefName,
      role: 'Executive Chef',
      team: 'Culinary Team',
      image: '/assets/chef.jpg',
      link: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2gOkj36Js9GK8IIG36DPWaSEviS7Km195Xuo-O4wI_9AOt6AleQuhJ2qogIEt3-eQEB0FRSFiI',
    },
    {
      name: 'Sanjuktha Babu',
      role: 'Customer Success Manager',
      team: 'Growth Team',
      image: '/assets/Sanjuktha-Babu_Light.png',
      link: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0sqwXdi-0lMbxcy9Rws29YWFm1fL3iGxKSdJZzE7aGoOpxBNoFWoVNOOyto2tPh7pEciz2FnD_',
    },
    {
      name: null,
      role: null,
      team: 'Data Analytics Team',
      image: '/assets/Data-Analytics.jpg',
      link: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ13vng14mL6kgbPsGMVQybs2i-ftRiB9dkgrgqzv3AYGDe-CG9w8ClBeYubraom6uq90V_YlgAx',
    },
  ]

  const teamMembers = [
    {
      name: displayChefName,
      role: 'Executive Chef',
      team: 'Culinary Team',
      image: '/assets/chef.jpg',
    },
    {
      name: 'Sanjuktha Babu',
      role: 'Customer Success Manager',
      team: 'Growth Team',
      image: '/assets/Sanjuktha-Babu.png',
    },
    {
      name: 'Tom Mathew',
      role: 'Co-founder & COO',
      team: 'Management Team',
      image: '/assets/Tom-Mathew.png',
    },
    {
      name: 'Meghna Raj',
      role: 'HR Generalist',
      team: 'HR Department',
      image: '/assets/Meghna-Raj.png',
    },
    {
      name: 'Lukose Jacob',
      role: 'Data Analyst',
      team: 'Data Analyst Team',
      image: '/assets/Lukose-Jacob.png',
    },
    {
      name: 'Prabhavathi V',
      role: 'Junior Purchase Manager',
      team: 'Procurement Team',
      image: '/assets/Prabhavathi-V.png',
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {/* Let's Connect and Solve Section */}
        <section className="max-w-7xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Let's Connect and Solve
            </h1>
            <p className="text-xl text-gray-900 mb-6">
              Connect with the right expert for what you need
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Whether you're a partnered brand or part of our internal ecosystem, we've made it easier for you to reach the right person—fast. Your time matters, and so does your growth. Let's make every conversation productive.
            </p>
          </div>

          {/* Team Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {connectTeams.slice(0, 3).map((team, index) => {
              const useDarkText =
                team.name === 'Shiva Kumar' || team.team === 'Data Analytics Team'
              const textColorClass = useDarkText ? 'text-gray-900' : 'text-white'
              return (
              <div
                key={index}
                style={ {backgroundImage: `url(${team.image})`}}
                className="bg-cover bg-no-repeat bg-center from-blue-50 to-blue-100/30 flex flex-col justify-end rounded-xl p-6 h-[55vh] shadow-md"
              >
                {team.name && (
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold ${textColorClass}`}>{team.name}</h3>
                    {team.role && (
                      <p className={`text-sm ${textColorClass}`}>{team.role}</p>
                    )}
                  </div>
                )}
                <p className={`text-sm font-semibold ${textColorClass} mb-6`}>{team.team}</p>
                <a
                  href={team.link || 'https://www.skopekitchens.com/schedule-a-call'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
                >
                  Schedule Call
                </a>
              </div>
            )})}
          </div>

          
        </section>

        {/* Our Teams Section */}
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Teams
            </h2>
            <p className="text-xl text-gray-900 mb-6">
              Powering the Best Restaurants in Bangalore
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Behind every successful kitchen, there's a team of dedicated professionals. At Skope Kitchens, our departments work together to support partners, elevate quality, and help grow the best restaurants in JP Nagar and across restaurants in Bangalore.
            </p>
          </div>

          {/* Team Member Profiles Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {teamMembers.slice(0, 3).map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">{member.team}</p>
                </div>
                <div className="mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-64 h-64 rounded-lg mx-auto object-cover grayscale"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {teamMembers.slice(3).map((member, index) => (
              <div key={index + 3} className="text-center">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">{member.team}</p>
                </div>
                <div className="mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-64 h-64 rounded-lg mx-auto object-cover grayscale"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default ContactUs
