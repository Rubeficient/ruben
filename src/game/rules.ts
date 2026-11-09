export type Direction = 0 | 1 | 2 | 3; // 0: North, 1: East, 2: South, 3: West

export type TileType =
  | 'WALL'
  | 'FLOOR'
  | 'SARCOPHAGUS'
  | 'PENTAGRAM'
  | 'TRAP_ARMED'
  | 'TRAP_SPRUNG'
  | 'RELIC_CHEST'
  | 'TELEPORTER'
  | 'SECRET_DOOR'
  | 'STAIRS_UP';

export type CosmicAlignment = 'VENGEANCE' | 'COSMIC_BALANCE' | 'TWILIGHT_MERCY';

export type CovenRole = 'VANGUARD' | 'FLANKER' | 'ARCANE_CHOIR';

export interface MonsterCovenTemplate {
  id: string;
  name: string;
  tier: number;
  role: CovenRole;
  maxHp: number;
  attack: number;
  defense: number;
  passiveName: string;
  passiveDesc: string;
  accentColor: string;
  glyph: string;
}

export interface ActiveCoven extends MonsterCovenTemplate {
  hp: number;
  prevHp: number; // for trailing ghost bar
  status?: 'WARDED' | 'FRENZIED' | 'STUNNED';
}

export interface WerdnaSpell {
  id: string;
  classicName: string;
  modernTitle: string;
  manaCost: number;
  circle: number;
  targetType: 'SINGLE_HERO' | 'ALL_HEROES' | 'RETINUE_BUFF' | 'DARK_PACT';
  basePower: number;
  description: string;
  alignmentShift?: CosmicAlignment;
}

export type HeroArchetypePolicy = 'CRUSADER_HUNTER' | 'RELIC_SEEKER' | 'SANCTUM_KITER';

export interface HeroMember {
  id: string;
  name: string;
  className: 'Paladin' | 'Lord' | 'Bishop' | 'Samurai' | 'Rogue' | 'Archmage';
  hp: number;
  maxHp: number;
  attack: number;
  magicResist: number;
  intent: 'STRIKE' | 'HOLY_SMITE' | 'HEAL_PARTY' | 'BACKSTAB' | 'BANISH_UNDEAD';
  intentDamage: number;
  isAsleep?: boolean;
  isFeared?: boolean;
}

export interface NemesisParty {
  id: string;
  name: string;
  title: string;
  policy: HeroArchetypePolicy;
  x: number;
  y: number;
  facing: Direction;
  relicHeld: string;
  paletteColor: string;
  members: HeroMember[];
  defeated: boolean;
  stunnedTurns: number;
}

export interface RemakePillarIdea {
  id: string;
  number: string;
  title: string;
  classic1987PainPoint: string;
  modernSolution: string;
  playableInPrototype: string;
}

export interface GameWorldState {
  phase: 'title' | 'playing' | 'paused' | 'gameover';
  outcome: 'NONE' | 'VICTORY' | 'DEFEAT';
  floor: number; // B10 ascending
  playerX: number;
  playerY: number;
  playerFacing: Direction;
  werdnaHp: number;
  werdnaMaxHp: number;
  werdnaPrevHp: number;
  werdnaMana: number;
  werdnaMaxMana: number;
  dreadEssence: number;
  werdnaLevel: number;
  alignment: CosmicAlignment;
  vengeanceScore: number;
  mercyScore: number;
  relicsReclaimed: string[];
  targetRelicsCount: number;
  turnCount: number;
  damageTakenTotal: number;
  enemiesVanquished: number;
  retinue: ActiveCoven[];
  grid: TileType[][];
  explored: boolean[][];
  nemesisParties: NemesisParty[];
  activeCombatPartyId: string | null;
  combatRound: number;
  combatLog: string[];
}

