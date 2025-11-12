import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Sparkles, Factory, Gauge, Target, Layers } from 'lucide-react'
import StatCard from './components/StatCard'
import FrictionList from './components/FrictionList'
import InitiativeWizard from './components/InitiativeWizard'

function useMetrics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [org, setOrg] = useState(null)
  const [teams, setTeams] = useState([])
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchData = async () => {
    try {
      const [orgRes, teamRes, benchRes] = await Promise.all([
        fetch(`${baseUrl}/metrics?level=org&limit=1`),
        fetch(`${baseUrl}/metrics?level=team&limit=50`),
        fetch(`${baseUrl}/benchmarks`)
      ])
      const [orgData, teamData, benchmarks] = await Promise.all([orgRes.json(), teamRes.json(), benchRes.json()])
      setOrg(orgData[0] || null)
      // fold team latest by team_id
      const latestByTeam = {}
      teamData.forEach(m => {
        const key = m.team_id
        if (!latestByTeam[key] || new Date(m.date) > new Date(latestByTeam[key].date)) {
          latestByTeam[key] = m
        }
      })
      setTeams(Object.values(latestByTeam))
    } catch (e) {
      setError('Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])
  return { loading, error, org, teams, reload: fetchData }
}

export default function App() {
  const { loading, error, org, teams } = useMetrics()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedFriction, setSelectedFriction] = useState(null)
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const averages = useMemo(() => {
    if (!teams?.length) return { devex: 0, motivation: 0, wasted: 0 }
    const n = teams.length
    return {
      devex: teams.reduce((s, t) => s + (t.devex_score || 0), 0) / n,
      motivation: teams.reduce((s, t) => s + (t.motivation || 0), 0) / n,
      wasted: teams.reduce((s, t) => s + (t.wasted_time_hours || 0), 0) / n,
    }
  }, [teams])

  const [frictions, setFrictions] = useState(0)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/frictions`)
        const data = await res.json()
        setFrictions(data.length)
      } catch {}
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-rose-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600"/>
            <h1 className="text-xl font-semibold">DevEx Dashboard</h1>
          </div>
          <a href="/test" className="text-sm text-gray-600 hover:text-gray-900">System check</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-gray-600 mb-3">Organization overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="DevEx Score" value={org?.devex_score ?? 0} suffix="/100" delta={org?.trend ?? 0} subtitle="Org" color="blue" />
            <StatCard title="Motivation" value={org?.motivation ?? 0} suffix="/100" delta={0} subtitle="Org" color="green" />
            <StatCard title="Wasted time" value={Math.round(org?.wasted_time_hours ?? 0)} suffix="h" delta={0} subtitle="Org" color="orange" />
            <StatCard title="Open frictions" value={frictions} subtitle="Current" color="purple" />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 text-gray-700 mb-4"><BarChart3 size={18}/> Team comparison vs benchmark</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map(t => (
                  <div key={t.team_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Team {t.team_id?.slice(-4) || ''}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.devex_score >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{t.devex_score}/100</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Motivation {t.motivation}/100 • Wasted {Math.round(t.wasted_time_hours)}h</div>
                  </div>
                ))}
              </div>
            </div>

            <FrictionList onSelect={(f)=>{ setSelectedFriction(f); setWizardOpen(true) }} onCreateInitiative={()=> setWizardOpen(true)} />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 text-gray-700 mb-2"><Gauge size={18}/> Critical friction focus</div>
              <p className="text-sm text-gray-600">Pick the most impactful friction and create an initiative. Track actions until it's resolved.</p>
              <button onClick={()=> setWizardOpen(true)} className="mt-3 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md"><Target size={16}/> Start an initiative</button>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 text-gray-700 mb-2"><Layers size={18}/> How it works</div>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>See DevEx score and trend for org and teams</li>
                <li>Compare against industry benchmark</li>
                <li>Identify top frictions at org and team level</li>
                <li>Select a friction to tackle and create an initiative</li>
                <li>Track actions and progress to completion</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <InitiativeWizard open={wizardOpen} onClose={()=> setWizardOpen(false)} defaultFriction={selectedFriction} />
    </div>
  )
}
