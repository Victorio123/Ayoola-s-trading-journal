import { useState, useEffect, KeyboardEvent } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Percent, DollarSign, Award } from 'lucide-react';
import { TradingStats } from '../types';

interface StatsDashboardProps {
  stats: TradingStats;
}

export default function StatsDashboard({ 
  stats, 
}: StatsDashboardProps) {
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
  const averageIsPositive = stats.averagePL >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="stats-dashboard-grid">
      
      {/* 1. TOTAL P/L CARD */}
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

      {/* 2. WIN RATE CARD */}
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

      {/* 3. TOTAL TRADES CARD */}
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

      {/* 4. AVERAGE P/L CARD */}
      <div 
        id="card-avg-pl"
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-750 transition-all duration-200 shadow-md flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">Average Trade P/L</span>
          <div className={`p-1.5 rounded-lg bg-zinc-800 transition-colors ${averageIsPositive && stats.totalTrades > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
            <Award size={15} />
          </div>
        </div>
        
        <div className="mt-4">
          <h2 className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
            stats.totalTrades === 0 
              ? 'text-zinc-400' 
              : averageIsPositive 
                ? 'text-emerald-400' 
                : 'text-rose-455 text-rose-450 text-red-400'
          }`}>
            {stats.totalTrades === 0 ? '$0.00' : formatCurrency(stats.averagePL)}
          </h2>
          <p className="text-[9px] text-zinc-500 mt-1 font-medium select-none">
            Net return per execution average
          </p>
        </div>
      </div>

    </div>
  );
}