export const REMAKE_PILLARS: RemakePillarIdea[] = [
  {
    id: 'lair-architect',
    number: '01',
    title: 'Active Lair Manipulation & Scrying Blueprint',
    classic1987PainPoint:
      'In 1987, Werdna had to wander blind teleporter mazes on paper graph grids while over-leveled raiders randomly ambushed him.',
    modernSolution:
      'As the dungeon’s true architect, Werdna commands a live Scrying Automap showing roaming Hero Parties in real time. Spend Dread Essence to arm Blood Spike traps, pulse Decoy Beacons, or seal secret doors before engaging.',
    playableInPrototype:
      'Use the Scrying Map (top-right) or Field Trap abilities [1-3] to arm floor traps in front of marching Crusaders and stun/damage them prior to combat.'
  },
  {
    id: 'pentagram-synergy',
    number: '02',
    title: 'Tactical Pentagram Rituals & Coven Synergies',
    classic1987PainPoint:
      'Summoning at a Pentagram in classic Wizardry IV gave RNG monster stacks that either died instantly or couldn’t cast useful spells.',
    modernSolution:
      'Pentagrams become tactical deckbuilding altars. Draft 3 specialized Covens—Vanguard Tanks, Flank Assassins, and Arcane Choirs—whose passives amplify Werdna’s classic incantations (HALITO, KATINO, MORLIS, TILTOWAIT).',
    playableInPrototype:
      'Step onto any glowing Crimson Pentagram and press [E] to open the Summoning Grimoire, level up Werdna, and customize your 3-slot Monster Retinue.'
  },
  {
    id: 'nemesis-raiders',
    number: '03',
    title: 'Living Nemesis Raider Parties with Distinct AI',
    classic1987PainPoint:
      'Original hero encounters were random stat walls taken from user floppy disks without visible map presence or telegraphing.',
    modernSolution:
      'Named Adventurer Crusades physically roam the corridors with 3 distinct behavior policies: Crusader Hunters (stalk Werdna), Relic Seekers (patrol treasure vaults), and Sanctum Kiters (guard the exit stairs). Each telegraphs its combat intent clearly.',
    playableInPrototype:
      'Watch 3 distinct Hero Parties move across the dungeon on every step, carrying the 3 stolen Shards of Werdna’s Amulet needed to unlock the Ascension Stairs.'
  },
  {
    id: 'sacrificial-combat',
    number: '04',
    title: 'Overlord Reverse-Boss Combat & Dark Pacts',
    classic1987PainPoint:
      'At low levels Werdna had 1 spell cast and sat helplessly in the back row while Paladins decimated his summon rows.',
    modernSolution:
      'Turn-based tactical clashes with visible Hero Intent telegraphs. Werdna can weave classic spells, command his Retinue to intercept lethal Holy Smites, or invoke a Dark Pact to sacrifice a weakened minion for explosive AoE mana and damage.',
    playableInPrototype:
      'Clash with any Nemesis Party to enter the Tactical Encounter view, inspect each Hero’s telegraphed move, and cast classic Wizardry spells.'
  },
  {
    id: 'cosmic-alignment',
    number: '05',
    title: 'Dynamic Cosmic Alignment & Multi-Path Ascension',
    classic1987PainPoint:
      'Unlocking the secret Grand Master / Good ending in 1987 required obscure hidden items and zero accidental kills with no UI feedback.',
    modernSolution:
      'Every tactical choice—sacrificing minions (Chaotic Vengeance), outmaneuvering via traps (Cosmic Balance), or sparing defeated knights after reclaiming your relics (Twilight Mercy)—shifts your Cosmic Alignment and unlocks distinct endings.',
    playableInPrototype:
      'Choose whether to Obliterate or Spare defeated Crusader parties after battle to shift your Cosmic Alignment gauge.'
  }
];

export const MONSTER_COVENS: MonsterCovenTemplate[] = [
  {
    id: 'graveguard-legion',
    name: 'Graveguard Legion',
    tier: 1,
    role: 'VANGUARD',
    maxHp: 58,
    attack: 11,
    defense: 6,
    passiveName: 'Phalanx of Bone',
    passiveDesc: 'Intercepts 45% of physical strikes aimed at Werdna.',
    accentColor: '#38bdf8',
    glyph: '🛡'
  },
  {
    id: 'obsidian-gargoyles',
    name: 'Obsidian Gargoyles',
    tier: 1,
    role: 'VANGUARD',
    maxHp: 72,
    attack: 9,
    defense: 9,
    passiveName: 'Stone Skins',
    passiveDesc: 'Reduces incoming Holy & Physical damage by 4 per hit.',
    accentColor: '#a8a29e',
    glyph: '🗿'
  },
  {
    id: 'shade-stalkers',
    name: 'Shade Stalkers',
    tier: 1,
    role: 'FLANKER',
    maxHp: 42,
    attack: 17,
    defense: 3,
    passiveName: 'Ambush Slumber',
    passiveDesc: 'Deals +50% critical damage to Sleeping or Feared heroes.',
    accentColor: '#c084fc',
    glyph: '🗡'
  },
  {
    id: 'hellhound-pack',
    name: 'Cinder Hellhounds',
    tier: 2,
    role: 'FLANKER',
    maxHp: 50,
    attack: 19,
    defense: 4,
    passiveName: 'Brimstone Resonance',
    passiveDesc: 'Boosts Werdna’s HALITO and MAHALITO fire spells by +35%.',
    accentColor: '#fb923c',
    glyph: '🔥'
  },
  {
    id: 'necro-acolytes',
    name: 'Necro-Choir Acolytes',
    tier: 1,
    role: 'ARCANE_CHOIR',
    maxHp: 38,
    attack: 12,
    defense: 4,
    passiveName: 'Siphon Chant',
    passiveDesc: 'Restores 3 Arcane Mana to Werdna at the end of each combat round.',
    accentColor: '#34d399',
    glyph: '👁'
  },
  {
    id: 'void-seraphs',
    name: 'Void Seraphim',
    tier: 2,
    role: 'ARCANE_CHOIR',
    maxHp: 46,
    attack: 15,
    defense: 5,
    passiveName: 'Dread Chorus',
    passiveDesc: 'Lowers all Hero magic resistance by 20% and amplifies TILTOWAIT.',
    accentColor: '#f43f5e',
    glyph: '✦'
  }
];

