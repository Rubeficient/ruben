import React, { useState } from 'react';
import {
  GameWorldState,
  MONSTER_COVENS,
  REMAKE_PILLARS,
  WERDNA_SPELLS
} from '../game/rules';

// Generated Key Art paths from Phase 1 generate_image batch
const PENTAGRAM_ART_URL = '/src/assets/images/pentagram_ritual_art_1794200061666.jpg';
const CRUSADERS_ART_URL = '/src/assets/images/nemesis_crusaders_art_1794200062024.jpg';

interface DesignCodexModalProps {
  onClose: () => void;
  onTryPillarAction: (pillarId: string) => void;
}

export const DesignCodexModal: React.FC<DesignCodexModalProps> = ({
  onClose,
  onTryPillarAction
}) => {
  const [selectedId, setSelectedId] = useState<string>(REMAKE_PILLARS[0].id);
  const current = REMAKE_PILLARS.find((p) => p.id === selectedId) ?? REMAKE_PILLARS[0];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="codex-modal-title"
    >
      <div className="w-full max-w-4xl bg-[#110e18] border border-[#3d3152] rounded-xl shadow-2xl overflow-hidden text-[#ece8f4]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292138] bg-[#161220]">
          <div>
            <p className="text-xs font-mono tracking-wider text-amber-400">
              MODERN REMAKE ARCHITECTURE · WIZARDRY IV: THE RETURN OF WERDNA
            </p>
            <h2 id="codex-modal-title" className="text-xl font-bold font-display text-white mt-0.5">
              5 Core Ideas for a Modern Wizardry IV Remake
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-200 bg-[#251e33] hover:bg-[#322845] rounded-lg border border-[#3d3152] transition-colors whitespace-nowrap shrink-0"
          >
            Close Blueprint
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
          {/* Pillar Selector Tabs */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-[#292138] p-4 space-y-2 bg-[#0d0b13]">
            {REMAKE_PILLARS.map((pillar) => {
              const active = pillar.id === current.id;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setSelectedId(pillar.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors border ${
                    active
                      ? 'bg-[#231b32] border-rose-500/70 text-white'
                      : 'bg-transparent border-transparent text-stone-400 hover:bg-[#181322] hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-rose-400 tabular-nums">
                      {pillar.number}.
                    </span>
                    <span className="text-sm font-semibold leading-snug">{pillar.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pillar Deep-Dive Content */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-rose-400">
                  PILLAR {current.number} · REVERSE-DUNGEON DESIGN
                </span>
                <h3 className="text-2xl font-bold font-display text-white mt-1">
                  {current.title}
                </h3>
              </div>

              <div className="p-4 rounded-lg bg-[#181322] border border-[#2d243d] space-y-1.5">
                <p className="text-xs font-semibold text-stone-400">
                  1987 Apple II Original Friction
                </p>
                <p className="text-sm text-stone-300 leading-relaxed">
                  {current.classic1987PainPoint}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#1a1426] border border-emerald-500/30 space-y-1.5">
                <p className="text-xs font-semibold text-emerald-400">
                  Modern Remake Vision
                </p>
                <p className="text-sm text-stone-100 leading-relaxed">
                  {current.modernSolution}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#14101d] border border-amber-500/30">
                <p className="text-xs text-amber-300 leading-relaxed">
                  <strong className="font-semibold">Live in this Vertical Slice: </strong>
                  {current.playableInPrototype}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#292138]">
              <button
                type="button"
                onClick={() => onTryPillarAction(current.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Test This Feature in Live Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PentagramModalProps {
  worldState: GameWorldState;
  onConfirmRitual: (selectedIds: string[]) => void;
  onClose: () => void;
}

export const PentagramModal: React.FC<PentagramModalProps> = ({
  worldState,
  onConfirmRitual,
  onClose
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    worldState.retinue.map((r) => r.id)
  );
  const [imgError, setImgError] = useState(false);

  const toggleCoven = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds([...selectedIds.slice(1), id]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pentagram-modal-title"
    >
      <div className="w-full max-w-4xl bg-[#110d18] border border-rose-500/40 rounded-xl shadow-2xl overflow-hidden text-[#ece8f4]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Key Art Column */}
          <div className="lg:col-span-5 relative bg-[#1c1326] min-h-[260px] flex flex-col justify-end overflow-hidden">
            {!imgError ? (
              <img
                src={PENTAGRAM_ART_URL}
                alt="Crimson Pentagram Summoning Altar"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-cover object-center scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-[#181124] to-black" />
            )}
            <div className="relative z-10 p-5 pt-14 bg-gradient-to-t from-[#09070e] via-[#09070e]/90 to-transparent">
              <p className="text-xs font-mono font-semibold text-rose-400">
                CRIMSON PENTAGRAM ALTAR · FLOOR B{worldState.floor}
              </p>
              <h2 id="pentagram-modal-title" className="text-2xl font-bold font-display text-white mt-1">
                Bind Your Monster Retinue
              </h2>
              <p className="text-xs text-stone-200 mt-1.5 leading-relaxed">
                Select up to 3 Monster Covens to guard Werdna and channel full Vitality and Arcane Mana restoration.
              </p>
            </div>
          </div>

          {/* Right Coven Roster Column */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-300 tabular-nums">
                Selected Covens: {selectedIds.length} / 3 Slots
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs font-medium text-stone-300 hover:text-white bg-[#231c30] rounded-md whitespace-nowrap shrink-0"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {MONSTER_COVENS.map((coven) => {
                const isSelected = selectedIds.includes(coven.id);
                const roleLabel = coven.role === 'ARCANE_CHOIR' ? 'CHOIR' : coven.role;
                return (
                  <button
                    key={coven.id}
                    type="button"
                    onClick={() => toggleCoven(coven.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[#26192e] border-rose-500 text-white'
                        : 'bg-[#171321] border-[#2c233d] text-stone-300 hover:border-stone-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-white truncate">{coven.name}</span>
                      <span className="text-[11px] font-mono text-rose-300 tabular-nums shrink-0">
                        {roleLabel}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-stone-400 mt-1 tabular-nums">
                      HP {coven.maxHp} · ATK {coven.attack} · DEF {coven.defense}
                    </div>
                    <p className="text-xs text-amber-300/90 mt-1.5 leading-snug">
                      {coven.passiveName}: {coven.passiveDesc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#292138]">
              <div className="text-xs text-stone-400">
                Restores Werdna to <strong className="text-emerald-400">100% HP & Mana</strong>
              </div>
              <button
                type="button"
                onClick={() => onConfirmRitual(selectedIds)}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Complete Pentagram Ritual
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CombatModalProps {
  worldState: GameWorldState;
  onCastSpell: (spellId: string, targetIndex: number) => void;
  onSpareOrRetreat: () => void;
}

export const CombatModal: React.FC<CombatModalProps> = ({
  worldState,
  onCastSpell,
  onSpareOrRetreat
}) => {
  const [selectedTargetIdx, setSelectedTargetIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const party = worldState.nemesisParties.find(
    (p) => p.id === worldState.activeCombatPartyId
  );
  if (!party) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="combat-modal-title"
    >
      <div className="w-full max-w-5xl bg-[#100d17] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden text-[#ece8f4]">
        {/* Top Encounter Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#181324] border-b border-[#2c233d]">
          <div>
            <span className="text-xs font-mono text-amber-400 tabular-nums">
              REVERSE-BOSS ENCOUNTER · ROUND {worldState.combatRound} · RELIC AT STAKE: {party.relicHeld}
            </span>
            <h2 id="combat-modal-title" className="text-xl font-bold font-display text-white">
              {party.name} — {party.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onSpareOrRetreat}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Invoke Twilight Truce (Mercy Retreat)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 p-5 gap-5">
          {/* Enemy Adventurer Formation (Left 6 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative h-40 rounded-lg overflow-hidden border border-[#2e2440] bg-[#1a1528]">
              {!imgError && (
                <img
                  src={CRUSADERS_ART_URL}
                  alt={party.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-3">
                <span className="text-xs text-stone-200">
                  Click an invading Hero below to focus Werdna’s single-target spells.
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {party.members.map((hero, idx) => {
                const isDead = hero.hp <= 0;
                const isTargeted = idx === selectedTargetIdx && !isDead;
                const hpPct = Math.max(0, Math.min(100, Math.round((hero.hp / hero.maxHp) * 100)));

                return (
                  <button
                    key={hero.id}
                    type="button"
                    disabled={isDead}
                    onClick={() => setSelectedTargetIdx(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isDead
                        ? 'bg-[#120f19] border-[#221c2e] opacity-45'
                        : isTargeted
                        ? 'bg-[#251c33] border-amber-400'
                        : 'bg-[#181322] border-[#2c233d] hover:border-stone-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{hero.name}</span>
                        <span className="text-xs text-stone-400">· {hero.className}</span>
                        {hero.isAsleep && (
                          <span className="text-xs font-mono text-purple-300">· ASLEEP</span>
                        )}
                        {hero.isFeared && (
                          <span className="text-xs font-mono text-amber-300">· FEARED</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-rose-300 tabular-nums">
                        {isDead
                          ? 'VANQUISHED'
                          : `TELEGRAPH: ${hero.intent.replace('_', ' ')} (${hero.intentDamage})`}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-transform duration-150 origin-left"
                          style={{ transform: `scaleX(${hpPct / 100})` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-stone-300 tabular-nums w-16 text-right">
                        {Math.round(hero.hp)}/{hero.maxHp}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Werdna's Grimoire & Summoned Vanguard (Right 6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {/* Werdna & Retinue Status */}
            <div className="p-3.5 rounded-lg bg-[#161221] border border-[#2c233d] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-400">
                  OVERLORD WERDNA (LV {worldState.werdnaLevel}) & ACTIVE RETINUE
                </span>
                <span className="text-xs font-mono text-sky-300 tabular-nums">
                  HP {Math.round(worldState.werdnaHp)}/{worldState.werdnaMaxHp} · MANA {Math.round(worldState.werdnaMana)}/{worldState.werdnaMaxMana}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {worldState.retinue.map((coven) => {
                  const pct = Math.max(0, Math.min(100, Math.round((coven.hp / coven.maxHp) * 100)));
                  return (
                    <div
                      key={coven.id}
                      className="p-2 rounded bg-[#0f0c17] border border-[#261e36]"
                    >
                      <div className="text-xs font-semibold text-white truncate">{coven.name}</div>
                      <div className="text-[11px] font-mono text-stone-400 tabular-nums mt-0.5">
                        HP {Math.round(coven.hp)}/{coven.maxHp}
                      </div>
                      <div className="h-1.5 bg-black rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-500 transition-transform duration-150 origin-left"
                          style={{ transform: `scaleX(${pct / 100})` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Werdna's Classic Spellbook */}
            <div className="space-y-2">
              <p className="text-xs font-mono text-stone-400">
                CAST CLASSIC WIZARDRY INCANTATION (TRIGGERS COMBAT ROUND)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WERDNA_SPELLS.map((spell) => {
                  const canAfford = worldState.werdnaMana >= spell.manaCost;
                  return (
                    <button
                      key={spell.id}
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onCastSpell(spell.id, selectedTargetIdx)}
                      className={`text-left p-2.5 rounded-lg border transition-colors ${
                        canAfford
                          ? 'bg-[#1d162b] hover:bg-[#281e3b] border-[#3d2f57] text-white'
                          : 'bg-[#120e1a] border-[#221b30] opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-rose-400">
                          {spell.classicName}
                        </span>
                        <span className="font-mono text-xs text-sky-300 tabular-nums">
                          {spell.manaCost} MP
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-stone-100 mt-0.5">
                        {spell.modernTitle}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                        {spell.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Combat Chronicle */}
            <div className="p-3 rounded-lg bg-[#0b0910] border border-[#241d33] max-h-24 overflow-y-auto space-y-1">
              {worldState.combatLog.slice(0, 3).map((entry, i) => (
                <p key={i} className="text-xs font-mono text-stone-300 leading-snug">
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatusModalProps {
  worldState: GameWorldState;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenCodex: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  worldState,
  onResume,
  onRestart,
  onReturnTitle,
  onOpenCodex
}) => {
  if (worldState.phase !== 'paused' && worldState.phase !== 'gameover') {
    return null;
  }

  const isPaused = worldState.phase === 'paused';
  const isVictory = worldState.outcome === 'VICTORY';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
    >
      <div className="w-full max-w-md bg-[#120e1a] border border-[#3e3154] rounded-xl p-6 shadow-2xl text-center space-y-5">
        <div>
          <p className="text-xs font-mono tracking-wider text-rose-400">
            {isPaused
              ? 'SANCTUM MEDITATION · SIMULATION PAUSED'
              : isVictory
              ? 'OVERLORD ASCENDED · STAGE CLEAR'
              : 'CORPOREAL VESSEL SHATTERED · DEFEAT'}
          </p>
          <h2 id="status-modal-title" className="text-3xl font-bold font-display text-white mt-1">
            {isPaused
              ? 'Labyrinth Paused'
              : isVictory
              ? 'The Return of Werdna'
              : 'Entombed Once More'}
          </h2>
          <p className="text-sm text-stone-300 mt-2">
            {isPaused
              ? 'Review the modern remake blueprint or resume your ascent from Floor B10.'
              : isVictory
              ? `Werdna ascends toward the surface temple under the ${worldState.alignment.replace('_', ' ')} alignment!`
              : 'The invading Crusaders drove Werdna’s spirit back into the obsidian Sarcophagus.'}
          </p>
        </div>

        {/* 3 Tabular-Nums Mastery / Progress Stat Tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg bg-[#1a1426] border border-[#2e2440]">
            <div className="text-[11px] font-mono text-stone-400">RELICS</div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-0.5">
              {worldState.relicsReclaimed.length}/{worldState.targetRelicsCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1426] border border-[#2e2440]">
            <div className="text-[11px] font-mono text-stone-400">TURNS</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
              {worldState.turnCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1426] border border-[#2e2440]">
            <div className="text-[11px] font-mono text-stone-400">VANQUISHED</div>
            <div className="text-xl font-bold font-mono text-rose-400 tabular-nums mt-0.5">
              {worldState.enemiesVanquished}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isPaused ? (
            <button
              type="button"
              onClick={onResume}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Resume Game
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {isVictory ? 'Play Again' : 'Try Again'}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCodex}
            className="w-full py-2 px-4 text-xs font-semibold text-amber-300 bg-[#221a30] hover:bg-[#2d2340] border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            View 5 Modern Remake Ideas
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onRestart}
              className="py-2 px-3 text-xs font-medium text-stone-300 bg-[#1a1524] hover:bg-[#251e33] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Restart Floor
            </button>
            <button
              type="button"
              onClick={onReturnTitle}
              className="py-2 px-3 text-xs font-medium text-stone-300 bg-[#1a1524] hover:bg-[#251e33] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Title Screen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
