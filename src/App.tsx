import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GameWorldState,
  armFieldTrapInFront,
  createInitialGameState,
  executeCombatRound,
  performPentagramRitual,
  resolveCosmicAlignment,
  stepDungeonSimulation
} from './game/rules';
import { soundEngine } from './game/sound';
import { DungeonViewport } from './components/DungeonViewport';
import {
  CombatModal,
  DesignCodexModal,
  PentagramModal,
  StatusModal
} from './components/Modals';

const TITLE_BG_URL = '/src/assets/images/title_bg_1794200059197.jpg';

export default function App() {
  const [worldState, setWorldState] = useState<GameWorldState>(() => {
    const initial = createInitialGameState();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        initial.phase = 'playing';
      }
    }
    return initial;
  });

  const [showCodexModal, setShowCodexModal] = useState(false);
  const [showPentagramModal, setShowPentagramModal] = useState(false);
  const [muted, setMuted] = useState(false);
  const [titleBgError, setTitleBgError] = useState(false);

  const traumaRef = useRef<number>(0);
  const hitstopRef = useRef<number>(0);

  // Sync game state machine to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = worldState.phase;
  }, [worldState.phase]);

  const handleStartGame = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.dataset.state = 'playing';
    soundEngine.playSummonChoir();
    setShowCodexModal(false);
    setShowPentagramModal(false);
    setWorldState((prev) => {
      if (prev.phase === 'gameover') {
        const fresh = createInitialGameState();
        fresh.phase = 'playing';
        return fresh;
      }
      return { ...prev, phase: 'playing', outcome: 'NONE' };
    });
  }, []);

  const handleRestartFloor = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.dataset.state = 'playing';
    soundEngine.playSummonChoir();
    setShowPentagramModal(false);
    const fresh = createInitialGameState();
    fresh.phase = 'playing';
    setWorldState(fresh);
  }, []);

  const handleReturnTitle = useCallback(() => {
    document.body.dataset.state = 'title';
    setShowPentagramModal(false);
    setWorldState(createInitialGameState());
  }, []);

  const handleMove = useCallback(
    (action: 'FORWARD' | 'BACKWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'WAIT') => {
      setWorldState((prev) => {
        if (prev.phase !== 'playing' || prev.activeCombatPartyId) return prev;
        const next = stepDungeonSimulation(prev, action);
        if (action === 'TURN_LEFT' || action === 'TURN_RIGHT') {
          soundEngine.playTurn();
        } else {
          soundEngine.playStep();
        }
        if (next.activeCombatPartyId && !prev.activeCombatPartyId) {
          traumaRef.current = 0.55;
          hitstopRef.current = 0.05;
          soundEngine.playSpellCast(true);
        }
        return next;
      });
    },
    []
  );

  const handleArmTrap = useCallback(() => {
    setWorldState((prev) => {
      if (prev.phase !== 'playing' || prev.activeCombatPartyId) return prev;
      const next = armFieldTrapInFront(prev);
      if (next !== prev) {
        soundEngine.playTrapArm();
        traumaRef.current = 0.25;
      }
      return next;
    });
  }, []);

  const handleEngageNearestParty = useCallback(() => {
    setWorldState((prev) => {
      if (prev.phase !== 'playing' || prev.activeCombatPartyId) return prev;
      const livingParty = prev.nemesisParties.find((p) => !p.defeated);
      if (!livingParty) return prev;
      soundEngine.playSpellCast(true);
      traumaRef.current = 0.5;
      hitstopRef.current = 0.05;
      return {
        ...prev,
        activeCombatPartyId: livingParty.id,
        combatRound: 1,
        combatLog: [
          `ASTRAL INTERCEPT! Werdna confronts ${livingParty.name} for the ${livingParty.relicHeld}!`,
          ...prev.combatLog.slice(0, 4)
        ]
      };
    });
  }, []);

  const handleTryPillarAction = useCallback(
    (pillarId: string) => {
      setShowCodexModal(false);
      setWorldState((prev) => {
        const base = prev.phase === 'playing' ? prev : { ...prev, phase: 'playing' as const };
        if (pillarId === 'pentagram-synergy') {
          setShowPentagramModal(true);
          return base;
        }
        if (pillarId === 'lair-architect') {
          soundEngine.playTrapArm();
          return armFieldTrapInFront(base);
        }
        if (pillarId === 'nemesis-raiders' || pillarId === 'sacrificial-combat') {
          const target = base.nemesisParties.find((p) => !p.defeated);
          if (target) {
            soundEngine.playSpellCast(true);
            return {
              ...base,
              activeCombatPartyId: target.id,
              combatRound: 1
            };
          }
        }
        return base;
      });
    },
    []
  );

  const handleConfirmPentagram = useCallback((selectedIds: string[]) => {
    soundEngine.playSummonChoir();
    traumaRef.current = 0.35;
    setShowPentagramModal(false);
    setWorldState((prev) => performPentagramRitual(prev, selectedIds));
  }, []);

  const handleCastCombatSpell = useCallback((spellId: string, targetIdx: number) => {
    const isHeavy = spellId === 'mahalito' || spellId === 'tiltowait' || spellId === 'dark-pact';
    soundEngine.playSpellCast(isHeavy);
    traumaRef.current = isHeavy ? 0.7 : 0.35;
    hitstopRef.current = isHeavy ? 0.06 : 0.03;

    setWorldState((prev) => {
      const next = executeCombatRound(prev, spellId, targetIdx);
      if (next.phase === 'gameover') {
        if (next.outcome === 'VICTORY') soundEngine.playVictoryFanfare();
        if (next.outcome === 'DEFEAT') soundEngine.playDefeatSting();
      }
      return next;
    });
  }, []);

  const handleSpareRetreat = useCallback(() => {
    soundEngine.playSummonChoir();
    setWorldState((prev) => {
      const nextMercy = prev.mercyScore + 2;
      return {
        ...prev,
        activeCombatPartyId: null,
        mercyScore: nextMercy,
        alignment: resolveCosmicAlignment(prev.vengeanceScore, nextMercy),
        combatLog: [
          'TWILIGHT TRUCE! Werdna spares the invading knights and phases back into shadow (+2 Mercy).',
          ...prev.combatLog.slice(0, 4)
        ]
      };
    });
  }, []);

  // Unified Keyboard Input Hub
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (worldState.phase === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!showCodexModal) {
            e.preventDefault();
            handleStartGame();
          }
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (showCodexModal) {
          setShowCodexModal(false);
          return;
        }
        if (showPentagramModal) {
          setShowPentagramModal(false);
          return;
        }
        setWorldState((prev) => ({
          ...prev,
          phase: prev.phase === 'paused' ? 'playing' : 'paused'
        }));
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        setMuted((m) => {
          const next = !m;
          soundEngine.muted = next;
          return next;
        });
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        handleRestartFloor();
        return;
      }

      if (e.key === 'i' || e.key === 'I') {
        setShowCodexModal((v) => !v);
        return;
      }

      if (worldState.phase !== 'playing' || showCodexModal || showPentagramModal) return;

      if (worldState.activeCombatPartyId) {
        if (e.key === '1') handleCastCombatSpell('halito', 0);
        if (e.key === '2') handleCastCombatSpell('katino', 0);
        if (e.key === '3') handleCastCombatSpell('mahalito', 0);
        if (e.key === '4') handleCastCombatSpell('morlis', 0);
        return;
      }

      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          e.preventDefault();
          handleMove('FORWARD');
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          e.preventDefault();
          handleMove('BACKWARD');
          break;
        case 'a':
        case 'A':
        case 'q':
        case 'Q':
        case 'ArrowLeft':
          e.preventDefault();
          handleMove('TURN_LEFT');
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          e.preventDefault();
          handleMove('TURN_RIGHT');
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          setShowPentagramModal(true);
          break;
        case '1':
          e.preventDefault();
          handleArmTrap();
          break;
        case '2':
          e.preventDefault();
          handleEngageNearestParty();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    worldState.phase,
    worldState.activeCombatPartyId,
    showCodexModal,
    showPentagramModal,
    handleStartGame,
    handleRestartFloor,
    handleMove,
    handleArmTrap,
    handleEngageNearestParty,
    handleCastCombatSpell
  ]);

  const isOnPentagram =
    worldState.grid[worldState.playerY]?.[worldState.playerX] === 'PENTAGRAM';

  // Render discrete vitality sockets (6 sockets representing Werdna's HP)
  const totalSockets = 6;
  const hpPerSocket = worldState.werdnaMaxHp / totalSockets;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#09080c] select-none">
      {/* Always-mounted 3D Raycasted Dungeon Viewport */}
      <DungeonViewport
        worldState={worldState}
        traumaRef={traumaRef}
        hitstopRef={hitstopRef}
      />

      {/* =====================================================================
          1. TITLE SCREEN STAGE (Approach 4: Illustrated Key-Art Backdrop)
         ===================================================================== */}
      {worldState.phase === 'title' && (
        <section
          aria-label="Title Screen"
          className="fixed inset-0 z-30 flex flex-col justify-between p-8 md:p-14 overflow-hidden"
        >
          {/* Key Art Background Image with left-side negative space scrim */}
          {!titleBgError ? (
            <img
              src={TITLE_BG_URL}
              alt="Werdna awakening from his obsidian sarcophagus above a glowing crimson pentagram"
              referrerPolicy="no-referrer"
              onError={() => setTitleBgError(true)}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#140d21] via-[#09080c] to-[#260b15]" />
          )}

          {/* Measured Dark Scrim over Left Negative Space for guaranteed > 7:1 text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07060b]/95 via-[#07060b]/80 to-transparent" />

          {/* Top Left Subtle World Crest */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 36 36"
                className="w-9 h-9 text-rose-500 shrink-0"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="rgba(17, 12, 24, 0.9)"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <polygon
                  points="18,4 22,29 6,12 30,12 14,29"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="1.6"
                />
              </svg>
              <span className="font-display text-sm tracking-widest text-stone-300">
                WIZARDRY IV · MODERN REIMAGINING
              </span>
            </div>
          </div>

          {/* Left-Third Negative-Space Composition: Custom Inline SVG Title Lockup & Actions */}
          <div className="relative z-10 max-w-xl space-y-6 my-auto">
            {/* Custom Inline SVG Emblem & Display Lockup */}
            <div className="space-y-3">
              <svg
                viewBox="0 0 520 118"
                className="w-full max-w-[480px] h-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]"
                role="img"
                aria-label="Werdna: The Ascension"
              >
                <defs>
                  <linearGradient id="werdnaGold" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="55%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
                {/* Decorative Obsidian & Crimson Sigil Frame */}
                <path
                  d="M4 22 L42 22 L54 10 L466 10 L478 22 L516 22"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2"
                  opacity="0.75"
                />
                <text
                  x="6"
                  y="68"
                  fill="url(#werdnaGold)"
                  fontFamily="Cinzel, Georgia, serif"
                  fontWeight="700"
                  fontSize="54"
                  letterSpacing="4"
                >
                  WERDNA
                </text>
                <text
                  x="8"
                  y="102"
                  fill="#f43f5e"
                  fontFamily="Cinzel, Georgia, serif"
                  fontWeight="600"
                  fontSize="21"
                  letterSpacing="7"
                >
                  THE ASCENSION
                </text>
                <path
                  d="M6 112 L360 112"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              </svg>

              <p className="text-base text-stone-200 leading-relaxed max-w-lg">
                Awaken entombed at Floor B10. Command your Scrying Blueprint, bind synergistic Monster Covens at Crimson Pentagrams, arm Lair Traps, and reclaim your stolen Relics from invading Crusader parties.
              </p>
            </div>

            {/* <= 3 Primary Menu Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                data-start="true"
                onClick={handleStartGame}
                className="px-7 py-3.5 text-sm font-bold text-white bg-rose-700 hover:bg-rose-600 rounded-lg shadow-lg border border-rose-400/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Start Game
              </button>

              <button
                type="button"
                onClick={() => setShowCodexModal(true)}
                className="px-5 py-3.5 text-sm font-semibold text-amber-200 bg-[#1b1426]/95 hover:bg-[#261c36] rounded-lg border border-amber-500/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                5 Modern Remake Ideas
              </button>
            </div>
          </div>

          {/* Flat, borderless single-line control hint in bottom safe margin */}
          <div className="relative z-10 text-xs font-mono text-stone-300 tracking-wide">
            WASD / Arrows Move & Turn · E Pentagram Ritual · 1 Arm Spike Trap · 2 Intercept Raiders · P Pause
          </div>
        </section>
      )}

      {/* =====================================================================
          2. DIEGETIC GAME SHELL & PERIMETER HUD (Playing State)
         ===================================================================== */}
      {worldState.phase !== 'title' && (
        <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
          {/* TOP ROW: Top-Left Overlord Vitals & Top-Right Scrying Automap */}
          <div className="flex items-start justify-between gap-4">
            {/* Top-Left Cluster: Werdna Vitals, Mana, Relics & Cosmic Alignment */}
            <div className="pointer-events-auto bg-[#110d19]/92 border border-[#3a2d4f] rounded-xl p-3.5 shadow-xl max-w-md space-y-2.5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono tracking-wider text-rose-400 whitespace-nowrap">
                    OVERLORD VITALITY · CIRCLE LV {worldState.werdnaLevel}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span
                      className="text-2xl font-bold font-mono text-white tabular-nums"
                      style={{ paintOrder: 'stroke fill' }}
                    >
                      {Math.round(worldState.werdnaHp)}
                    </span>
                    <span className="text-xs font-mono text-stone-400 tabular-nums">
                      / {worldState.werdnaMaxHp} HP
                    </span>
                  </div>
                </div>

                {/* 6 Code-Authored SVG Vitality Sockets (Full, Cracked, Empty) */}
                <div className="flex items-center gap-1" aria-label="Werdna Health Gems">
                  {Array.from({ length: totalSockets }).map((_, idx) => {
                    const thresholdFull = (idx + 0.75) * hpPerSocket;
                    const thresholdCracked = (idx + 0.15) * hpPerSocket;
                    const state =
                      worldState.werdnaHp >= thresholdFull
                        ? 'FULL'
                        : worldState.werdnaHp >= thresholdCracked
                        ? 'CRACKED'
                        : 'EMPTY';
                    return (
                      <svg
                        key={idx}
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        aria-hidden="true"
                      >
                        {/* Dark outer silhouette */}
                        <polygon
                          points="12,2 21,9 18,21 6,21 3,9"
                          fill="#120b18"
                          stroke="#4c3863"
                          strokeWidth="1.8"
                        />
                        {state !== 'EMPTY' && (
                          <polygon
                            points="12,4 19,9.5 16.5,19 7.5,19 5,9.5"
                            fill={state === 'FULL' ? '#e11d48' : '#f59e0b'}
                          />
                        )}
                        {state === 'FULL' && (
                          <polygon
                            points="12,5 16,9 12,11 8,9"
                            fill="#fda4af"
                            opacity="0.75"
                          />
                        )}
                        {state === 'CRACKED' && (
                          <path
                            d="M9,6 L13,12 L10,18"
                            stroke="#120b18"
                            strokeWidth="2"
                            fill="none"
                          />
                        )}
                      </svg>
                    );
                  })}
                </div>
              </div>

              {/* Continuous Health Bar with Delayed Trailing Damage Ghost Bar */}
              <div className="h-2 w-full bg-black/75 rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400/60 transition-transform duration-500 origin-left"
                  style={{
                    width: '100%',
                    transform: `scaleX(${Math.max(0, Math.min(1, worldState.werdnaPrevHp / worldState.werdnaMaxHp))})`
                  }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-rose-600 transition-transform duration-150 origin-left"
                  style={{
                    width: '100%',
                    transform: `scaleX(${Math.max(0, Math.min(1, worldState.werdnaHp / worldState.werdnaMaxHp))})`
                  }}
                />
              </div>

              {/* Hero-to-Kicker Secondary Counters */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#292038]">
                <div>
                  <div className="text-[10px] font-mono text-stone-400">ARCANE MANA</div>
                  <div className="text-base font-bold font-mono text-sky-400 tabular-nums">
                    {Math.round(worldState.werdnaMana)}/{worldState.werdnaMaxMana}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-stone-400">ESSENCE</div>
                  <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                    {Math.round(worldState.dreadEssence)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-stone-400">RELICS</div>
                  <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                    {worldState.relicsReclaimed.length}/{worldState.targetRelicsCount}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 pt-0.5">
                <span>FLOOR B{worldState.floor} · SARCOPHAGUS VAULT</span>
                <span className="text-amber-300">
                  {worldState.alignment.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Top-Right Cluster: Scrying Automap + Utility Controls */}
            <div className="pointer-events-auto flex items-start gap-2.5">
              {/* Live Scrying Automap */}
              <div className="bg-[#110d19]/92 border border-[#3a2d4f] rounded-xl p-3 shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[10px] font-mono tracking-wider text-amber-400">
                    SCRYING AUTOMAP · LIVE RAIDERS
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 tabular-nums">
                    ({worldState.playerX},{worldState.playerY})
                  </span>
                </div>

                <div
                  className="grid grid-cols-12 gap-[2px] bg-[#07050a] p-1.5 rounded border border-[#281f38]"
                  aria-label="Dungeon Scrying Automap"
                >
                  {worldState.grid.map((row, y) =>
                    row.map((tile, x) => {
                      const isPlayer =
                        worldState.playerX === x && worldState.playerY === y;
                      const nemesis = worldState.nemesisParties.find(
                        (p) => !p.defeated && p.x === x && p.y === y
                      );

                      let cellClass = 'bg-[#1a1426]';
                      if (tile === 'WALL') cellClass = 'bg-[#09070d]';
                      else if (tile === 'PENTAGRAM') cellClass = 'bg-rose-600';
                      else if (tile === 'TRAP_ARMED') cellClass = 'bg-orange-500';
                      else if (tile === 'RELIC_CHEST') cellClass = 'bg-amber-400';
                      else if (tile === 'STAIRS_UP') cellClass = 'bg-sky-400';

                      return (
                        <div
                          key={`${x}-${y}`}
                          className={`w-2.5 h-2.5 rounded-[1px] flex items-center justify-center ${cellClass}`}
                          title={`(${x},${y}) ${tile}`}
                        >
                          {isPlayer && (
                            <span className="block w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white" />
                          )}
                          {!isPlayer && nemesis && (
                            <span className="block w-2 h-2 rounded-full bg-yellow-300 ring-1 ring-black" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] font-mono text-stone-400">
                  <span>● Green: Werdna</span>
                  <span>● Gold: Crusaders</span>
                  <span>■ Red: Pentagram</span>
                </div>
              </div>

              {/* Compact Top-Right Utility SVG Buttons */}
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Remake Design Blueprint [I]"
                  title="5 Modern Remake Ideas [I]"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setShowCodexModal(true);
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#151020]/92 hover:bg-[#241b36] border border-amber-500/40 text-amber-300 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
                  </svg>
                </button>

                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
                  title="Mute / Unmute [M]"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setMuted((m) => {
                      const next = !m;
                      soundEngine.muted = next;
                      return next;
                    });
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#151020]/92 hover:bg-[#241b36] border border-[#3a2d4f] text-stone-200 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    {muted ? (
                      <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                    ) : (
                      <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                    )}
                  </svg>
                </button>

                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Pause Game [P]"
                  title="Pause Game [P]"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setWorldState((prev) => ({
                      ...prev,
                      phase: prev.phase === 'paused' ? 'playing' : 'paused'
                    }));
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#151020]/92 hover:bg-[#241b36] border border-[#3a2d4f] text-stone-200 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </button>

                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Restart Floor [R]"
                  title="Restart Floor [R]"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleRestartFloor();
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#151020]/92 hover:bg-[#241b36] border border-[#3a2d4f] text-stone-200 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM PERIMETER DOCK: Retinue Covens, Navigation & Lair Controls, Chronicle */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3">
            {/* Bottom-Left: Summoned Monster Retinue + Pentagram Summon Trigger */}
            <div className="pointer-events-auto bg-[#110d19]/92 border border-[#3a2d4f] rounded-xl p-3 shadow-xl flex flex-col gap-2 min-w-[320px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono tracking-wider text-stone-400">
                  SUMMONED MONSTER RETINUE (3 SLOTS)
                </span>
                <button
                  type="button"
                  onClick={() => setShowPentagramModal(true)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isOnPentagram
                      ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                      : 'bg-[#231b32] hover:bg-[#302544] text-rose-300 border border-rose-500/30'
                  }`}
                >
                  Pentagram Ritual [E]
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {worldState.retinue.map((coven) => {
                  const hpPct = Math.max(0, Math.min(100, Math.round((coven.hp / coven.maxHp) * 100)));
                  const roleShort = coven.role === 'ARCANE_CHOIR' ? 'CHOIR' : coven.role;
                  return (
                    <div
                      key={coven.id}
                      className="p-2 rounded-lg bg-[#181324] border border-[#2d243f]"
                    >
                      <div className="text-xs font-semibold text-white truncate">
                        {coven.name}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 tabular-nums mt-0.5 whitespace-nowrap">
                        {roleShort} · {Math.round(coven.hp)}/{coven.maxHp}
                      </div>
                      <div className="h-1.5 bg-black rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-500 transition-transform duration-150 origin-left"
                          style={{ transform: `scaleX(${hpPct / 100})` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom-Center: Dungeon Step/Turn Compass & Overlord Lair Abilities */}
            <div className="pointer-events-auto bg-[#110d19]/92 border border-[#3a2d4f] rounded-xl p-3 shadow-xl flex flex-wrap items-center gap-3">
              {/* Step & Turn Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMove('TURN_LEFT')}
                  className="px-3 py-2 text-xs font-semibold text-stone-200 bg-[#1e172c] hover:bg-[#2a213d] border border-[#3a2d4f] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Turn Left [A]
                </button>
                <button
                  type="button"
                  onClick={() => handleMove('FORWARD')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Step Forward [W]
                </button>
                <button
                  type="button"
                  onClick={() => handleMove('BACKWARD')}
                  className="px-3 py-2 text-xs font-semibold text-stone-200 bg-[#1e172c] hover:bg-[#2a213d] border border-[#3a2d4f] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Back [S]
                </button>
                <button
                  type="button"
                  onClick={() => handleMove('TURN_RIGHT')}
                  className="px-3 py-2 text-xs font-semibold text-stone-200 bg-[#1e172c] hover:bg-[#2a213d] border border-[#3a2d4f] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Turn Right [D]
                </button>
              </div>

              {/* Overlord Field Abilities */}
              <div className="flex items-center gap-1.5 border-l border-[#2c223d] pl-3">
                <button
                  type="button"
                  onClick={handleArmTrap}
                  className="px-3 py-2 text-xs font-semibold text-orange-300 bg-[#231722] hover:bg-[#332030] border border-orange-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Arm Spike Trap [1] · 8 Ess
                </button>
                <button
                  type="button"
                  onClick={handleEngageNearestParty}
                  className="px-3 py-2 text-xs font-semibold text-amber-300 bg-[#241c24] hover:bg-[#332733] border border-amber-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Clash Crusaders [2]
                </button>
              </div>
            </div>

            {/* Bottom-Right: Compact Dungeon Chronicle */}
            <div className="pointer-events-auto bg-[#110d19]/92 border border-[#3a2d4f] rounded-xl p-3 shadow-xl max-w-sm w-full">
              <div className="text-[10px] font-mono tracking-wider text-stone-400 mb-1">
                LAIR CHRONICLE · TURN {worldState.turnCount}
              </div>
              <div className="space-y-1">
                {worldState.combatLog.slice(0, 2).map((line, idx) => (
                  <p
                    key={idx}
                    className={`text-xs font-mono leading-snug truncate ${
                      idx === 0 ? 'text-stone-100' : 'text-stone-400'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. INTERACTIVE MODALS (Design Blueprint, Pentagram, Combat, Pause/End)
         ===================================================================== */}
      {showCodexModal && (
        <DesignCodexModal
          onClose={() => setShowCodexModal(false)}
          onTryPillarAction={handleTryPillarAction}
        />
      )}

      {showPentagramModal && (
        <PentagramModal
          worldState={worldState}
          onConfirmRitual={handleConfirmPentagram}
          onClose={() => setShowPentagramModal(false)}
        />
      )}

      {worldState.activeCombatPartyId && worldState.phase === 'playing' && (
        <CombatModal
          worldState={worldState}
          onCastSpell={handleCastCombatSpell}
          onSpareOrRetreat={handleSpareRetreat}
        />
      )}

      <StatusModal
        worldState={worldState}
        onResume={() => setWorldState((prev) => ({ ...prev, phase: 'playing' }))}
        onRestart={handleRestartFloor}
        onReturnTitle={handleReturnTitle}
        onOpenCodex={() => setShowCodexModal(true)}
      />
    </main>
  );
}
