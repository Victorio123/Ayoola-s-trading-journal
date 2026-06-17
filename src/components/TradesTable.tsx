import { useState } from 'react';
import { Search, SlidersHorizontal, Trash2, ArrowUpDown, Filter, HelpCircle, FileEdit, Calendar, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Trade, EmotionType } from '../types';

interface TradesTableProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  onEditTrade?: (trade: Trade) => void;
}

const EMOTION_COLORS: Record<string, string> = {
  Disciplined: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50',
  Calm: 'bg-teal-950/40 text-teal-400 border-teal-900/40',
  Confident: 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40',
  Fearful: 'bg-amber-950/40 text-amber-500 border-amber-900/40',
  Greedy: 'bg-rose-950/40 text-rose-400 border-rose-900/50',
  Revenge: 'bg-purple-950/40 text-purple-400 border-purple-900/50',
  FOMO: 'bg-sky-950/40 text-sky-400 border-sky-900/40',
  Impatient: 'bg-slate-900/60 text-slate-400 border-slate-800/80',
};

export default function TradesTable({ trades, onDeleteTrade, onEditTrade }: TradesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WINS' | 'LOSSES'>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'pl-desc' | 'pl-asc' | 'risk-desc'>('date-desc');

  // Edit State
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [editPair, setEditPair] = useState('');
  const [editType, setEditType] = useState<'BUY' | 'SELL'>('BUY');
  const [editRisk, setEditRisk] = useState('');
  const [editPl, setEditPl] = useState('');
  const [editEmotion, setEditEmotion] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Extract unique pairs for quick dropdown filter if needed, or simple text search
  const uniqueEmotions = Array.from(new Set(trades.map((t) => t.emotion || ''))).filter(Boolean);

  // Filter & Sort Logic
  const filteredTrades = trades
    .filter((trade) => {
      // 1. Text Search (Pair, Emotion or Notes)
      const matchesSearch = 
        trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (trade.emotion && trade.emotion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trade.notes && trade.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Emotion Filter
      const matchesEmotion = 
        selectedEmotionFilter === 'ALL' || 
        trade.emotion === selectedEmotionFilter;

      // 3. Result Filter
      const matchesResult = 
        resultFilter === 'ALL' || 
        (resultFilter === 'WINS' && trade.pl > 0) || 
        (resultFilter === 'LOSSES' && trade.pl < 0);

      return matchesSearch && matchesEmotion && matchesResult;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'pl-desc') return b.pl - a.pl;
      if (sortBy === 'pl-asc') return a.pl - b.pl;
      if (sortBy === 'risk-desc') return b.risk - a.risk;
      return 0;
    });

  const getEmotionPillClass = (emotion: string) => {
    const formatted = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    return EMOTION_COLORS[formatted] || 'bg-zinc-800/60 text-zinc-350 border-zinc-700/60';
  };

  const handleStartEdit = (trade: Trade) => {
    setEditingTradeId(trade.id);
    setEditPair(trade.pair);
    setEditType(trade.type);
    setEditRisk(trade.risk.toString());
    setEditPl(trade.pl.toString());
    setEditEmotion(trade.emotion);
    setEditDate(trade.date);
    setEditNotes(trade.notes || '');
  };

  const handleSaveEdit = (tradeId: string) => {
    if (!editPair.trim()) return;
    const parsedRisk = parseFloat(editRisk);
    const parsedPl = parseFloat(editPl);
    if (isNaN(parsedRisk) || isNaN(parsedPl)) return;

    if (onEditTrade) {
      onEditTrade({
        id: tradeId,
        pair: editPair.toUpperCase().trim(),
        type: editType,
        risk: parsedRisk,
        pl: parsedPl,
        emotion: editEmotion.trim(),
        date: editDate,
        notes: editNotes.trim() || undefined,
      });
    }
    setEditingTradeId(null);
  };

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (val > 0) return `+$${absVal}`;
    if (val < 0) return `-$${absVal}`;
    return `$${absVal}`;
  };

  const formatDateString = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
      const [year, month, day] = dateStr.split('-');
      // Avoid UTC timezone shifts by constructing local date
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return dateObj.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="trades-table-card-container" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
      
      {/* Search / Filters Bar */}
      <div className="flex flex-col gap-4 mb-5 md:flex-row md:items-center md:justify-between" id="table-controls-panel">
        <div>
          <h3 className="text-md font-bold font-display text-white">Execution Logs</h3>
          <p className="text-xs text-zinc-500 mt-1">Review, filter, and adjust individual trading setups</p>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Text Search */}
          <div className="relative shrink-0 w-full sm:w-48">
            <Search className="absolute left-2.5 top-2.5 text-zinc-505 text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search pair / note / emotion..."
              className="w-full bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 pl-8 rounded-lg text-white focus:outline-none focus:border-zinc-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Result Filter */}
          <select
            className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 font-medium"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as 'ALL' | 'WINS' | 'LOSSES')}
          >
            <option value="ALL">All Outcomes</option>
            <option value="WINS">Wins Only</option>
            <option value="LOSSES">Losses Only</option>
          </select>

          {/* Emotion Filter */}
          <select
            className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 font-medium max-w-[180px]"
            value={selectedEmotionFilter}
            onChange={(e) => setSelectedEmotionFilter(e.target.value)}
          >
            <option value="ALL">All Mindsets</option>
            {uniqueEmotions.map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>

          {/* Sort selection */}
          <select
            className="bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 font-medium"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="pl-desc">Highest Profit</option>
            <option value="pl-asc">Lowest Profit</option>
            <option value="risk-desc">Highest Risked</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-955" id="trades-grid-container">
        {filteredTrades.length === 0 ? (
          <div className="p-8 text-center text-zinc-550 text-xs flex flex-col justify-center items-center gap-2">
            <AlertTriangle className="text-zinc-600" size={24} />
            <span className="font-semibold text-zinc-400">No matching trades found</span>
            <span className="text-[11px] text-zinc-500">Try loosening your search filters or log a new trade session.</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs" id="trades-interactive-table">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-bold tracking-wider font-display">
              <tr>
                <th className="p-3.5 pl-4">Execution Setup / Date</th>
                <th className="p-3.5">Risked Size</th>
                <th className="p-3.5">Trading Outcome</th>
                <th className="p-3.5">R:R Ratio</th>
                <th className="p-3.5">Mindset / Psychology</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60 font-medium">
              {filteredTrades.map((trade) => {
                const isWin = trade.pl > 0;
                const isLoss = trade.pl < 0;
                const isEditing = editingTradeId === trade.id;

                // Risk to reward calculation
                const calculatedRR = trade.risk > 0 ? (trade.pl / trade.risk).toFixed(1) : '—';

                if (isEditing) {
                  return (
                    <tr key={trade.id} className="bg-zinc-900/85 font-mono" id={`trade-row-edit-${trade.id}`}>
                      {/* Pair & Date Edit */}
                      <td className="p-3 pl-4 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="bg-zinc-950 border border-zinc-700 rounded px-1.5 py-1 text-xs text-white max-w-[80px]"
                            value={editPair}
                            onChange={(e) => setEditPair(e.target.value)}
                          />
                          <select
                            className="bg-zinc-950 border border-zinc-700 rounded px-1 text-xs text-white"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as 'BUY' | 'SELL')}
                          >
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                          </select>
                        </div>
                        <input
                          type="date"
                          className="bg-zinc-950 border border-zinc-700 rounded px-1.5 py-1 text-[10px] text-white w-full max-w-[120px]"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Quick edit note..."
                          className="bg-zinc-950 border border-zinc-700 rounded px-1.5 py-1 text-[10px] text-white w-full"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />
                      </td>

                      {/* Risk Edit */}
                      <td className="p-3">
                        <div className="relative">
                          <span className="absolute left-1.5 top-1 text-zinc-550 text-xs">$</span>
                          <input
                            type="number"
                            className="bg-zinc-950 border border-zinc-700 rounded pl-4 pr-1.5 py-1 text-xs text-white max-w-[80px]"
                            value={editRisk}
                            onChange={(e) => setEditRisk(e.target.value)}
                          />
                        </div>
                      </td>

                      {/* PL Edit */}
                      <td className="p-3">
                        <div className="relative">
                          <span className="absolute left-1.5 top-1 text-zinc-550 text-xs">$</span>
                          <input
                            type="number"
                            className="bg-zinc-950 border border-zinc-700 rounded pl-4 pr-1.5 py-1 text-xs text-white max-w-[80px]"
                            value={editPl}
                            onChange={(e) => setEditPl(e.target.value)}
                          />
                        </div>
                      </td>

                      {/* RR (Blank while editing) */}
                      <td className="p-3 text-zinc-600">—</td>

                      {/* Emotion Edit */}
                      <td className="p-3">
                        <textarea
                          rows={2}
                          className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-white w-full min-w-[180px] max-w-[240px] resize-y"
                          value={editEmotion}
                          onChange={(e) => setEditEmotion(e.target.value)}
                        />
                      </td>

                      {/* Actions Edit */}
                      <td className="p-3 pr-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleSaveEdit(trade.id)}
                          className="text-emerald-450 bg-emerald-950/40 border border-emerald-900/50 hover:bg-emerald-900/60 font-bold px-2 py-1 rounded text-[10px] transition-colors leading-none cursor-pointer"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => setEditingTradeId(null)}
                          className="text-zinc-400 bg-zinc-800 hover:bg-zinc-700 font-bold px-2 py-1 rounded text-[10px] transition-colors leading-none cursor-pointer"
                        >
                          QUIT
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={trade.id} className="hover:bg-zinc-900/35 transition-colors" id={`trade-row-${trade.id}`}>
                    {/* Setup / Pair & Date & Notes */}
                    <td className="p-4 pl-4">
                      <div className="flex items-center gap-2.5">
                        {/* BUY/SELL visual tag */}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                          trade.type === 'BUY' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                            : 'bg-rose-950/60 text-rose-400 border border-rose-900/40'
                        }`}>
                          {trade.type}
                        </span>
                        
                        <span className="font-display font-semibold text-zinc-100 text-sm tracking-tight uppercase">
                          {trade.pair}
                        </span>
                      </div>
                      
                      {/* Secondary note & execution time */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-550 font-normal">
                        <span className="flex items-center gap-0.5 text-zinc-500">
                          <Calendar size={11} />
                          {formatDateString(trade.date || '')}
                        </span>
                        {trade.notes && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-450 italic inline-flex flex-wrap items-center">
                              {trade.notes.length <= 55 ? (
                                <span className="break-all">{trade.notes}</span>
                              ) : (
                                <span>
                                  {expandedNotes[trade.id] ? (
                                    <span className="break-all whitespace-pre-wrap">{trade.notes}</span>
                                  ) : (
                                    <span className="break-all">{trade.notes.slice(0, 55)}...</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedNotes(prev => ({ ...prev, [trade.id]: !prev[trade.id] }));
                                    }}
                                    className="ml-1 text-emerald-400 hover:text-emerald-350 cursor-pointer font-bold focus:outline-none focus:underline underline leading-none"
                                  >
                                    {expandedNotes[trade.id] ? 'less' : 'more'}
                                  </button>
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Risk Size */}
                    <td className="p-4 font-mono text-zinc-300">
                      ${trade.risk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Net P/L outcome */}
                    <td className="p-4">
                      <span className={`font-mono font-bold text-sm ${
                        isWin ? 'text-emerald-405 text-emerald-400' : isLoss ? 'text-red-500' : 'text-zinc-400'
                      }`}>
                        {formatCurrency(trade.pl)}
                      </span>
                    </td>

                    {/* Reward-to-Risk ratio */}
                    <td className="p-4">
                      <span className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${
                        isWin 
                          ? 'bg-emerald-950/20 text-emerald-450/95 border border-emerald-900/20' 
                          : isLoss 
                            ? 'bg-rose-950/10 text-rose-450/90 border border-rose-900/10' 
                            : 'bg-zinc-950 text-zinc-500'
                      }`}>
                        {isWin ? `+${calculatedRR}x` : isLoss ? `${calculatedRR}x` : '0.0x'}
                      </span>
                    </td>

                    {/* Mindset Pill */}
                    <td className="p-4">
                      {trade.emotion.length <= 45 ? (
                        <span className={`inline-block max-w-[180px] break-words rounded-lg px-2.5 py-1 border font-semibold text-[11px] leading-snug ${getEmotionPillClass(trade.emotion)}`}>
                          {trade.emotion}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1 items-start max-w-[200px]">
                          <span className={`inline-block break-words rounded-lg px-2.5 py-1 border font-semibold text-[11px] leading-snug ${getEmotionPillClass(trade.emotion)}`}>
                            {expandedNotes[`m-${trade.id}`] ? trade.emotion : `${trade.emotion.slice(0, 45)}...`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedNotes(prev => ({ ...prev, [`m-${trade.id}`]: !prev[`m-${trade.id}`] }));
                            }}
                            className="text-[10px] text-emerald-400 hover:text-emerald-350 cursor-pointer font-bold focus:outline-none"
                          >
                            {expandedNotes[`m-${trade.id}`] ? 'show less' : 'Read full mindset'}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 pr-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(trade)}
                          className="p-1 px-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 rounded transition-colors duration-150 tooltip cursor-pointer"
                          title="Edit log details"
                          id={`btn-edit-trade-${trade.id}`}
                        >
                          <FileEdit size={13.5} />
                        </button>
                        <button
                          onClick={() => onDeleteTrade(trade.id)}
                          className="p-1 px-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors duration-150 tooltip cursor-pointer"
                          title="Delete log"
                          id={`btn-delete-trade-${trade.id}`}
                        >
                          <Trash2 size={13.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats counter footer */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-500 px-1 gap-2">
        <div>
          Showing {filteredTrades.length} of {trades.length} logged setups
        </div>
        <div className="flex gap-2.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Wins: {trades.filter(t => t.pl > 0).length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Losses: {trades.filter(t => t.pl < 0).length}
          </span>
        </div>
      </div>
    </div>
  );
}
