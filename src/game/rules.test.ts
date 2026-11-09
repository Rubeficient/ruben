import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GameWorldState,
  createInitialGameState,
  stepDungeonSimulation,
  performPentagramRitual,
  armFieldTrapInFront,
  executeCombatRound,
  computeNemesisNextMove,
  resolveCosmicAlignment,
  isWalkable
} from './rules';

test('initial state spawns Werdna on an open path facing North with >= 2 walkable tiles ahead', () => {
  const state = createInitialGameState();
  assert.equal(state.playerX, 6);
  assert.equal(state.playerY, 10);
  assert.equal(state.playerFacing, 0);
  assert.equal(isWalkable(state.grid, state.playerX, state.playerY - 1), true);
  assert.equal(isWalkable(state.grid, state.playerX + 1, state.playerY - 1), true);
  assert.equal(state.retinue.length, 3);
});

test('pentagram ritual updates retinue covens and restores Werdna HP/Mana', () => {
  const initial = createInitialGameState();
  const damaged = { ...initial, werdnaHp: 12, werdnaMana: 3, relicsReclaimed: ['Shard 1'] };
  const updated = performPentagramRitual(damaged, [
    'obsidian-gargoyles',
    'hellhound-pack',
    'void-seraphs'
  ]);
  assert.equal(updated.werdnaLevel, 2);
  assert.equal(updated.werdnaHp, updated.werdnaMaxHp);
  assert.equal(updated.werdnaMana, updated.werdnaMaxMana);
  assert.equal(updated.retinue[0].id, 'obsidian-gargoyles');
  assert.equal(updated.retinue[1].id, 'hellhound-pack');
  assert.equal(updated.retinue[2].id, 'void-seraphs');
});

test('armFieldTrapInFront places an armed trap tile ahead and consumes Dread Essence', () => {
  const state: GameWorldState = { ...createInitialGameState(), phase: 'playing' };
  const trapped = armFieldTrapInFront(state);
  assert.equal(trapped.dreadEssence, state.dreadEssence - 8);
  assert.equal(trapped.grid[state.playerY - 1][state.playerX], 'TRAP_ARMED');
});

test('3 Nemesis AI policies produce distinct valid dungeon moves', () => {
  const state: GameWorldState = { ...createInitialGameState(), phase: 'playing' };
  for (const party of state.nemesisParties) {
    const next = computeNemesisNextMove(party, state);
    assert.equal(isWalkable(state.grid, next.x, next.y), true);
  }
});

test('combat round resolves spells, retinue attacks, and reachable defeat/victory states', () => {
  let state: GameWorldState = {
    ...createInitialGameState(),
    phase: 'playing',
    activeCombatPartyId: 'party-tomb-seekers'
  };

  // Cast MAHALITO
  state = executeCombatRound(state, 'mahalito');
  const targetParty = state.nemesisParties.find((p) => p.id === 'party-tomb-seekers')!;
  assert.equal(targetParty.members[0].hp < targetParty.members[0].maxHp, true);

  // Verify reachable defeat when Werdna has 1 HP and no retinue
  const fragileState = {
    ...createInitialGameState(),
    phase: 'playing' as const,
    werdnaHp: 1,
    retinue: [],
    activeCombatPartyId: 'party-tomb-seekers'
  };
  const defeatedState = executeCombatRound(fragileState, 'halito');
  assert.equal(defeatedState.phase, 'gameover');
  assert.equal(defeatedState.outcome, 'DEFEAT');
  assert.equal(defeatedState.werdnaHp, 0);
});

test('cosmic alignment shifts based on vengeance vs mercy actions', () => {
  assert.equal(resolveCosmicAlignment(4, 1), 'VENGEANCE');
  assert.equal(resolveCosmicAlignment(1, 4), 'TWILIGHT_MERCY');
  assert.equal(resolveCosmicAlignment(2, 2), 'COSMIC_BALANCE');
});

test('stepping forward advances Werdna and increments turn count', () => {
  const state = { ...createInitialGameState(), phase: 'playing' as const };
  const stepped = stepDungeonSimulation(state, 'FORWARD');
  assert.equal(stepped.playerY, state.playerY - 1);
  assert.equal(stepped.turnCount, 1);
});