export const WERDNA_SPELLS: WerdnaSpell[] = [
  {
    id: 'halito',
    classicName: 'HALITO',
    modernTitle: 'Soul Ember Bolt',
    manaCost: 4,
    circle: 1,
    targetType: 'SINGLE_HERO',
    basePower: 18,
    description: 'Sears the lead enemy hero with concentrated grave-fire.'
  },
  {
    id: 'katino',
    classicName: 'KATINO',
    modernTitle: 'Slumber Miasma',
    manaCost: 5,
    circle: 1,
    targetType: 'ALL_HEROES',
    basePower: 8,
    description: 'Blankets the hero party in narcotic fog, putting vulnerable foes to sleep and cancelling their strike.',
    alignmentShift: 'TWILIGHT_MERCY'
  },
  {
    id: 'mahalito',
    classicName: 'MAHALITO',
    modernTitle: 'Abyssal Firestorm',
    manaCost: 9,
    circle: 2,
    targetType: 'ALL_HEROES',
    basePower: 16,
    description: 'Detonates a pillar of crimson hellfire across the entire adventurer formation.'
  },
  {
    id: 'morlis',
    classicName: 'MORLIS',
    modernTitle: 'Dread Ward & Terror',
    manaCost: 7,
    circle: 2,
    targetType: 'RETINUE_BUFF',
    basePower: 14,
    description: 'Fortifies your Summoned Retinue with +14 HP bone-plates and inflicts Fear on enemy heroes.',
    alignmentShift: 'COSMIC_BALANCE'
  },
  {
    id: 'dark-pact',
    classicName: 'KADORTO INVERTED',
    modernTitle: 'Blood Sacrifice Pact',
    manaCost: 0,
    circle: 2,
    targetType: 'DARK_PACT',
    basePower: 26,
    description: 'Drains 12 HP from your front Coven to restore +12 Mana to Werdna and blast all heroes with necrotic shrapnel.',
    alignmentShift: 'VENGEANCE'
  },
  {
    id: 'tiltowait',
    classicName: 'TILTOWAIT',
    modernTitle: 'Cataclysm of the Mad Overlord',
    manaCost: 15,
    circle: 3,
    targetType: 'ALL_HEROES',
    basePower: 30,
    description: 'The ultimate Wizardry incantation. Unlocks at Werdna Level 2+ to vaporize entire crusades.'
  }
];

// 12x12 Dungeon Floor B10: The Sarcophagus Vault & Inner Labyrinth
// Corridors are >= 2 tiles wide around spawn so Werdna spawns on an open path facing North (clear vista)
const RAW_MAP_ROWS = [
  '############',
  '#U..P..R...#',
  '#..##..##..#',
  '#..##..##..#',
  '#R....T...P#',
  '#..##..##..#',
  '#..##..##..#',
  '#...P..T..R#',
  '#..##......#',
  '#..##..P...#',
  '#.....S....#',
  '############'
];

export function parseInitialGrid(): TileType[][] {
  return RAW_MAP_ROWS.map((row) =>
    row.split('').map((ch): TileType => {
      switch (ch) {
        case '#':
          return 'WALL';
        case 'S':
          return 'SARCOPHAGUS';
        case 'P':
          return 'PENTAGRAM';
        case 'T':
          return 'TRAP_ARMED';
        case 'R':
          return 'RELIC_CHEST';
        case 'U':
          return 'STAIRS_UP';
        default:
          return 'FLOOR';
      }
    })
  );
}

export function createInitialNemesisParties(): NemesisParty[] {
  return [
    {
      id: 'party-silver-chalice',
      name: 'The Silver Chalice',
      title: 'Inquisitors of Llylgamyn',
      policy: 'CRUSADER_HUNTER',
      x: 7,
      y: 7,
      facing: 2,
      relicHeld: 'Crimson Core of Werdna',
      paletteColor: '#f59e0b',
      defeated: false,
      stunnedTurns: 0,
      members: [
        {
          id: 'h-valen',
          name: 'Sir Valen',
          className: 'Paladin',
          hp: 44,
          maxHp: 44,
          attack: 11,
          magicResist: 15,
          intent: 'HOLY_SMITE',
          intentDamage: 12
        },
        {
          id: 'h-eliora',
          name: 'Bishop Eliora',
          className: 'Bishop',
          hp: 32,
          maxHp: 32,
          attack: 8,
          magicResist: 25,
          intent: 'HEAL_PARTY',
          intentDamage: 10
        },
        {
          id: 'h-kestrel',
          name: 'Kestrel the Swift',
          className: 'Rogue',
          hp: 28,
          maxHp: 28,
          attack: 13,
          magicResist: 10,
          intent: 'BACKSTAB',
          intentDamage: 13
        }
      ]
    },
    {
      id: 'party-tomb-seekers',
      name: 'Gilded Delvers',
      title: 'Relic Plunderers',
      policy: 'RELIC_SEEKER',
      x: 2,
      y: 4,
      facing: 1,
      relicHeld: 'Obsidian Signet Ring',
      paletteColor: '#38bdf8',
      defeated: false,
      stunnedTurns: 0,
      members: [
        {
          id: 'h-musashi',
          name: 'Ronin Kaito',
          className: 'Samurai',
          hp: 48,
          maxHp: 48,
          attack: 14,
          magicResist: 15,
          intent: 'STRIKE',
          intentDamage: 14
        },
        {
          id: 'h-lyra',
          name: 'Magus Lyra',
          className: 'Archmage',
          hp: 30,
          maxHp: 30,
          attack: 15,
          magicResist: 30,
          intent: 'BANISH_UNDEAD',
          intentDamage: 15
        }
      ]
    },
    {
      id: 'party-dawn-wardens',
      name: 'Wardens of the Stair',
      title: 'Overlord Sealers',
      policy: 'SANCTUM_KITER',
      x: 3,
      y: 1,
      facing: 1,
      relicHeld: 'Amulet Crown of Trebor',
      paletteColor: '#ec4899',
      defeated: false,
      stunnedTurns: 0,
      members: [
        {
          id: 'h-gideon',
          name: 'High Lord Gideon',
          className: 'Lord',
          hp: 56,
          maxHp: 56,
          attack: 15,
          magicResist: 25,
          intent: 'HOLY_SMITE',
          intentDamage: 16
        },
        {
          id: 'h-seraphina',
          name: 'Confessor Seraphina',
          className: 'Bishop',
          hp: 38,
          maxHp: 38,
          attack: 10,
          magicResist: 30,
          intent: 'BANISH_UNDEAD',
          intentDamage: 12
        },
        {
          id: 'h-thorne',
          name: 'Blade-Vow Thorne',
          className: 'Samurai',
          hp: 42,
          maxHp: 42,
          attack: 14,
          magicResist: 15,
          intent: 'STRIKE',
          intentDamage: 14
        }
      ]
    }
  ];
}

