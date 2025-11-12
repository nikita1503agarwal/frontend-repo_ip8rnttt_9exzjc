import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, suffix = '', delta = 0, subtitle, color = 'blue' }) {
  const isUp = delta >= 0
  const colorMap = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-amber-500 to-orange-500',
    purple: 'from-violet-500 to-fuchsia-500'
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${colorMap[color] || colorMap.blue} text-white`}>{subtitle}</span>
      </div>
      <div className="mt-3 flex items-end gap-3">
        <div className="text-3xl font-semibold text-gray-900">{value}{suffix}</div>
        <div className={`flex items-center text-sm ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="ml-1">{isUp ? '+' : ''}{delta.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
