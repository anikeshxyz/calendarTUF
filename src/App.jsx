import { useState, useEffect } from 'react';
import './App.css';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2022, 0, 1));
  const [dateSelection, setDateSelection] = useState({ start: null, end: null });
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('calendar-notes');
    return saved ? JSON.parse(saved) : {};
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  useEffect(() => {
    localStorage.setItem('calendar-notes', JSON.stringify(notes));
  }, [notes]);

  const handleNoteChange = (index, value) => {
    const key = `${year}-${month}`;
    const currentNotes = notes[key] || Array(5).fill("");
    const newNotes = [...currentNotes];
    newNotes[index] = value;
    setNotes(prev => ({ ...prev, [key]: newNotes }));
  };

  const currentNotes = notes[`${year}-${month}`] || Array(5).fill("");

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDaysArray = () => {
    const firstDayObj = new Date(year, month, 1);
    let startOffset = (firstDayObj.getDay() + 6) % 7; 
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        value: daysInPrevMonth - i,
        type: 'empty',
        dateObj: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        value: i,
        type: 'current',
        dateObj: new Date(year, month, i)
      });
    }
    
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        value: i,
        type: 'empty',
        dateObj: new Date(year, month + 1, i)
      });
    }
    
    if (remainingSlots >= 7 && days[days.length - 7].type === 'empty') {
       return days.slice(0, 35);
    }
    
    return days;
  };

  const handleDayClick = (dayObj) => {
    if (dayObj.type === 'empty') return;
    
    const clickedTime = dayObj.dateObj.getTime();
    
    if (!dateSelection.start || (dateSelection.start && dateSelection.end)) {
      setDateSelection({ start: clickedTime, end: null });
    } else {
      if (clickedTime < dateSelection.start) {
        setDateSelection({ start: clickedTime, end: dateSelection.start });
      } else {
        setDateSelection({ ...dateSelection, end: clickedTime });
      }
    }
  };

  const daysGrid = getDaysArray();

  const getDayClasses = (dayObj, idx) => {
    const classes = ['day-cell'];
    if (dayObj.type === 'empty') classes.push('empty');
    
    if (idx % 7 === 5 || idx % 7 === 6) classes.push('weekend');
    
    const time = dayObj.dateObj.getTime();
    const { start, end } = dateSelection;

    if (start && time === start) {
      classes.push('selected-start');
      if (end) classes.push('in-range-start-connect');
    }
    if (end && time === end) {
      classes.push('selected-end');
      if (start !== end) classes.push('in-range-end-connect');
    }
    
    if (start && end && time > start && time < end) {
      classes.push('in-range');
    }
    
    return classes.join(' ');
  };

  const currentHero = month % 2 === 0 ? '/hero-nature.png' : '/hero-minimal.png';

  return (
    <div className="calendar-wrapper">
      <div className="hanger-rings">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="ring"></div>
        ))}
      </div>

      <div className="calendar-card">
        
        <div 
          className="calendar-header" 
          style={{ backgroundImage: `url(${currentHero})` }}
        >
          <div className="header-polygon"></div>
          <div className="calendar-header-overlay">
            <div className="month-nav">
              <button onClick={prevMonth} aria-label="Previous Month">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={nextMonth} aria-label="Next Month">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <div className="month-title">
              <span>{year}</span>
              <h1>{MONTHS[month]}</h1>
            </div>
          </div>
        </div>

        <div className="calendar-body">
          <div className="notes-section">
            <div className="notes-header">Notes</div>
            <div className="notes-lines">
              {currentNotes.map((note, index) => (
                <input
                  key={index}
                  type="text"
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  placeholder="..."
                  aria-label={`Note line ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="grid-section">
            <div className="weekdays">
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
              <div>SUN</div>
            </div>
            
            <div className="days-grid">
              {daysGrid.map((dayObj, idx) => (
                <div 
                  key={idx} 
                  className={getDayClasses(dayObj, idx)}
                  onClick={() => handleDayClick(dayObj)}
                >
                  {dayObj.value}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