export function createInitialGameState(): GameWorldState {
  const grid = parseInitialGrid();
  const explored = grid.map((row) => row.map(() => false));
  const startX = 6;
  const startY = 10;

  // Reveal surrounding tiles at spawn
  revealAround(explored, startX, startY, 3);

  const defaultRetinue: ActiveCoven[] = [
    { ...MONSTER_COVENS[0], hp: MONSTER_COVENS[0].maxHp, prevHp: MONSTER_COVENS[0].maxHp },
    { ...MONSTER_COVENS[2], hp: MONSTER_COVENS[2].maxHp, prevHp: MONSTER_COVENS[2].maxHp },
    { ...MONSTER_COVENS[4], hp: MONSTER_COVENS[4].maxHp, prevHp: MONSTER_COVENS[4].maxHp }
  ];

  return {
    phase: 'title',
    outcome: 'NONE',
    floor: 10,
    playerX: startX,
    playerY: startY,
    playerFacing: 0, // North toward the Pentagram at (7,9) and open hall
    werdnaHp: 45,
    werdnaMaxHp: 45,
    werdnaPrevHp: 45,
    werdnaMana: 24,
    werdnaMaxMana: 24,
    dreadEssence: 30,
    werdnaLevel: 1,
    alignment: 'COSMIC_BALANCE',
    vengeanceScore: 0,
    mercyScore: 0,
    relicsReclaimed: [],
    targetRelicsCount: 3,
    turnCount: 0,
    damageTakenTotal: 0,
    enemiesVanquished: 0,
    retinue: defaultRetinue,
    grid,
    explored,
    nemesisParties: createInitialNemesisParties(),
    activeCombatPartyId: null,
    combatRound: 1,
    combatLog: [
      'Werdna awakens within the shattered Sarcophagus on Floor B10.',
      'Crusader war-horns echo from above. Reclaim your 3 stolen Relics or ascend the Northern Stair.'
    ]
  };
}

export function revealAround(explored: boolean[][], cx: number, cy: number, radius: number): void {
  for (let y = 0; y < explored.length; y++) {
    for (let x = 0; x < explored[y].length; x++) {
      const dist = Math.abs(x - cx) + Math.abs(y - cy);
      if (dist <= radius) {
        explored[y][x] = true;
      }
    }
  }
}

export function getDirectionDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case 0:
      return { dx: 0, dy: -1 }; // North
    case 1:
      return { dx: 1, dy: 0 }; // East
    case 2:
      return { dx: 0, dy: 1 }; // South
    case 3:
      return { dx: -1, dy: 0 }; // West
  }
}

export function rotateDirection(dir: Direction, turn: 'LEFT' | 'RIGHT'): Direction {
  if (turn === 'RIGHT') {
    return ((dir + 1) % 4) as Direction;
  }
  return ((dir + 3) % 4) as Direction;
}

export function isWalkable(grid: TileType[][], x: number, y: number): boolean {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return false;
  return grid[y][x] !== 'WALL';
}

/**
 * Computes the next step for a Nemesis Party using one of 3 genuinely distinct AI policies:
 * 1. CRUSADER_HUNTER: Stalks toward Werdna's coordinates if within Manhattan distance 7; otherwise patrols central halls.
 * 2. RELIC_SEEKER: Patrols horizontally/vertically between Relic Chests and Pentagrams.
 * 3. SANCTUM_KITER: Guards the Northern Staircase Up (y <= 3), kiting laterally while keeping distance until Werdna approaches.
 */
