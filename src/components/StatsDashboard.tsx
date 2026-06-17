import { useState, useEffect, KeyboardEvent } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Percent, PiggyBank, Wallet, Edit3, Check, X } from 'lucide-react';
import { TradingStats } from '../types';

interface StatsDashboardProps {
  stats: TradingStats;
  startingBalance: number;
  onUpdateStartingBalance: (balance: number) => void;
}

export default function StatsDashboard({ 
  stats, 
  startingBalance, 
  onUpdateStartingBalance 
}: StatsDashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [balanceInput, setBalanceInput] = useState(startingBalance.toString());

  // Keep internal input matching outer balance if it updates
  useEffect(() => {
    setBalanceInput(startingBalance.toString());
  }, [startingBalance]);

  const isProfit = stats.totalPL > 0;
  const isLoss = stats.totalPL < 0;
  const isNeutral = stats.totalPL === 0;

  // Formatting helper
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (value > 0) return `+$${absValue}`;
    if (value < 0) return `-$${absValue}`;
    return `$${absValue}`;
  };

  const winRateHigh = stats.winRate >= 50;

  const handleSave = () => {
    const parsed = parseFloat(balanceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateStartingBalance(parsed);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setBalanceInput(startingBalance.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8" id="stats-dashboard-grid">
      
      {/* 1. STARTING CAPITAL CARD */}
      <div 
        id="card-starting-capital"
        className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all duration-200 shadow-md flex flex-col justify-between group relative ${
          !isEditing ? 'cursor-pointer hover:bg-zinc-850' : ''
        }`}
        onClick={() => {
          if (!isEditing) {
            setBalanceInput(startingBalance.toString());
            setIsEditing(true);
          }
        }}
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300">Starting Balance</span>
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-zinc-750 transition-colors">
            <PiggyBank size={15} />
          </div>
        </div>
        
        <div className="mt-4">
          {isEditing ? (
            <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
              <span className="text-zinc-500 font-bold text-sm font-mono">$</span>
              <input 
                type="number"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-zinc-950 border border-emerald-500/80 rounded-lg py-1 px-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                autoFocus
                placeholder="10000"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer shrink-0"
                title="Save"
              >
                <Check size={12} className="stroke-[3]" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setBalanceInput(startingBalance.toString());
                  setIsEditing(false);
                }}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer shrink-0"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-baseline justify-between gap-1">
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                ${startingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setBalanceInput(startingBalance.toString());
                  setIsEditing(true);
                }}
                className="text-zinc-400 hover:text-emerald-400 p-1 transition-all cursor-pointer shrink-0"
                title="Edit Starting Capital"
              >
                <Edit3 size={12} />
              </button>
            </div>
          )}
          <p className="text-[9px] text-zinc-500 mt-1 font-medium select-none flex items-center gap-1">
            <span>Initial capital size</span>
            <span className="text-emerald-500/70 group-hover:text-emerald-400 font-bold transition-colors">• Click to change</span>
          </p>
        </div>
      </div>

      {/* 2. CURRENT ACCOUNT CAPITAL VALUE CARD */}
      <div 
        id="card-active-value"
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-750 transition-all duration-200 shadow-md flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">Account Balance</span>
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
            <Wallet size={15} />
          </div>
        </div>
        
        <div className="mt-4">
          <h2 className={`text-xl sm:text-2xl font-bold font-mono tracking-tight transition-all duration-300 ${
            stats.totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            ${(startingBalance + stats.totalPL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-[9px] text-zinc-500 mt-1 font-medium select-none">
            Starting capital + net P/L
          </p>
        </div>
      </div>

      {/* 3. TOTAL P/L CARD */}
      <div 
        id="card-total-pl"
        className={`relative overflow-hidden rounded-xl p-5 transition-all duration-300 border ${
          isProfit 
            ? 'bg-gradient-to-br from-emerald-600 to-teal-850 border-emerald-500 shadow-xl shadow-emerald-950/20 text-white' 
            : isLoss 
              ? 'bg-gradient-to-br from-rose-600 to-red-850 border-red-500 shadow-xl shadow-red-950/20 text-white' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
            isNeutral ? 'text-zinc-400' : 'text-emerald-100/80 dark:text-rose-100/80'
          }`}>
            Monthly P/L
          </span>
          <div className={`p-1.5 rounded-lg ${isNeutral ? 'bg-zinc-800 text-zinc-400' : 'bg-white/10 text-white'}`}>
            {isProfit ? <TrendingUp size={15} /> : isLoss ? <TrendingDown size={15} /> : <BarChart3 size={15} />}
          </div>
        </div>
        
        <div className="mt-4">
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight transition-all">
            {formatCurrency(stats.totalPL)}
          </h2>
          <p className={`text-[9px] mt-1 font-medium select-none ${
            isProfit ? 'text-emerald-100/90' : isLoss ? 'text-rose-100/90' : 'text-zinc-500'
          }`}>
            {stats.totalPL >= 0 ? 'Net positive returns' : 'Net trading deficit'}
          </p>
        </div>

        <div className="absolute right-[-10px] bottom-[-20px] opacity-[0.07] pointer-events-none text-white">
          <TrendingUp size={90} />
        </div>
      </div>

      {/* 4. TOTAL TRADES CARD */}
      <div 
        id="card-total-trades"
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-750 transition-all duration-200 shadow-md flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Trades</span>
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
            <BarChart3 size={15} />
          </div>
        </div>
        
        <div className="mt-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            {stats.totalTrades}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9px] text-zinc-500 font-medium">
            <span className="text-emerald-500 font-semibold">{stats.winningCount} W</span>
            <span>•</span>
            <span className="text-red-500 font-semibold">{stats.losingCount} L</span>
            {stats.breakEvenCount > 0 && (
              <>
                <span>•</span>
                <span className="text-zinc-400 font-semibold">{stats.breakEvenCount} BE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. WIN RATE CARD */}
      <div 
        id="card-win-rate"
        className={`rounded-xl p-5 transition-all duration-200 border flex flex-col justify-between shadow-md ${
          winRateHigh 
            ? 'bg-zinc-900 border-emerald-500/30 shadow-md shadow-emerald-950/5' 
            : 'bg-zinc-900 border-zinc-800'
        }`}
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">Win Rate</span>
          <div className={`p-1.5 rounded-lg ${winRateHigh ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' : 'bg-zinc-800 text-zinc-400'}`}>
            <Percent size={15} />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <h2 className={`text-xl sm:text-2xl font-bold font-display tracking-tight ${winRateHigh ? 'text-emerald-400' : 'text-white'}`}>
              {stats.winRate.toFixed(1)}%
            </h2>
            {winRateHigh && (
              <span className="text-[8px] uppercase font-bold text-emerald-400 bg-emerald-950/30 px-1 py-0.5 rounded border border-emerald-900/30">
                PRO
              </span>
            )}
          </div>
          
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${winRateHigh ? 'bg-emerald-500' : 'bg-zinc-650'}`}
              style={{ width: `${Math.min(100, stats.winRate)}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
