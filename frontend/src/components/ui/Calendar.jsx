import { useState } from 'react';

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function Calendar({ seances, onDayClick, onEventClick, role }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const emptyDays = Array.from({ length: offset }, (_, i) => <div key={`empty-${i}`} className="cd o"></div>);

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const currentCellDate = new Date(year, month, day);
    
    const isToday = currentCellDate.getTime() === today.getTime();
    const isPast = currentCellDate.getTime() < today.getTime();

    const daySeances = seances
      .filter(s => s.dateSeance === dateStr)
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));

    return (
      <div 
        key={day} 
        className={`cd ${isToday ? 'td' : ''}`} 
        onClick={() => role === 'admin' && !isPast && onDayClick && onDayClick(dateStr)}
        style={{ 
          cursor: (role === 'admin' && !isPast) ? 'pointer' : 'not-allowed',
          backgroundColor: isPast ? 'rgba(0,0,0,0.05)' : undefined,
          color: isPast ? 'var(--mut)' : undefined,
          opacity: isPast ? 0.7 : 1
        }}
      >
        <b>{day}</b>
        {daySeances.map(s => (
          <span 
            key={s.id} 
            className={`ev ${s.statut === 'CONFIRMEE' ? 'ok' : s.statut === 'ANNULEE' || s.statut === 'REFUSEE' ? 'ko' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(s);
            }}
          >
            {s.heureDebut ? s.heureDebut.substring(0, 5) : ''} {s.typeSeance === 'CODE' ? 'Code' : 'Conduite'}
          </span>
        ))}
      </div>
    );
  });

  return (
    <div className="card">
      <div className="ch">
        <button className="btn o s" onClick={prevMonth}>‹</button>
        <b>{MOIS[month]} {year}</b>
        <button className="btn o s" onClick={nextMonth}>›</button>
      </div>
      
      <div className="cg">
        {JOURS.map(j => <div key={j} className="dn">{j}</div>)}
        {emptyDays}
        {days}
      </div>
    </div>
  );
}