export function computeNemesisNextMove(
  party: NemesisParty,
  state: GameWorldState
): { x: number; y: number; facing: Direction } {
  if (party.defeated || party.stunnedTurns > 0) {
    return { x: party.x, y: party.y, facing: party.facing };
  }

  const candidates: Array<{ x: number; y: number; dir: Direction }> = ([0, 1, 2, 3] as Direction[])
    .map((dir) => {
      const { dx, dy } = getDirectionDelta(dir);
      return { x: party.x + dx, y: party.y + dy, dir };
    })
    .filter((c) => isWalkable(state.grid, c.x, c.y));

  if (candidates.length === 0) {
    return { x: party.x, y: party.y, facing: party.facing };
  }

  if (party.policy === 'CRUSADER_HUNTER') {
    // Move closer to Werdna
    candidates.sort((a, b) => {
      const distA = Math.abs(a.x - state.playerX) + Math.abs(a.y - state.playerY);
      const distB = Math.abs(b.x - state.playerX) + Math.abs(b.y - state.playerY);
      return distA - distB;
    });
    const best = candidates[0];
    return { x: best.x, y: best.y, facing: best.dir };
  }

  if (party.policy === 'RELIC_SEEKER') {
    // Oscillate along row y=4 or seek nearest RELIC_CHEST / PENTAGRAM
    const forward = candidates.find((c) => c.dir === party.facing);
    if (forward) {
      return { x: forward.x, y: forward.y, facing: forward.dir };
    }
    const reverseDir = rotateDirection(rotateDirection(party.facing, 'RIGHT'), 'RIGHT');
    const back = candidates.find((c) => c.dir === reverseDir) ?? candidates[0];
    return { x: back.x, y: back.y, facing: back.dir };
  }

  // SANCTUM_KITER: stays in upper sanctum (y <= 3) and kites around stairs at (1,1)
  const sanctumMoves = candidates.filter((c) => c.y <= 3);
  const pool = sanctumMoves.length > 0 ? sanctumMoves : candidates;
  const distToPlayer = Math.abs(party.x - state.playerX) + Math.abs(party.y - state.playerY);
  if (distToPlayer <= 2) {
    // Intercept Werdna near stairs
    pool.sort((a, b) => {
      const dA = Math.abs(a.x - state.playerX) + Math.abs(a.y - state.playerY);
      const dB = Math.abs(b.x - state.playerX) + Math.abs(b.y - state.playerY);
      return dA - dB;
    });
  } else {
    // Keep patrolling upper sanctum perimeter
    pool.sort((a, b) => {
      const forwardBonusA = a.dir === party.facing ? -1 : 0;
      const forwardBonusB = b.dir === party.facing ? -1 : 0;
      return forwardBonusA - forwardBonusB;
    });
  }
  const chosen = pool[0];
  return { x: chosen.x, y: chosen.y, facing: chosen.dir };
}

export function resolveCosmicAlignment(vengeance: number, mercy: number): CosmicAlignment {
  if (vengeance - mercy >= 2) return 'VENGEANCE';
  if (mercy - vengeance >= 2) return 'TWILIGHT_MERCY';
  return 'COSMIC_BALANCE';
}

export function performPentagramRitual(
  state: GameWorldState,
  selectedCovenIds: string[]
): GameWorldState {
  const chosenTemplates = selectedCovenIds
    .map((id) => MONSTER_COVENS.find((c) => c.id === id))
    .filter((c): c is MonsterCovenTemplate => Boolean(c))
    .slice(0, 3);

  const newRetinue: ActiveCoven[] = chosenTemplates.map((tpl) => ({
    ...tpl,
    hp: tpl.maxHp,
    prevHp: tpl.maxHp,
    status: 'WARDED'
  }));

  const nextLevel = Math.min(3, Math.max(state.werdnaLevel, state.relicsReclaimed.length + 1));
  const nextMaxHp = 45 + (nextLevel - 1) * 15;
  const nextMaxMana = 24 + (nextLevel - 1) * 10;

  return {
    ...state,
    werdnaLevel: nextLevel,
    werdnaMaxHp: nextMaxHp,
    werdnaHp: nextMaxHp,
    werdnaPrevHp: nextMaxHp,
    werdnaMaxMana: nextMaxMana,
    werdnaMana: nextMaxMana,
    retinue: newRetinue.length > 0 ? newRetinue : state.retinue,
    combatLog: [
      `Pentagram Ritual complete! Werdna ascends to Circle Level ${nextLevel} and binds ${newRetinue.map((r) => r.name).join(', ')}.`,
      ...state.combatLog.slice(0, 5)
    ]
  };
}

export function armFieldTrapInFront(state: GameWorldState): GameWorldState {
  const { dx, dy } = getDirectionDelta(state.playerFacing);
  const tx = state.playerX + dx;
  const ty = state.playerY + dy;

  if (!isWalkable(state.grid, tx, ty) || state.dreadEssence < 8) {
    return state;
  }

  const nextGrid = state.grid.map((row) => [...row]);
  nextGrid[ty][tx] = 'TRAP_ARMED';

  return {
    ...state,
    dreadEssence: state.dreadEssence - 8,
    grid: nextGrid,
    combatLog: [
      `Werdna inscribes a Blood Spike Trap at (${tx}, ${ty}) (-8 Dread Essence).`,
      ...state.combatLog.slice(0, 5)
    ]
  };
}

