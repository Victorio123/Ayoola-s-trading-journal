import { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Trash2, 
  Database, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Filter,
  LogOut,
  User
} from 'lucide-react';
import { Trade, TradingStats } from './types';
import StatsDashboard from './components/StatsDashboard';
import DateStrip from './components/DateStrip';
import TradeForm from './components/TradeForm';
import PsychologyInsights from './components/PsychologyInsights';
import TradesTable from './components/TradesTable';
import GoogleLogin from './components/GoogleLogin';
import { 
  getTradesForUser, 
  saveTradeToFirestore, 
  deleteTradeFromFirestore, 
  batchSaveTradesToFirestore, 
  clearAllUserTrades,
  getUserStartingBalance,
  saveUserStartingBalance
} from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<{ email: string; name: string; avatar: string } | null>(() => {
    const saved = localStorage.getItem('tradezella_journal_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [trades, setTrades] = useState<Trade[]>([]);
  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('journaly_starting_balance');
    return saved ? Number(saved) : 0;
  });
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Initialize data from Firestore and Sync locally
  useEffect(() => {
    if (!user) {
      setTrades([]);
      setIsLoaded(true);
      return;
    }
    
    setIsLoaded(false);

    // Fetch starting balance for user first
    getUserStartingBalance(user.email).then((bal) => {
      if (bal !== null) {
        setStartingBalance(bal);
        localStorage.setItem('journaly_starting_balance', String(bal));
      } else {
        // No balance stored on Firestore yet.
        // Keep current startingBalance (e.g. inputted in login or default local state) and store it.
        setStartingBalance(prev => {
          saveUserStartingBalance(user.email, prev).catch(err => {
            console.error('Failed to auto-create balance profile:', err);
          });
          localStorage.setItem('journaly_starting_balance', String(prev));
          return prev;
        });
      }
    }).catch(err => {
      console.error('Failed fetching starting balance:', err);
    });
    
    // Attempt loading from secure Cloud Firestore
    getTradesForUser(user.email).then((fetchedTrades) => {
      if (fetchedTrades.length > 0) {
        setTrades(fetchedTrades);
        setIsLoaded(true);
      } else {
        // Fallback to offline localStorage partition if any exist raw
        const storageKey = `tradezella_journal_trades_${user.email}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const loadedTrades = JSON.parse(saved);
            setTrades(loadedTrades);
            // Proactively auto-migrate existing offline trades to cloud database
            batchSaveTradesToFirestore(user.email, loadedTrades).catch(err => {
              console.error('Migration backup error:', err);
            });
          } catch (err) {
            console.error('Local copy read error:', err);
            setTrades([]);
          }
        } else {
          setTrades([]);
        }
        setIsLoaded(true);
      }
    }).catch((err) => {
      console.error('Cloud load failure, falling back local storage:', err);
      const storageKey = `tradezella_journal_trades_${user.email}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setTrades(JSON.parse(saved));
        } catch {
          setTrades([]);
        }
      }
      setIsLoaded(true);
    });
  }, [user]);

  const handleUpdateStartingBalance = (newBalance: number) => {
    setStartingBalance(newBalance);
    localStorage.setItem('journaly_starting_balance', String(newBalance));
    if (user) {
      saveUserStartingBalance(user.email, newBalance).catch(err => {
        console.error('Error saving starting balance to Firestore:', err);
      });
      triggerNotification(`Starting Balance configured to $${newBalance.toLocaleString()}`);
    }
  };

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

  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  // Extract unique months from trades list
  const getTradeMonths = (tradeList: Trade[]) => {
    const monthsSet = new Set<string>();
    tradeList.forEach((t) => {
      if (t.date) {
        const parts = t.date.split('-');
        if (parts.length >= 2) {
          monthsSet.add(`${parts[0]}-${parts[1]}`);
        }
      }
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  };

  const tradeMonths = getTradeMonths(trades);

  const formatMonthName = (yearMonthStr: string) => {
    if (yearMonthStr === 'All') return 'All Months';
    const [year, month] = yearMonthStr.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // 1. Filter trades by selected month
  const monthlyTrades = selectedMonth !== 'All'
    ? trades.filter((t) => t.date && t.date.startsWith(selectedMonth))
    : trades;

  const currentStats = calculateStats(monthlyTrades);

  // Filter trades for bottom table if a date is selected from the strip
  const visibleTrades = selectedDateFilter
    ? monthlyTrades.filter((t) => t.date === selectedDateFilter)
    : monthlyTrades;

  // Add new trade
  const handleAddTrade = (newTradeData: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: `trade-id-${Date.now()}`
    };

    if (user) {
      saveTradeToFirestore(user.email, newTrade).catch(err => {
        console.error('Error saving new trade to cloud:', err);
      });
      const storageKey = `tradezella_journal_trades_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify([newTrade, ...trades]));
    }

    setTrades((prev) => [newTrade, ...prev]);
    triggerNotification(`Logged trade ${newTradeData.pair} (+${newTradeData.pl >= 0 ? '$' : '-$'}${Math.abs(newTradeData.pl)}) to cloud ledger!`);
  };

  // Delete trade
  const handleDeleteTrade = (id: string) => {
    const target = trades.find(t => t.id === id);
    if (!target) return;

    deleteTradeFromFirestore(id).catch(err => {
      console.error('Error deleting trade from cloud:', err);
    });

    const updated = trades.filter((trade) => trade.id !== id);
    setTrades(updated);

    if (user) {
      const storageKey = `tradezella_journal_trades_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    triggerNotification(`Removed trade record ${target.pair} from cloud ledger.`);
  };

  // Edit trade
  const handleEditTrade = (updatedTrade: Trade) => {
    if (user) {
      saveTradeToFirestore(user.email, updatedTrade).catch(err => {
        console.error('Error updating trade in cloud:', err);
      });
    }

    const updated = trades.map((t) => (t.id === updatedTrade.id ? updatedTrade : t));
    setTrades(updated);

    if (user) {
      const storageKey = `tradezella_journal_trades_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    triggerNotification(`Updated trade modifications for ${updatedTrade.pair}.`);
  };

  // Clear all data
  const handleClearAll = () => {
    if (user) {
      clearAllUserTrades(user.email).catch(err => {
        console.error('Error clearing trades in cloud:', err);
      });
      const storageKey = `tradezella_journal_trades_${user.email}`;
      localStorage.removeItem(storageKey);
    }

    setTrades([]);
    triggerNotification("Cleared all trade logs completely. Cloud database is fresh.");
  };

  const handleSignOut = () => {
    localStorage.removeItem('tradezella_journal_user');
    localStorage.removeItem('journaly_starting_balance');
    setUser(null);
    setTrades([]);
    setStartingBalance(100); // Default local fallback
    setSelectedDateFilter(null);
    triggerNotification("Signed out of secure session.");
  };

  if (!user) {
    return (
      <>
        {showNotification && (
          <div 
            id="system-banner-notification"
            className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-emerald-500/40 text-emerald-400 pl-4 pr-5 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in-up duration-350 transition-all backdrop-blur-md"
          >
            <CheckCircle size={15} className="text-emerald-400" />
            <span>{showNotification}</span>
          </div>
        )}
        <GoogleLogin 
          onSuccess={(loggedUser) => {
            localStorage.setItem('tradezella_journal_user', JSON.stringify(loggedUser));
            
            // Check if user already has a starting balance stored in Firestore
            getUserStartingBalance(loggedUser.email).then((existingBal) => {
              if (existingBal !== null) {
                // Keep the existing cloud stored starting balance!
                setStartingBalance(existingBal);
                localStorage.setItem('journaly_starting_balance', String(existingBal));
              } else {
                // First-time setup: save and use login starting balance (defaulting to 100 if none)
                const initialBal = (loggedUser.startingBalance !== undefined && loggedUser.startingBalance !== null)
                  ? loggedUser.startingBalance 
                  : 100;
                setStartingBalance(initialBal);
                localStorage.setItem('journaly_starting_balance', String(initialBal));
                saveUserStartingBalance(loggedUser.email, initialBal).catch(err => {
                  console.error('Error saving initial starting balance to Firestore:', err);
                });
              }
              setUser(loggedUser);
              triggerNotification(`Welcome, ${loggedUser.name}! Secure session established.`);
            }).catch(err => {
              console.error('Error querying cloud starting balance:', err);
              const fallbackBal = loggedUser.startingBalance !== undefined ? loggedUser.startingBalance : 100;
              setStartingBalance(fallbackBal);
              localStorage.setItem('journaly_starting_balance', String(fallbackBal));
              setUser(loggedUser);
              triggerNotification(`Welcome, ${loggedUser.name}! Secure session established.`);
            });
          }}
        />
      </>
    );
  }

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
                  Journaly
                </h1>
                <span className="text-[9px] uppercase font-bold text-emerald-400 border border-emerald-550/30 px-1 py-0.5 rounded leading-none">
                  Prop Elite
                </span>
              </div>
              <p className="text-[10px] text-emerald-400 font-extrabold tracking-wider uppercase">Trade. Review. Improve.</p>
            </div>
          </div>

          {/* Time & Quick Utility Actions */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400">
            {/* User Session Profile tag */}
            {user && (
              <div id="user-profile-badge" className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-emerald-500/40" />
                <span className="text-[11px] font-bold text-zinc-200">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="ml-1 text-zinc-500 hover:text-rose-400 transition-colors p-0.5 cursor-pointer flex items-center justify-center"
                  title="Sign out of Google Session"
                  id="btn-google-signout"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Live UTC Clock */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-850 rounded-lg text-emerald-400 font-mono text-[11px]" title="Institutional standard trading time">
              <Clock size={12} className="text-emerald-400" />
              <span>{utcTime || 'SYS-SYNCING...'}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5" id="header-utility-actions">
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
        
        {/* MONTH SELECTOR RIBBON */}
        <div id="monthly-stats-ribbon" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/45 p-3 sm:px-4 rounded-xl border border-zinc-850">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Filter Portfolio by Month
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedMonth('All');
                setSelectedDateFilter(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer border ${
                selectedMonth === 'All'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:border-zinc-800 hover:text-zinc-200'
              }`}
            >
              All Months ({trades.length})
            </button>
            
            {tradeMonths.map((m) => {
              const count = trades.filter(t => t.date && t.date.startsWith(m)).length;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMonth(m);
                    setSelectedDateFilter(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-155 cursor-pointer border ${
                    selectedMonth === m
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {formatMonthName(m)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. TOP ANALYTICS DASHBOARD - STYLED CARDS (THE ABSOLUTE HIGHEST PRIORITY REQ) */}
        <section aria-label="Analytical Overview" id="section-metrics-hud">
          <StatsDashboard 
            stats={currentStats} 
            startingBalance={startingBalance}
            onUpdateStartingBalance={handleUpdateStartingBalance}
          />
        </section>

        {/* 2. DATE STRIP TIMELINE SELECTOR (VERY IMPORTANT REQ) */}
        <section aria-label="Timeline Navigation" id="section-timeline-navigator">
          <DateStrip 
            selectedDateFilter={selectedDateFilter}
            onSelectDateFilter={setSelectedDateFilter}
            trades={monthlyTrades}
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
            &copy; 2026 Journaly Inc. All trade records kept client-side within browser LocalStorage.
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
