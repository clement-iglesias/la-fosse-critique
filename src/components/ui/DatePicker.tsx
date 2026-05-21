'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

interface DatePickerProps {
  value: string // YYYY-MM-DD
  onChange: (date: string) => void
  required?: boolean
  label?: string
}

export default function DatePicker({ value, onChange, required, label }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const today = new Date()

  const selected = value ? new Date(value + 'T12:00:00') : null

  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

  const cells: (number | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const d = i - startOffset + 1
    cells.push(d >= 1 && d <= lastDay.getDate() ? d : null)
  }

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
    setOpen(false)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day
  }

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day

  const displayValue = selected
    ? selected.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const years = Array.from({ length: 60 }, (_, i) => today.getFullYear() - 50 + i + 1)

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium mb-1.5 text-fosse-muted">{label}</label>}
      {/* Hidden native input for form validation */}
      {required && (
        <input type="text" value={value} readOnly required className="sr-only" tabIndex={-1}
          aria-hidden="true" />
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`input-field w-full flex items-center gap-2 text-left cursor-pointer ${!value ? 'text-fosse-muted' : 'text-white'}`}
      >
        <Calendar className="w-4 h-4 text-fosse-orange shrink-0" />
        <span className="flex-1">{displayValue || 'Sélectionner une date'}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 w-72 bg-fosse-surface border border-fosse-card rounded-2xl shadow-2xl p-4">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-fosse-card text-fosse-muted hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white">{MOIS[viewMonth]}</span>
              <select
                value={viewYear}
                onChange={e => setViewYear(Number(e.target.value))}
                className="bg-fosse-card border border-fosse-border text-fosse-muted text-xs rounded-lg px-1.5 py-0.5 cursor-pointer"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button type="button" onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-fosse-card text-fosse-muted hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {JOURS.map(j => (
              <div key={j} className="text-center text-[10px] font-bold text-fosse-muted py-1">{j}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => (
              <button
                key={i}
                type="button"
                disabled={!day}
                onClick={() => day && selectDay(day)}
                className={[
                  'h-8 w-full rounded-lg text-sm font-medium transition-all',
                  !day ? 'invisible pointer-events-none' : '',
                  day && isSelected(day) ? 'bg-fosse-orange text-white font-black shadow-lg' : '',
                  day && !isSelected(day) && isToday(day) ? 'ring-1 ring-fosse-orange text-fosse-orange' : '',
                  day && !isSelected(day) && !isToday(day) ? 'text-fosse-muted hover:bg-fosse-card hover:text-white' : '',
                ].join(' ')}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Today shortcut */}
          <button
            type="button"
            onClick={() => {
              setViewYear(today.getFullYear())
              setViewMonth(today.getMonth())
              selectDay(today.getDate())
            }}
            className="mt-3 w-full text-xs text-fosse-orange hover:bg-fosse-orange/10 py-1.5 rounded-xl transition-colors font-bold tracking-wide uppercase"
          >
            Aujourd'hui
          </button>
        </div>
      )}
    </div>
  )
}