export function executeCombatRound(
  state: GameWorldState,
  spellId: string,
  targetMemberIndex = 0
): GameWorldState {
  if (!state.activeCombatPartyId) return state;

  const partyIdx = state.nemesisParties.findIndex((p) => p.id === state.activeCombatPartyId);
  if (partyIdx === -1) return state;

  const party = state.nemesisParties[partyIdx];
  const spell = WERDNA_SPELLS.find((s) => s.id === spellId) ?? WERDNA_SPELLS[0];

  if (state.werdnaMana < spell.manaCost) {
    return {
      ...state,
      combatLog: [`Insufficient Arcane Mana for ${spell.classicName}!`, ...state.combatLog.slice(0, 5)]
    };
  }

  let nextMana = state.werdnaMana - spell.manaCost;
  let nextWerdnaHp = state.werdnaHp;
  const nextWerdnaPrevHp = state.werdnaHp;
  let nextDamageTaken = state.damageTakenTotal;
  let nextVengeance = state.vengeanceScore;
  let nextMercy = state.mercyScore;

  const nextRetinue: ActiveCoven[] = state.retinue.map((c) => ({ ...c, prevHp: c.hp }));
  const nextMembers: HeroMember[] = party.members.map((m) => ({ ...m }));
  const roundLogs: string[] = [];

  // Check Coven synergies
  const hasHellhounds = nextRetinue.some((c) => c.id === 'hellhound-pack' && c.hp > 0);
  const hasVoidSeraphs = nextRetinue.some((c) => c.id === 'void-seraphs' && c.hp > 0);
  const hasShadeStalkers = nextRetinue.some((c) => c.id === 'shade-stalkers' && c.hp > 0);
  const hasNecroChoir = nextRetinue.some((c) => c.id === 'necro-acolytes' && c.hp > 0);

  // 1. Werdna casts his chosen spell
  let spellPower = spell.basePower + (state.werdnaLevel - 1) * 4;
  if ((spell.id === 'halito' || spell.id === 'mahalito') && hasHellhounds) {
    spellPower = Math.round(spellPower * 1.35);
  }
  if (spell.id === 'tiltowait' && hasVoidSeraphs) {
    spellPower = Math.round(spellPower * 1.25);
  }

  if (spell.targetType === 'SINGLE_HERO') {
    const aliveTargets = nextMembers.filter((m) => m.hp > 0);
    const chosen =
      nextMembers[targetMemberIndex] && nextMembers[targetMemberIndex].hp > 0
        ? nextMembers[targetMemberIndex]
        : aliveTargets[0];
    if (chosen) {
      chosen.hp = Math.max(0, chosen.hp - spellPower);
      roundLogs.push(`Werdna chants ${spell.classicName}! ${chosen.name} takes ${spellPower} arcane fire damage.`);
    }
  } else if (spell.targetType === 'ALL_HEROES') {
    nextMembers.forEach((m) => {
      if (m.hp > 0) {
        m.hp = Math.max(0, m.hp - spellPower);
        if (spell.id === 'katino') {
          m.isAsleep = true;
        }
      }
    });
    if (spell.id === 'katino') {
      nextMercy += 1;
      roundLogs.push(`Werdna weaves KATINO! Enemy heroes take ${spellPower} damage and fall into Slumber.`);
    } else {
      roundLogs.push(`Werdna invokes ${spell.classicName}! All heroes suffer ${spellPower} cataclysmic damage.`);
    }
  } else if (spell.targetType === 'RETINUE_BUFF') {
    nextRetinue.forEach((c) => {
      if (c.hp > 0) {
        c.hp = Math.min(c.maxHp, c.hp + spellPower);
        c.status = 'WARDED';
      }
    });
    nextMembers.forEach((m) => {
      if (m.hp > 0) m.isFeared = true;
    });
    roundLogs.push(`Werdna intones MORLIS! Retinue heals +${spellPower} HP and Crusaders tremble in Fear.`);
  } else if (spell.targetType === 'DARK_PACT') {
    const sacrificeCoven = nextRetinue.find((c) => c.hp > 0);
    if (sacrificeCoven) {
      sacrificeCoven.hp = Math.max(1, sacrificeCoven.hp - 12);
    }
    nextMana = Math.min(state.werdnaMaxMana, nextMana + 12);
    nextVengeance += 1;
    nextMembers.forEach((m) => {
      if (m.hp > 0) {
        m.hp = Math.max(0, m.hp - spellPower);
      }
    });
    roundLogs.push(`Dark Pact! Werdna drains his vanguard to restore +12 Mana and blast all heroes for ${spellPower}.`);
  }

  // 2. Active Monster Retinue attacks surviving heroes
  nextRetinue.forEach((coven) => {
    if (coven.hp <= 0) return;
    const livingHeroes = nextMembers.filter((m) => m.hp > 0);
    if (livingHeroes.length === 0) return;
    const target = livingHeroes[0];
    let dmg = coven.attack;
    if (hasShadeStalkers && coven.id === 'shade-stalkers' && (target.isAsleep || target.isFeared)) {
      dmg = Math.round(dmg * 1.5);
    }
    target.hp = Math.max(0, target.hp - dmg);
    roundLogs.push(`${coven.name} strikes ${target.name} for ${dmg} damage.`);
  });

  if (hasNecroChoir) {
    nextMana = Math.min(state.werdnaMaxMana, nextMana + 3);
  }

  // 3. Check if all Hero party members are defeated
  const anyHeroAlive = nextMembers.some((m) => m.hp > 0);
  if (!anyHeroAlive) {
    const nextParties = state.nemesisParties.map((p, idx) =>
      idx === partyIdx ? { ...p, members: nextMembers, defeated: true } : p
    );
    const nextRelics = state.relicsReclaimed.includes(party.relicHeld)
      ? state.relicsReclaimed
      : [...state.relicsReclaimed, party.relicHeld];

    const allRelicsReclaimed = nextRelics.length >= state.targetRelicsCount;

    return {
      ...state,
      werdnaMana: nextMana,
      dreadEssence: state.dreadEssence + 15,
      vengeanceScore: nextVengeance,
      mercyScore: nextMercy,
      alignment: resolveCosmicAlignment(nextVengeance, nextMercy),
      relicsReclaimed: nextRelics,
      enemiesVanquished: state.enemiesVanquished + party.members.length,
      retinue: nextRetinue,
      nemesisParties: nextParties,
      activeCombatPartyId: null,
      phase: allRelicsReclaimed ? 'gameover' : state.phase,
      outcome: allRelicsReclaimed ? 'VICTORY' : state.outcome,
      combatLog: [
        `VICTORY! ${party.name} is vanquished! Reclaimed relic: ${party.relicHeld}.`,
        ...roundLogs,
        ...state.combatLog.slice(0, 4)
      ]
    };
  }

  // 4. Surviving Heroes execute their telegraphed intents
  nextMembers.forEach((hero) => {
    if (hero.hp <= 0) return;
    if (hero.isAsleep) {
      hero.isAsleep = false;
      roundLogs.push(`${hero.name} wakes from KATINO slumber.`);
      return;
    }

    const rawDmg = hero.isFeared ? Math.max(4, Math.round(hero.intentDamage * 0.7)) : hero.intentDamage;
    hero.isFeared = false;

    if (hero.intent === 'HEAL_PARTY') {
      const wounded = nextMembers.find((m) => m.hp > 0 && m.hp < m.maxHp);
      if (wounded) {
        wounded.hp = Math.min(wounded.maxHp, wounded.hp + 10);
        roundLogs.push(`${hero.name} chants DIOS, restoring 10 HP to ${wounded.name}.`);
        return;
      }
    }

    // Check if Vanguard coven intercepts
    const vanguard = nextRetinue.find((c) => c.hp > 0 && c.role === 'VANGUARD') ?? nextRetinue.find((c) => c.hp > 0);
    if (vanguard) {
      const mitigated = Math.max(3, rawDmg - Math.floor(vanguard.defense / 2));
      vanguard.hp = Math.max(0, vanguard.hp - mitigated);
      const bleedThrough = Math.max(1, Math.floor(rawDmg * 0.2));
      nextWerdnaHp = Math.max(0, nextWerdnaHp - bleedThrough);
      nextDamageTaken += bleedThrough;
      roundLogs.push(
        `${hero.name} uses ${hero.intent.replace('_', ' ')}! ${vanguard.name} absorbs ${mitigated} dmg (${bleedThrough} reaches Werdna).`
      );
    } else {
      nextWerdnaHp = Math.max(0, nextWerdnaHp - rawDmg);
      nextDamageTaken += rawDmg;
      roundLogs.push(`${hero.name} strikes Werdna directly for ${rawDmg} damage!`);
    }
  });

  // Check if Werdna fell in battle (reachable loss condition, no Math.max(1, hp) clamping)
  if (nextWerdnaHp <= 0) {
    const nextParties = state.nemesisParties.map((p, idx) =>
      idx === partyIdx ? { ...p, members: nextMembers } : p
    );
    return {
      ...state,
      werdnaHp: 0,
      werdnaPrevHp: nextWerdnaPrevHp,
      werdnaMana: nextMana,
      damageTakenTotal: nextDamageTaken,
      retinue: nextRetinue,
      nemesisParties: nextParties,
      activeCombatPartyId: null,
      phase: 'gameover',
      outcome: 'DEFEAT',
      combatLog: [
        'DEFEAT! Werdna’s corporeal form shatters and is dragged back into the Sarcophagus.',
        ...roundLogs
      ]
    };
  }

  const nextParties = state.nemesisParties.map((p, idx) =>
    idx === partyIdx ? { ...p, members: nextMembers } : p
  );

  return {
    ...state,
    werdnaHp: nextWerdnaHp,
    werdnaPrevHp: nextWerdnaPrevHp,
    werdnaMana: nextMana,
    damageTakenTotal: nextDamageTaken,
    vengeanceScore: nextVengeance,
    mercyScore: nextMercy,
    alignment: resolveCosmicAlignment(nextVengeance, nextMercy),
    retinue: nextRetinue,
    nemesisParties: nextParties,
    combatRound: state.combatRound + 1,
    combatLog: [...roundLogs, ...state.combatLog.slice(0, 4)]
  };
}

