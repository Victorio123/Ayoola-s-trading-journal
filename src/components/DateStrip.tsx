import { Calendar as CalendarIcon, Check, FilterX, HelpCircle, AlertCircle } from 'lucide-react';
import { Trade } from '../types';

interface DateStripProps {
  selectedDateFilter: string | null;
  onSelectDateFilter: (dateStr: string | null) => void;
  trades: Trade[];
}

export default function DateStrip({ selectedDateFilter, onSelectDateFilter, trades }: DateStripProps) {
  // Current local time anchor: 2026-06-16.
  const todayObj = new Date(2026, 5, 16); // June is index 5
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate 7 days: 5 past days (-5 to -1), Today (0), and 1 future day (+1)
  // This covers active demo historical entries perfectly so the user instantly sees live data
  const daysData = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 5; // offset starts at -5 and ends at +1
    const d = new Date(todayObj);
    d.setDate(todayObj.getDate() + offset);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateNum = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dateNum}`; // YYYY-MM-DD
    
    const dayName = dayLabels[d.getDay()];
    const dateDay = d.getDate();
    const monthName = monthLabels[d.getMonth()];
    
    // Type description
    let type: 'past' | 'today' | 'future' = 'future';
    if (offset < 0) {
      type = 'past';
    } else if (offset === 0) {
      type = 'today';
    }
    
    return {
      dateString,
      dayName,
      dateDay,
      monthName,
      type,
    };
  });

  return (
    <div id="trading-date-strip" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
      
      {/* Header of DateStrip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-xs uppercase font-black font-display tracking-widest text-zinc-300">
              Session Timeline Calendar
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium">
              Daily visual P/L performance strip. Select a box to filter corresponding setups
            </p>
          </div>
        </div>
        
        {selectedDateFilter && (
          <button
            onClick={() => onSelectDateFilter(null)}
            className="text-[10px] font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/30 px-3 py-1.5 rounded-lg border border-rose-900/40 flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <FilterX size={11} />
            <span>Show All Dates ({trades.length})</span>
          </button>
        )}
      </div>

      {/* Grid containing large boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3.5" id="large-date-boxes">
        {daysData.map((day) => {
          const isSelected = selectedDateFilter === day.dateString;
          
          // Calculate trades & P/L on this day
          const dayTrades = trades.filter(t => t.date === day.dateString);
          const tradeCount = dayTrades.length;
          const totalPL = dayTrades.reduce((sum, t) => sum + t.pl, 0);
          const hasTrades = tradeCount > 0;

          // Formatting helper
          const formatAmount = (val: number) => {
            if (val === 0) return '$0.00';
            const prefix = val > 0 ? '+' : '-';
            return `${prefix}$${Math.abs(val).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          };

          // Determination of styles (Color align with profit/loss)
          let cardBgStyle = '';
          let borderStyle = 'border-zinc-800/80';
          let plTextStyle = 'text-zinc-500';
          let statusPrompt = 'No Trades';
          let statusDotStyle = 'bg-zinc-800';

          if (hasTrades) {
            if (totalPL > 0) {
              // Profitable Day (GREEN alignment)
              cardBgStyle = isSelected
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-950/40'
                : 'bg-emerald-950/40 hover:bg-emerald-950/65 text-emerald-100';
              borderStyle = isSelected ? 'border-zinc-100' : 'border-emerald-500/60';
              plTextStyle = isSelected ? 'text-zinc-950 font-black' : 'text-emerald-400 font-bold';
              statusPrompt = `${tradeCount} Win${tradeCount > 1 ? 's' : ''} logged`;
              statusDotStyle = 'bg-emerald-405 bg-emerald-400';
            } else if (totalPL < 0) {
              // Losing Day (RED alignment)
              cardBgStyle = isSelected
                ? 'bg-rose-500 text-zinc-950 shadow-lg shadow-rose-950/40'
                : 'bg-rose-950/40 hover:bg-rose-950/65 text-rose-100';
              borderStyle = isSelected ? 'border-zinc-100' : 'border-rose-500/60';
              plTextStyle = isSelected ? 'text-zinc-950 font-black' : 'text-red-400 font-bold';
              statusPrompt = `${tradeCount} Loss${tradeCount > 1 ? 'es' : ''} logged`;
              statusDotStyle = 'bg-red-405 bg-red-500';
            } else {
              // Breakeven Day (NEUTRAL gray alignment)
              cardBgStyle = isSelected
                ? 'bg-zinc-600 text-zinc-950 text-white'
                : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-350';
              borderStyle = isSelected ? 'border-zinc-150' : 'border-zinc-700';
              plTextStyle = isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 font-bold';
              statusPrompt = 'Breakeven';
              statusDotStyle = 'bg-zinc-400';
            }
          } else {
            // Under default guidelines with NO trades:
            // TODAY = RED background
            // FUTURE = GREEN background
            // PAST = dark grey
            if (day.type === 'today') {
              cardBgStyle = isSelected
                ? 'bg-rose-500 text-white shadow-md shadow-rose-950/40'
                : 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-200';
              borderStyle = isSelected ? 'border-white' : 'border-rose-900/65';
              plTextStyle = isSelected ? 'text-white' : 'text-rose-400/80';
              statusPrompt = 'TODAY (Open)';
              statusDotStyle = 'bg-rose-500 animate-ping';
            } else if (day.type === 'future') {
              cardBgStyle = isSelected
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-550 text-zinc-500';
              borderStyle = isSelected ? 'border-zinc-200' : 'border-zinc-850';
              plTextStyle = isSelected ? 'text-zinc-950' : 'text-zinc-500';
              statusPrompt = 'Future Setup';
              statusDotStyle = 'bg-zinc-700';
            } else {
              cardBgStyle = isSelected
                ? 'bg-zinc-750 text-white'
                : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-500';
              borderStyle = isSelected ? 'border-zinc-300' : 'border-zinc-850';
              plTextStyle = 'text-zinc-600';
              statusPrompt = 'No Execution';
              statusDotStyle = 'bg-zinc-800';
            }
          }

          return (
            <button
              key={day.dateString}
              id={`date-strip-box-${day.dateString}`}
              onClick={() => onSelectDateFilter(isSelected ? null : day.dateString)}
              className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer min-h-[110px] ${cardBgStyle} ${borderStyle} ${
                isSelected ? 'ring-2 ring-zinc-305 ring-white scale-102 shadow-2xl relative z-10' : 'hover:scale-[1.01]'
              }`}
            >
              {/* Top part: Month and Day info */}
              <div className="flex justify-between items-start w-full">
                <div className="flex flex-col">
                  <span className={`text-[9px] uppercase font-bold tracking-wider opacity-60 ${isSelected ? 'text-zinc-950' : ''}`}>
                    {day.monthName}
                  </span>
                  <span className={`text-xs font-black font-display uppercase tracking-tight ${isSelected ? 'text-zinc-950' : 'text-zinc-300'}`}>
                    {day.dayName}
                  </span>
                </div>
                
                {/* Visual state bullet */}
                <span className={`w-2 h-2 rounded-full ${statusDotStyle}`} />
              </div>

              {/* Middle: Big Date Number */}
              <div className="my-1 flex items-baseline gap-1.5">
                <span className={`text-2xl font-black font-display tracking-tight leading-none ${isSelected ? 'text-zinc-950' : 'text-white'}`}>
                  {day.dateDay}
                </span>

                {/* Micro trade counter */}
                {tradeCount > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                    isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/80'
                  }`}>
                    {tradeCount}T
                  </span>
                )}
              </div>

              {/* Bottom: Net P/L Amount & Emotion Guidance Prompt */}
              <div className="w-full mt-1.5 pt-1.5 border-t border-zinc-800/20">
                <span className={`text-xs font-mono block ${plTextStyle}`}>
                  {hasTrades ? formatAmount(totalPL) : '$0.00'}
                </span>
                <span className={`text-[8px] font-semibold uppercase tracking-wider block mt-0.5 truncate max-w-full ${
                  isSelected ? 'text-zinc-950 opacity-80' : 'text-zinc-500'
                }`}>
                  {statusPrompt}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
