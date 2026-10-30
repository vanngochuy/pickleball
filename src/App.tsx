import React, { useState, useEffect } from 'react';
import {
  INITIAL_TEAMS,
  generateInitialMatches,
  TOURNAMENT_CONFIG,
  DEFAULT_REFEREES
} from './data/initialTournamentData';
import { Team, Match, RefereeAccount } from './types/tournament';
import { autoAdvanceBracket } from './lib/tournamentUtils';
import {
  loadLocalMatches,
  saveLocalMatches,
  loadLocalTeams,
  saveLocalTeams,
  loadLocalReferees,
  saveLocalReferees,
  syncMatchToSupabase,
  syncAllMatchesToSupabase,
  fetchMatchesFromSupabase,
  getSupabaseClient
} from './lib/supabase';

import { HeroBanner } from './components/HeroBanner';
import { GroupsView } from './components/GroupsView';
import { ScheduleView } from './components/ScheduleView';
import { KnockoutBracketView } from './components/KnockoutBracketView';
import { RefereeScorerModal } from './components/RefereeScorerModal';
import { RefereeLoginModal } from './components/RefereeLoginModal';
import { RefereePortalView } from './components/RefereePortalView';
import { SponsorsBar } from './components/SponsorsBar';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { ShareExportModal } from './components/ShareExportModal';
import { RulesModal } from './components/RulesModal';
import { ScenarioPickerBar } from './components/ScenarioPickerBar';
import { ConcurrentRefereeTestModal } from './components/ConcurrentRefereeTestModal';
import { AdminModal } from './components/AdminModal';
import { ScenarioType, getFullCompletedScenario } from './data/mockScenarios';
import { syncManager } from './lib/syncManager';