export function stepDungeonSimulation(
  state: GameWorldState,
  moveAction: 'FORWARD' | 'BACKWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'WAIT'
): GameWorldState {
  if (state.phase !== 'playing' || state.activeCombatPartyId) {
    return state;
  }

  if (moveAction === 'TURN_LEFT') {
    return {
      ...state,
      playerFacing: rotateDirection(state.playerFacing, 'LEFT')
    };
  }
  if (moveAction === 'TURN_RIGHT') {
    return {
      ...state,
      playerFacing: rotateDirection(state.playerFacing, 'RIGHT')
    };
  }

  let nextX = state.playerX;
  let nextY = state.playerY;

  if (moveAction === 'FORWARD' || moveAction === 'BACKWARD') {
    const { dx, dy } = getDirectionDelta(state.playerFacing);
    const mult = moveAction === 'FORWARD' ? 1 : -1;
    const candidateX = state.playerX + dx * mult;
    const candidateY = state.playerY + dy * mult;
    if (!isWalkable(state.grid, candidateX, candidateY)) {
      return {
        ...state,
        combatLog: ['Obsidian dungeon masonry blocks your path.', ...state.combatLog.slice(0, 5)]
      };
    }
    nextX = candidateX;
    nextY = candidateY;
  }

  const nextExplored = state.grid.map((row, y) => row.map((_, x) => state.explored[y][x]));
  revealAround(nextExplored, nextX, nextY, 3);

  const nextGrid = state.grid.map((row) => [...row]);
  let nextEssence = state.dreadEssence;
  let nextMana = Math.min(state.werdnaMaxMana, state.werdnaMana + 1);
  const logs: string[] = [];

  const steppedTile = nextGrid[nextY][nextX];
  if (steppedTile === 'RELIC_CHEST') {
    nextGrid[nextY][nextX] = 'FLOOR';
    nextEssence += 20;
    nextMana = Math.min(state.werdnaMaxMana, nextMana + 8);
    logs.push('Looted an Ancient Lair Cache! +20 Dread Essence, +8 Arcane Mana.');
  } else if (steppedTile === 'PENTAGRAM') {
    logs.push('Standing upon a Crimson Pentagram. Press [E] or click Summon Ritual to bind Covens & heal.');
  } else if (steppedTile === 'STAIRS_UP') {
    if (state.relicsReclaimed.length >= 1 || state.enemiesVanquished >= 2) {
      return {
        ...state,
        playerX: nextX,
        playerY: nextY,
        explored: nextExplored,
        turnCount: state.turnCount + 1,
        phase: 'gameover',
        outcome: 'VICTORY',
        combatLog: [
          'ASCENSION! Werdna climbs the Northern Staircase with his reclaimed power!',
          ...state.combatLog.slice(0, 4)
        ]
      };
    } else {
      logs.push('The Northern Stair is sealed by Trebor’s ward! Defeat at least 1 Nemesis Party to break the seal.');
    }
  }

  // Check if Werdna stepped directly onto a Nemesis Party
  const directCollisionParty = state.nemesisParties.find(
    (p) => !p.defeated && p.x === nextX && p.y === nextY
  );
  if (directCollisionParty) {
    return {
      ...state,
      playerX: nextX,
      playerY: nextY,
      dreadEssence: nextEssence,
      werdnaMana: nextMana,
      grid: nextGrid,
      explored: nextExplored,
      turnCount: state.turnCount + 1,
      activeCombatPartyId: directCollisionParty.id,
      combatRound: 1,
      combatLog: [
        `CLASH! Werdna intercepts ${directCollisionParty.name} (${directCollisionParty.title})!`,
        ...logs,
        ...state.combatLog.slice(0, 4)
      ]
    };
  }

  // Advance Nemesis Parties according to their distinct AI policies
  let triggeredCombatId: string | null = null;
  const intermediateState: GameWorldState = {
    ...state,
    playerX: nextX,
    playerY: nextY,
    grid: nextGrid
  };

  const nextParties = state.nemesisParties.map((party) => {
    if (party.defeated) return party;
    if (party.stunnedTurns > 0) {
      return { ...party, stunnedTurns: party.stunnedTurns - 1 };
    }
    const move = computeNemesisNextMove(party, intermediateState);
    let updatedMembers = party.members;
    let stunned = party.stunnedTurns;

    // Check if hero party stepped onto an armed trap!
    if (nextGrid[move.y][move.x] === 'TRAP_ARMED') {
      nextGrid[move.y][move.x] = 'TRAP_SPRUNG';
      stunned = 2;
      updatedMembers = party.members.map((m) => ({
        ...m,
        hp: Math.max(6, m.hp - 12),
        isFeared: true
      }));
      logs.push(
        `LAIR TRAP SPRUNG! ${party.name} stepped onto Blood Spikes at (${move.x}, ${move.y}), taking 12 damage each!`
      );
    }

    if (move.x === nextX && move.y === nextY && !triggeredCombatId) {
      triggeredCombatId = party.id;
      logs.push(`AMBUSH! ${party.name} engages Werdna in the corridor!`);
    }

    return {
      ...party,
      x: move.x,
      y: move.y,
      facing: move.facing,
      stunnedTurns: stunned,
      members: updatedMembers
    };
  });

  return {
    ...state,
    playerX: nextX,
    playerY: nextY,
    dreadEssence: nextEssence,
    werdnaMana: nextMana,
    grid: nextGrid,
    explored: nextExplored,
    turnCount: state.turnCount + 1,
    nemesisParties: nextParties,
    activeCombatPartyId: triggeredCombatId,
    combatRound: triggeredCombatId ? 1 : state.combatRound,
    combatLog: [...logs, ...state.combatLog].slice(0, 6)
  };
}
