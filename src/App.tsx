import { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Trash2, 
  Database, 
  Clock, 
  CheckCircle,
  HelpCircle,
  FolderSync,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';
import { Trade, TradingStats } from './types';
import StatsDashboard from './components/StatsDashboard';
import DateStrip from './components/DateStrip';
import TradeForm from './components/TradeForm';
import PsychologyInsights from './components/PsychologyInsights';
import TradesTable from './components/TradesTable';

// Premium high-fidelity seed data
const DEMO_TRADES: Omit<Trade, 'id'>[] = [
  { pair: 'NAS100', type: 'BUY', risk: 200, pl: 750, emotion: 'Disciplined', date: '2026-06-15', notes: 'Clean breakout of overnight consolidation. Took partials.' },
  { pair: 'XAUUSD', type: 'SELL', risk: 150, pl: -150, emotion: 'Calm', date: '2026-06-14', notes: 'Standard breakdown test, stopped out on aggressive pullback.' },
  { pair: 'EURUSD', type: 'BUY', risk: 100, pl: 350, emotion: 'Confident', date: '2026-06-12', notes: 'Daily trend alignment. Highly technical entry.' },
  { pair: 'BTCUSD', type: 'BUY', risk: 300, pl: -300, emotion: 'FOMO', date: '2026-06-11', notes: 'Felt left out of crypto pump. Chased at local high.' },
  { pair: 'XAUUSD', type: 'SELL', risk: 250, pl: -250, emotion: 'Revenge', date: '2026-06-09', notes: 'Tried to make back XAUUSD losses too fast. Overleveraged.' },
  { pair: 'NAS100', type: 'BUY', risk: 150, pl: 450, emotion: 'Disciplined', date: '2026-06-07', notes: 'Stoppings on 15m key support level. Perfect R:R.' },
  { pair: 'US30', type: 'SELL', risk: 120, pl: -120, emotion: 'Fearful', date: '2026-06-05', notes: 'Got nervous due to high spread and exited manually too early.' },
  { pair: 'XAUUSD', type: 'BUY', risk: 100, pl: 220, emotion: 'Calm', date: '2026-06-03', notes: 'Simple continuation play on daily support.' }
];

export default function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Initialize data from local storage
  useEffect(() => {
    const saved = localStorage.getItem('tradezella_journal_trades');
    if (saved) {
      try {
        setTrades(JSON.parse(saved));
      } catch (err) {
        console.error('Failed reading trades from local storage:', err);
      }
    } else {
      // Load initial seed trades so the user is immediately greeted with beautiful visual dashboard charts!
      const initialSeed: Trade[] = DEMO_TRADES.map((d, index) => ({
        ...d,
        id: `seed-id-${index + 1}`
      }));
      setTrades(initialSeed);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever trades state updates
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tradezella_journal_trades', JSON.stringify(trades));
    }
  }, [trades, isLoaded]);

  // Sync Live UTC Clock (crucial for retail & institutional session tracking)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 3500);
  };

  // State calculations
  const calculateStats = (tradeList: Trade[]): TradingStats => {
    const totalTrades = tradeList.length;
    let totalPL = 0;
    let winningCount = 0;
    let losingCount = 0;
    let breakEvenCount = 0;
    let totalWinsPL = 0;
    let totalLossesPL = 0;
    let totalRisk = 0;

    tradeList.forEach((t) => {
      totalPL += t.pl;
      totalRisk += t.risk;
      if (t.pl > 0) {
        winningCount++;
        totalWinsPL += t.pl;
      } else if (t.pl < 0) {
        losingCount++;
        totalLossesPL += t.pl;
      } else {
        breakEvenCount++;
      }
    });

    const activeOutcomes = winningCount + losingCount;
    const winRate = activeOutcomes > 0 ? (winningCount / activeOutcomes) * 100 : 0;
    const averageRisk = totalTrades > 0 ? totalRisk / totalTrades : 0;
    const averagePL = totalTrades > 0 ? totalPL / totalTrades : 0;

    return {
      totalPL,
      totalTrades,
      winRate,
      winningCount,
      losingCount,
      breakEvenCount,
      totalWinsPL,
      totalLossesPL,
      averageRisk,
      averagePL,
    };
  };

  const currentStats = calculateStats(trades);

  // Filter trades for bottom table if a date is selected from the strip
  const visibleTrades = selectedDateFilter
    ? trades.filter((t) => t.date === selectedDateFilter)
    : trades;

  // Add new trade
  const handleAddTrade = (newTradeData: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: `trade-id-${Date.now()}`
    };
    setTrades((prev) => [newTrade, ...prev]);
    triggerNotification(`Logged trade ${newTradeData.pair} (+${newTradeData.pl >= 0 ? '$' : '-$'}${Math.abs(newTradeData.pl)}) to local journal!`);
  };

  // Delete trade
  const handleDeleteTrade = (id: string) => {
    const target = trades.find(t => t.id === id);
    setTrades((prev) => prev.filter((trade) => trade.id !== id));
    if (target) {
      triggerNotification(`Removed trade record ${target.pair} from log history.`);
    }
  };

  // Edit trade
  const handleEditTrade = (updatedTrade: Trade) => {
    setTrades((prev) => prev.map((t) => (t.id === updatedTrade.id ? updatedTrade : t)));
    triggerNotification(`Updated trade modifications for ${updatedTrade.pair}.`);
  };

  // Reset to seed/demo data
  const handleLoadDemo = () => {
    const initialSeed: Trade[] = DEMO_TRADES.map((d, index) => ({
      ...d,
      id: `seed-id-${Date.now()}-${index}`
    }));
    setTrades(initialSeed);
    triggerNotification("Reloaded default high-performance demo journal setups.");
  };

  // Clear all data
  const handleClearAll = () => {
    setTrades([]);
    triggerNotification("Cleared all trade logs completely. Database is fresh.");
  };

  return (
    <div id="main-trading-journal-app" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Top Banner Notification */}
      {showNotification && (
        <div 
          id="system-banner-notification"
          className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-emerald-500/40 text-emerald-400 pl-4 pr-5 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in-up duration-300 transition-all backdrop-blur-md"
        >
          <CheckCircle size={15} className="text-emerald-400" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Header Panel */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-md" id="app-header-navigation">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-550 bg-emerald-500 text-zinc-950 flex items-center justify-center animate-pulse duration-1000">
              <Activity size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black font-display tracking-tight text-white uppercase">
                  ZELLA JOURNAL
                </h1>
                <span className="text-[9px] uppercase font-bold text-emerald-400 border border-emerald-550/30 px-1 py-0.5 rounded leading-none">
                  Prop Elite
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">Cognitive Psychology Trading Dashboard</p>
            </div>
          </div>

          {/* Time & Quick Utility Actions */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400">
            {/* Live UTC Clock */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-850 rounded-lg text-emerald-400 font-mono text-[11px]" title="Institutional standard trading time">
              <Clock size={12} className="text-emerald-400" />
              <span>{utcTime || 'SYS-SYNCING...'}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5" id="header-utility-actions">
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-zinc-300 rounded-lg transition-all duration-150 tooltip cursor-pointer"
                title="Reset to default multi-emotion demo dataset"
                id="btn-load-demo-data"
              >
                <FolderSync size={12.5} />
                <span>Reset Seed</span>
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900/40 hover:bg-rose-950/25 border border-zinc-850 hover:border-rose-900/50 text-zinc-400 hover:text-rose-450 rounded-lg transition-all duration-150 tooltip cursor-pointer"
                title="Wipe local storage and begin empty journal"
                id="btn-clear-database"
              >
                <Trash2 size={12.5} />
                <span>Wipe Logs</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6" id="dashboard-container-body">
        
        {/* Core Instructions Hint for empty state */}
        {trades.length === 0 && (
          <div className="bg-gradient-to-r from-emerald-950/20 to-teal-950/10 border border-emerald-900/30 p-4 rounded-xl text-xs text-zinc-350 flex items-start gap-3" id="blank-slate-instruction-box">
            <Sparkles className="text-emerald-400 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold text-white block mb-0.5">Welcome to your clean trading ledger!</span>
              Your database is completely empty. You can write your own custom trades below, or click 
              <button onClick={handleLoadDemo} className="text-emerald-450 underline ml-1 font-semibold hover:text-emerald-400">Load Seed Trades</button> in the header to instantly fill the screen with pre-calculated psychological data.
            </div>
          </div>
        )}

        {/* 1. TOP ANALYTICS DASHBOARD - STYLED CARDS (THE ABSOLUTE HIGHEST PRIORITY REQ) */}
        <section aria-label="Analytical Overview" id="section-metrics-hud">
          <StatsDashboard stats={currentStats} />
        </section>

        {/* 2. DATE STRIP TIMELINE SELECTOR (VERY IMPORTANT REQ) */}
        <section aria-label="Timeline Navigation" id="section-timeline-navigator">
          <DateStrip 
            selectedDateFilter={selectedDateFilter}
            onSelectDateFilter={setSelectedDateFilter}
            trades={trades}
          />
        </section>

        {/* 3. MIDDLE SPLIT LEVEL: Trade log on left, Psychological insights breakdown on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="middle-section-split-grids">
          
          <div className="lg:col-span-5" id="col-logs-form">
            <TradeForm onAddTrade={handleAddTrade} />
          </div>

          <div className="lg:col-span-7" id="col-insights-chart">
            <PsychologyInsights trades={trades} />
          </div>

        </div>

        {/* 4. BOTTOM SECONDARY LEVEL: Comprehensive Trades Log Grid with search search and list deletion */}
        <section aria-label="Trade History" id="section-trades-history-table">
          <TradesTable 
            trades={visibleTrades} 
            onDeleteTrade={handleDeleteTrade} 
            onEditTrade={handleEditTrade}
          />
        </section>

      </main>

      {/* Simple Professional Prop Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 mt-12 py-6 text-center text-[10px] text-zinc-600" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div>
            &copy; 2026 Zella Journal Inc. All trade records kept client-side within browser LocalStorage.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-zinc-500 transition-colors">Risk Warning: Derivates carry high loss thresholds.</span>
            <span>•</span>
            <span className="hover:text-zinc-500 transition-colors">Psychological Discipline Protocol V1.2</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