import {
  Users,
  Calendar,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Heart,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('full_completed');

  // Load state from local storage or default to full completed scenario for rich testing
  const [teams, setTeams] = useState<Team[]>(() => {
    return loadLocalTeams() || INITIAL_TEAMS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const local = loadLocalMatches();
    if (local && local.length > 0 && local.some((m) => m.status === 'completed')) {
      return local;
    }
    // Default to fully populated tournament from group stage to final as requested!
    return getFullCompletedScenario();
  });

  // 3 official referee accounts (adjustable)
  const [referees, setReferees] = useState<RefereeAccount[]>(() => {
    return loadLocalReferees() || DEFAULT_REFEREES;
  });

  const [activeTab, setActiveTab] = useState<'groups' | 'schedule' | 'bracket' | 'rules' | 'referee_desk'>('groups');
  const [selectedMatchForScorer, setSelectedMatchForScorer] = useState<Match | null>(null);
  const [isRefereeMode, setIsRefereeMode] = useState<boolean>(true); // Enabled by default for tournament administration
  const [assignedCourt, setAssignedCourt] = useState<string>(() => {
    const list = loadLocalReferees() || DEFAULT_REFEREES;
    return list[0]?.court || 'Sân 1';
  });
  const [refereeName, setRefereeName] = useState<string>(() => {
    const list = loadLocalReferees() || DEFAULT_REFEREES;
    return list[0]?.name || 'Lê Văn Đông';
  });
  const [showRefereeModal, setShowRefereeModal] = useState<boolean>(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showTestBenchModal, setShowTestBenchModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pickleball_admin_auth') === 'true';
  });

  // Cross-tab and real-time subscription for simultaneous 3-referee scoring without data loss
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((event) => {
      if (event.type === 'MATCH_LIVE_UPDATE' || event.type === 'MATCH_COMPLETED') {
        setMatches((prev) => {
          const next = prev.map((m) => (m.id === event.match.id ? event.match : m));
          return autoAdvanceBracket(next, teams);
        });
      } else if (event.type === 'BATCH_SYNC') {
        setMatches(autoAdvanceBracket(event.matches, teams));
      } else if (event.type === 'MATCH_LOCKED') {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === event.matchId
              ? {
                  ...m,
                  lockedByRefereeName: event.refereeName,
                  lockedByCourt: event.court,
                  lockedAt: event.timestamp,
                  status: m.status === 'pending' ? 'live' : m.status,
                }
              : m
          )
        );
      } else if (event.type === 'MATCH_UNLOCKED') {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === event.matchId
              ? {
                  ...m,
                  lockedByRefereeName: undefined,
                  lockedByCourt: undefined,
                  lockedAt: undefined,
                }
              : m
          )
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [teams]);

  // Save changes locally whenever matches change
  useEffect(() => {
    saveLocalMatches(matches);
  }, [matches]);

  useEffect(() => {
    saveLocalTeams(teams);
  }, [teams]);

  useEffect(() => {
    saveLocalReferees(referees);
  }, [referees]);

  // Initial cloud sync check if Supabase is configured
  useEffect(() => {
    const client = getSupabaseClient();
    if (client) {
      fetchMatchesFromSupabase().then((cloudMatches) => {
        if (cloudMatches && cloudMatches.length > 0) {
          setMatches(cloudMatches);
        }
      });
    }
  }, []);

  // Open Scorer and acquire exclusive lock for this referee
  const handleOpenScorerForMatch = (match: Match) => {
    const locked = syncManager.acquireMatchLock(match, refereeName, assignedCourt);
    setSelectedMatchForScorer(locked);
  };

  // Live score update emitted on every point scored
  const handleLiveScoreUpdate = (updatedMatch: Match) => {
    syncManager.atomicSaveMatch(updatedMatch);
    setMatches((prev) => {
      const next = prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
      return autoAdvanceBracket(next, teams);
    });
  };

  // Save completed or draft match from Referee Scoring Modal and release lock
  const handleSaveMatch = async (updatedMatch: Match) => {
    const released = syncManager.releaseMatchLock(updatedMatch);
    let newMatches = matches.map((m) => (m.id === released.id ? released : m));

    // Automatically check group standings and propagate advancing teams into Quarterfinals & Semifinals & Final
    newMatches = autoAdvanceBracket(newMatches, teams);
    setMatches(newMatches);

    // Save locally
    saveLocalMatches(newMatches);

    // Sync to Supabase in background
    syncMatchToSupabase(released);
  };

  // Release lock when closing modal
  const handleReleaseLock = (match: Match) => {
    syncManager.releaseMatchLock(match);
    setMatches((prev) => {
      const next = prev.map((m) => (m.id === match.id ? match : m));
      return autoAdvanceBracket(next, teams);
    });
  };

  // Admin emergency unlock
  const handleForceUnlockMatch = (match: Match) => {
    syncManager.forceUnlockMatch(match);
    setMatches((prev) => {
      const next = prev.map((m) =>
        m.id === match.id
          ? {
              ...m,
              lockedByRefereeName: undefined,
              lockedByCourt: undefined,
              lockedAt: undefined,
            }
          : m
      );
      return autoAdvanceBracket(next, teams);
    });
  };

  // Admin Authentication & Tournament Reset for Kickoff
  const handleAdminLogin = (password: string): boolean => {
    const clean = password.trim().toLowerCase();
    if (clean === 'admin123' || clean === 'bien2026' || clean === '1234') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('pickleball_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('pickleball_admin_auth');
  };

  const handleResetTournamentData = () => {
    const freshMatches = generateInitialMatches();
    const freshTeams = INITIAL_TEAMS;
    syncManager.clearAllLocks();
    setMatches(freshMatches);
    setTeams(freshTeams);
    setCurrentScenario('clean_reset');
    saveLocalMatches(freshMatches);
    saveLocalTeams(freshTeams);
    syncManager.broadcastBatch(freshMatches);
    syncAllMatchesToSupabase(freshMatches).catch(() => {});
  };

  // Explicit re-calculation trigger
  const handleAutoAdvance = () => {
    const updated = autoAdvanceBracket(matches, teams);
    setMatches(updated);
    saveLocalMatches(updated);
  };

  // Quick referee open from anywhere
  const handleSelectScenario = (type: ScenarioType, newMatches: Match[]) => {
    setCurrentScenario(type);
    setMatches(newMatches);
    saveLocalMatches(newMatches);
  };

  const handleOpenRefereeForNextMatch = () => {
    const liveMatch = matches.find((m) => m.status === 'live');
    if (liveMatch) {
      handleOpenScorerForMatch(liveMatch);
      return;
    }
    const nextPending = matches.find((m) => m.status === 'pending');
    if (nextPending) {
      handleOpenScorerForMatch(nextPending);
      return;
    }
    if (matches[0]) {
      handleOpenScorerForMatch(matches[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-24 selection:bg-amber-300">
      {/* Hero Tournament Banner with Official Poster visuals & Quick Tools */}
      <HeroBanner
        isRefereeMode={isRefereeMode}
        onOpenRefereeModal={() => setShowRefereeModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isAdmin={isAdminLoggedIn}
        onOpenAdminModal={() => setShowAdminModal(true)}
      />

      {/* Interactive Scenario / Test Data Picker — ONLY VISIBLE WHEN ADMIN LOGGED IN */}
      {isAdminLoggedIn && (
        <ScenarioPickerBar
          currentScenario={currentScenario}
          onSelectScenario={handleSelectScenario}
          onOpenTestBench={() => setShowTestBenchModal(true)}
          onResetTournament={handleResetTournamentData}
          onOpenAdminModal={() => setShowAdminModal(true)}
        />
      )}

      {/* Main Tournament Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-5 sm:space-y-6">
        {activeTab === 'groups' && (
          <GroupsView
            teams={teams}
            matches={matches}
            onOpenMatchScorer={handleOpenScorerForMatch}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            matches={matches}
            teams={teams}
            onOpenMatchScorer={handleOpenScorerForMatch}
            isRefereeMode={isRefereeMode}
            currentRefereeName={refereeName}
            onForceUnlockMatch={handleForceUnlockMatch}
          />
        )}

        {activeTab === 'bracket' && (
          <KnockoutBracketView
            matches={matches}
            teams={teams}
            onOpenMatchScorer={handleOpenScorerForMatch}
            onAutoAdvance={handleAutoAdvance}
          />
        )}

        {activeTab === 'referee_desk' && (
          <RefereePortalView
            matches={matches}
            teams={teams}
            onOpenMatchScorer={handleOpenScorerForMatch}
            assignedCourt={assignedCourt}
            setAssignedCourt={setAssignedCourt}
            refereeName={refereeName}
            onOpenRefereeSettings={() => setShowRefereeModal(true)}
            referees={referees}
            onSelectReferee={(ref) => {
              setRefereeName(ref.name);
              setAssignedCourt(ref.court);
            }}
            onOpenTestBench={() => setShowTestBenchModal(true)}
            onForceUnlockMatch={handleForceUnlockMatch}
            isAdmin={isAdminLoggedIn}
          />
        )}

        {/* Official Sponsors Showcase */}
        <SponsorsBar />
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">GIẢI PICKLEBALL TẬP ĐOÀN BIỂN LẦN THỨ IV</span>
            <span>·</span>
            <span>31/10/2026</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('referee_desk')}
              className="hover:text-slate-900 transition-colors font-semibold text-amber-600"
            >
              Bàn Trọng Tài
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('rules')}
              className="hover:text-slate-900 transition-colors"
            >
              Điều Lệ Giải Đấu
            </button>
            <span>·</span>
            <button
              onClick={() => setShowAdminModal(true)}
              className={`hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold ${
                isAdminLoggedIn ? 'text-rose-600 font-bold' : 'text-slate-600'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Admin BTC' : 'Quản Trị Viên'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Unified Bottom Navigation Bar (Phone & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-3 sm:left-1/2 sm:-translate-x-1/2 z-40 bg-white/95 sm:bg-white backdrop-blur-md border-t sm:border border-slate-200/90 sm:rounded-2xl py-1.5 px-2.5 sm:px-4 flex items-center justify-around sm:gap-3 shadow-lg sm:shadow-xl w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
            activeTab === 'groups'
              ? 'text-sky-600 font-black sm:bg-sky-50'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Bảng Đấu</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'text-sky-600 font-black sm:bg-sky-50'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Lịch Đấu</span>
        </button>

        <button
          onClick={() => setActiveTab('bracket')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
            activeTab === 'bracket'
              ? 'text-sky-600 font-black sm:bg-sky-50'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Knockout</span>
        </button>

        <button
          onClick={() => setActiveTab('referee_desk')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
            activeTab === 'referee_desk'
              ? 'text-amber-500 font-black sm:bg-amber-50'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Bàn Trọng Tài</span>
        </button>

        <button
          onClick={handleOpenRefereeForNextMatch}
          className="flex flex-col items-center gap-0.5 py-1 px-3 sm:px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] sm:text-xs shadow-xs active:scale-95 transition-all"
        >
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Chấm Nhanh</span>
        </button>
      </div>

      {/* Modals */}
      {selectedMatchForScorer && (
        <RefereeScorerModal
          match={selectedMatchForScorer}
          teams={teams}
          refereeName={refereeName}
          assignedCourt={assignedCourt}
          onClose={() => setSelectedMatchForScorer(null)}
          onSaveMatch={handleSaveMatch}
          onLiveScoreUpdate={handleLiveScoreUpdate}
          onReleaseLock={handleReleaseLock}
        />
      )}

      {showTestBenchModal && (
        <ConcurrentRefereeTestModal
          isOpen={showTestBenchModal}
          onClose={() => setShowTestBenchModal(false)}
          matches={matches}
          teams={teams}
          referees={referees}
          onApplyMatches={(newMatches) => {
            setMatches(autoAdvanceBracket(newMatches, teams));
            saveLocalMatches(newMatches);
          }}
        />
      )}

      {showRefereeModal && (
        <RefereeLoginModal
          isOpen={showRefereeModal}
          onClose={() => setShowRefereeModal(false)}
          isRefereeMode={isRefereeMode}
          setIsRefereeMode={setIsRefereeMode}
          assignedCourt={assignedCourt}
          setAssignedCourt={setAssignedCourt}
          refereeName={refereeName}
          setRefereeName={setRefereeName}
          referees={referees}
          setReferees={setReferees}
        />
      )}

      {showSupabaseModal && (
        <SupabaseSettingsModal
          onClose={() => setShowSupabaseModal(false)}
          matches={matches}
          onMatchesUpdated={(newMatches) => setMatches(newMatches)}
        />
      )}

      {showShareModal && (
        <ShareExportModal onClose={() => setShowShareModal(false)} />
      )}

      {activeTab === 'rules' && (
        <RulesModal onClose={() => setActiveTab('groups')} />
      )}

      {/* Admin / Organizing Committee Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        isAdmin={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onResetTournament={handleResetTournamentData}
        currentScenario={currentScenario}
        onSelectScenario={handleSelectScenario}
        onOpenTestBench={() => setShowTestBenchModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
      />
    </div>
  );
}
