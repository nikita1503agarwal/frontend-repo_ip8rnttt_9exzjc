import { useEffect, useState } from 'react'
import { AlertTriangle, Filter, Plus } from 'lucide-react'

export default function FrictionList({ onSelect, onCreateInitiative }) {
  const [frictions, setFrictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/frictions`)
        const data = await res.json()
        setFrictions(data)
      } catch (e) {
        setError('Failed to load frictions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-6">Loading frictions...</div>
  if (error) return <div className="p-6 text-rose-600">{error}</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 text-gray-700"><Filter size={18}/> Frictions</div>
        <button onClick={onCreateInitiative} className="inline-flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md"><Plus size={16}/> New Initiative</button>
      </div>
      <ul className="divide-y">
        {frictions.map(f => (
          <li key={f._id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect && onSelect(f)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`${f.severity >=4 ? 'text-rose-500' : 'text-amber-500'}`} size={18}/>
                <div>
                  <div className="font-medium text-gray-900">{f.title}</div>
                  <div className="text-xs text-gray-500 capitalize">{f.category} • Severity {f.severity}</div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${f.status==='resolved' ? 'bg-emerald-50 text-emerald-700' : f.status==='active' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{f.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
