import { useEffect, useState } from 'react'
import { X, Calendar, Target, CheckCircle2 } from 'lucide-react'

export default function InitiativeWizard({ open, onClose, defaultFriction }) {
  const [title, setTitle] = useState('')
  const [scope, setScope] = useState('team')
  const [teamId, setTeamId] = useState('')
  const [owner, setOwner] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [goals, setGoals] = useState(['Reduce flaky tests', 'Cut cycle time by 20%'])
  const [successMetrics, setSuccessMetrics] = useState(['DevEx +5', 'Wasted time -10%'])
  const [teams, setTeams] = useState([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    if (defaultFriction) {
      setTitle(`Tackle: ${defaultFriction.title}`)
    }
  }, [defaultFriction])

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await fetch(`${baseUrl}/teams`)
        const data = await res.json()
        setTeams(data)
      } catch (e) {
        // ignore
      }
    }
    if (open) loadTeams()
  }, [open])

  const addGoal = () => setGoals(g => [...g, ''])
  const updateGoal = (i, v) => setGoals(g => g.map((x, idx) => idx===i ? v : x))

  const addMetric = () => setSuccessMetrics(m => [...m, ''])
  const updateMetric = (i, v) => setSuccessMetrics(m => m.map((x, idx) => idx===i ? v : x))

  const save = async () => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const payload = {
        title: title || (defaultFriction ? `Resolve: ${defaultFriction.title}` : 'DevEx Initiative'),
        friction_id: defaultFriction?._id || '',
        scope,
        team_id: scope==='team' ? teamId || (teams[0]?._id || null) : null,
        owner: owner || 'You',
        target_date: targetDate ? new Date(targetDate).toISOString() : null,
        goals: goals.filter(Boolean),
        success_metrics: successMetrics.filter(Boolean),
        status: 'planned',
        progress: 0
      }
      const res = await fetch(`${baseUrl}/initiatives`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to create initiative')
      const data = await res.json()
      setSuccess('Initiative created successfully')
      // Optionally reset minimal fields
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Improvement Initiative</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><X size={18}/></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2">
            <label className="text-sm text-gray-600">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Stabilize CI and reduce flaky tests" />
            {defaultFriction && <p className="text-xs text-gray-500 mt-1">Linked friction: {defaultFriction.title}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600">Scope</label>
            <select value={scope} onChange={e=>setScope(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md">
              <option value="team">Team</option>
              <option value="org">Organization</option>
            </select>
          </div>

          {scope==='team' && (
            <div>
              <label className="text-sm text-gray-600">Team</label>
              <select value={teamId} onChange={e=>setTeamId(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md">
                <option value="">Select team</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600">Owner</label>
            <input value={owner} onChange={e=>setOwner(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="e.g., Jane Doe" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Target date</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar size={18} className="text-gray-400"/>
              <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">Goals</label>
            <div className="space-y-2 mt-1">
              {goals.map((g, i) => (
                <input key={i} value={g} onChange={e=>updateGoal(i, e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Add a goal" />
              ))}
              <button onClick={addGoal} className="text-sm text-blue-600">+ Add goal</button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">Success metrics</label>
            <div className="space-y-2 mt-1">
              {successMetrics.map((m, i) => (
                <input key={i} value={m} onChange={e=>updateMetric(i, e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Add a metric" />
              ))}
              <button onClick={addMetric} className="text-sm text-blue-600">+ Add metric</button>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
        {success && <div className="mt-4 text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 size={18}/>{success}</div>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
          <button disabled={saving} onClick={save} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">Create Initiative</button>
        </div>
      </div>
    </div>
  )
}
