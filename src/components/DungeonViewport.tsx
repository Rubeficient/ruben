import React, { useEffect, useRef } from 'react';
import { GameWorldState, TileType } from '../game/rules';

interface DungeonViewportProps {
  worldState: GameWorldState;
  traumaRef: React.MutableRefObject<number>;
  hitstopRef: React.MutableRefObject<number>;
}

// Pre-allocated particle ring buffer (Zero-GC inside requestAnimationFrame)
const MAX_PARTICLES = 64;
const pX = new Float32Array(MAX_PARTICLES);
const pY = new Float32Array(MAX_PARTICLES);
const pVx = new Float32Array(MAX_PARTICLES);
const pVy = new Float32Array(MAX_PARTICLES);
const pSize = new Float32Array(MAX_PARTICLES);
const pAlpha = new Float32Array(MAX_PARTICLES);
const pHue = new Float32Array(MAX_PARTICLES);

function initParticles(): void {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    pX[i] = Math.random();
    pY[i] = Math.random();
    pVx[i] = (Math.random() - 0.5) * 0.04;
    pVy[i] = -0.03 - Math.random() * 0.06;
    pSize[i] = 1.5 + Math.random() * 2.5;
    pAlpha[i] = 0.2 + Math.random() * 0.6;
    pHue[i] = i % 3 === 0 ? 350 : i % 3 === 1 ? 160 : 38; // Crimson, Soul-Emerald, Torch-Amber
  }
}

function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export const DungeonViewport: React.FC<DungeonViewportProps> = ({
  worldState,
  traumaRef,
  hitstopRef
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<GameWorldState>(worldState);
  stateRef.current = worldState;
  const triggerRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    triggerRenderRef.current?.();
  }, [worldState]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full block';
    canvas.setAttribute('data-testid', 'dungeon-viewport-canvas');
    container.innerHTML = '';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    initParticles();

    // Smoothly interpolated camera coordinates & angle
    // Facing 0 (North) = -PI/2, 1 (East) = 0, 2 (South) = PI/2, 3 (West) = PI
    const getTargetAngle = (facing: number) => facing * (Math.PI / 2) - Math.PI / 2;
    let camX = stateRef.current.playerX + 0.5;
    let camY = stateRef.current.playerY + 0.5;
    let camAngle = getTargetAngle(stateRef.current.playerFacing);
    let walkBobPhase = 0;
    let totalTime = 0;

    let width = container.clientWidth || 1440;
    let height = container.clientHeight || 900;
    canvas.width = width;
    canvas.height = height;

    let rafId = 0;
    let timerId = 0;
    let isDisposed = false;
    let isLoopActive = false;
    let lastTime = performance.now();

    const scheduleNextFrame = () => {
      if (isDisposed) return;
      timerId = window.setTimeout(() => {
        if (!isDisposed) {
          rafId = requestAnimationFrame(renderLoop);
        }
      }, 20);
    };

    const kickLoop = () => {
      if (isDisposed || isLoopActive) return;
      isLoopActive = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(renderLoop);
    };

    triggerRenderRef.current = kickLoop;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0 && cr.height > 0) {
          width = Math.floor(cr.width);
          height = Math.floor(cr.height);
          canvas.width = width;
          canvas.height = height;
          kickLoop();
        }
      }
    });
    resizeObserver.observe(container);

    const renderLoop = (now: number) => {
      if (isDisposed) return;
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      // Clamped dt <= 0.05s per game_title_and_hud.md
      const dt = Math.min(Math.max(rawDt, 0.016), 0.05);
      totalTime += dt;

      const st = stateRef.current;

      // Hitstop freeze timer ticks in real dt while simulation interpolation pauses
      if (hitstopRef.current > 0) {
        hitstopRef.current = Math.max(0, hitstopRef.current - dt);
      }
      const simDt = hitstopRef.current > 0 ? 0 : dt;

      // Exponential camera damping: 1 - Math.exp(-k * dt)
      const dampPos = 1 - Math.exp(-15 * simDt);
      const dampRot = 1 - Math.exp(-16 * simDt);

      const targetX = st.playerX + 0.5;
      const targetY = st.playerY + 0.5;
      const targetAngle = getTargetAngle(st.playerFacing);

      const dxMove = targetX - camX;
      const dyMove = targetY - camY;
      const angleDiffToTarget = normalizeAngleDiff(targetAngle, camAngle);
      const moveSpeed = Math.hypot(dxMove, dyMove);
      if (moveSpeed > 0.005) {
        walkBobPhase += moveSpeed * 0.45;
      }

      if (moveSpeed < 0.004) {
        camX = targetX;
        camY = targetY;
      } else {
        camX += dxMove * dampPos;
        camY += dyMove * dampPos;
      }

      if (Math.abs(angleDiffToTarget) < 0.004) {
        camAngle = targetAngle;
      } else {
        camAngle += angleDiffToTarget * dampRot;
      }

      // Decaying trauma*trauma camera shake
      const trauma = traumaRef.current;
      if (trauma > 0) {
        traumaRef.current = Math.max(0, trauma - dt * 2.2);
      }
      const shakeMag = trauma * trauma * 16;
      const shakeX = (Math.random() * 2 - 1) * shakeMag;
      const shakeY = (Math.random() * 2 - 1) * shakeMag + Math.sin(walkBobPhase * 6) * Math.min(1, moveSpeed * 4) * 5;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 1. Ceiling & Floor atmospheric gradient with warm torchlight & cool obsidian shadows
      const horizonY = height * 0.5;
      const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      ceilGrad.addColorStop(0, '#07060b');
      ceilGrad.addColorStop(0.65, '#120f1d');
      ceilGrad.addColorStop(1, '#09070f');
      ctx.fillStyle = ceilGrad;
      ctx.fillRect(0, 0, width, horizonY);

      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      floorGrad.addColorStop(0, '#09070f');
      floorGrad.addColorStop(0.35, '#171324');
      floorGrad.addColorStop(0.8, '#231b30');
      floorGrad.addColorStop(1, '#2b1e36');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 2. Raycasted 3D First-Person Dungeon Columns (160 rays across viewport)
      const numRays = 160;
      const fov = Math.PI / 2.8;
      const colWidth = Math.ceil(width / numRays) + 1;
      const zBuffer = new Float32Array(numRays);

      const grid = st.grid;
      const gridH = grid.length;
      const gridW = grid[0].length;

      for (let r = 0; r < numRays; r++) {
        const cameraX = (2 * r) / numRays - 1;
        const rayAngle = camAngle + Math.atan(cameraX * Math.tan(fov / 2));
        const rayDirX = Math.cos(rayAngle);
        const rayDirY = Math.sin(rayAngle);

        let mapX = Math.floor(camX);
        let mapY = Math.floor(camY);

        const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
        const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));

        let stepX = 0;
        let stepY = 0;
        let sideDistX = 0;
        let sideDistY = 0;

        if (rayDirX < 0) {
          stepX = -1;
          sideDistX = (camX - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1.0 - camX) * deltaDistX;
        }
        if (rayDirY < 0) {
          stepY = -1;
          sideDistY = (camY - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1.0 - camY) * deltaDistY;
        }

        let hit = false;
        let side = 0;
        let steps = 0;

        while (!hit && steps < 24) {
          steps++;
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }
          if (mapY < 0 || mapY >= gridH || mapX < 0 || mapX >= gridW || grid[mapY][mapX] === 'WALL') {
            hit = true;
          }
        }

        const perpWallDist = Math.max(
          0.15,
          (side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY) * Math.cos(rayAngle - camAngle)
        );
        zBuffer[r] = perpWallDist;

        const lineHeight = Math.min(height * 1.6, height / perpWallDist);
        const drawStart = horizonY - lineHeight / 2;

        // Calculate wall texture UV X coordinate
        let wallX =
          side === 0
            ? camY + perpWallDist * rayDirY
            : camX + perpWallDist * rayDirX;
        wallX -= Math.floor(wallX);

        // Torch flicker & distance fog attenuation
        const torchFlicker = 0.94 + Math.sin(totalTime * 7 + r * 0.05) * 0.06;
        const shade = Math.max(0.08, Math.min(1, (1.35 / (1 + perpWallDist * 0.38)) * torchFlicker));
        const sideFactor = side === 1 ? 0.76 : 1.0;
        const mortarSeam = wallX < 0.06 || wallX > 0.94 || Math.abs(wallX - 0.5) < 0.03 ? 0.68 : 1.0;

        const lum = shade * sideFactor * mortarSeam;
        const red = Math.round(48 * lum + (perpWallDist < 2.5 ? 24 * lum : 0));
        const green = Math.round(38 * lum);
        const blue = Math.round(66 * lum);

        const screenX = Math.floor((r / numRays) * width);
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(screenX, drawStart, colWidth, lineHeight);

        // Horizontal masonry courses & crimson rune trim along wall base/crown
        if (perpWallDist < 7) {
          ctx.fillStyle = `rgba(12, 9, 18, ${0.45 * lum})`;
          ctx.fillRect(screenX, drawStart + lineHeight * 0.33, colWidth, 2);
          ctx.fillRect(screenX, drawStart + lineHeight * 0.66, colWidth, 2);

          // Glowing arcane baseboard rune strip
          ctx.fillStyle = `rgba(185, 28, 28, ${0.38 * lum})`;
          ctx.fillRect(screenX, drawStart + lineHeight * 0.9, colWidth, Math.max(2, lineHeight * 0.03));
        }
      }

      // 3. Project Floor Features (Pentagrams, Traps, Relic Chests, Stairs, Sarcophagus) & Roaming Nemesis Parties
      interface BillBoardItem {
        wx: number;
        wy: number;
        dist: number;
        kind: TileType | 'NEMESIS_PARTY';
        label?: string;
        color?: string;
        partySub?: string;
      }

      const billboards: BillBoardItem[] = [];

      for (let gy = 0; gy < gridH; gy++) {
        for (let gx = 0; gx < gridW; gx++) {
          const t = grid[gy][gx];
          if (t !== 'WALL' && t !== 'FLOOR') {
            const wx = gx + 0.5;
            const wy = gy + 0.5;
            const dist = Math.hypot(wx - camX, wy - camY);
            if (dist > 0.25 && dist < 9.5) {
              billboards.push({ wx, wy, dist, kind: t });
            }
          }
        }
      }

      st.nemesisParties.forEach((party) => {
        if (party.defeated) return;
        const wx = party.x + 0.5;
        const wy = party.y + 0.5;
        const dist = Math.hypot(wx - camX, wy - camY);
        if (dist > 0.1 && dist < 9.5) {
          billboards.push({
            wx,
            wy,
            dist,
            kind: 'NEMESIS_PARTY',
            label: party.name,
            partySub: `${party.members.filter((m) => m.hp > 0).length} Crusaders · ${party.policy.replace('_', ' ')}`,
            color: party.paletteColor
          });
        }
      });

      // Sort back-to-front (Painter's algorithm)
      billboards.sort((a, b) => b.dist - a.dist);

      for (const item of billboards) {
        const relX = item.wx - camX;
        const relY = item.wy - camY;
        const angleToObj = Math.atan2(relY, relX);
        const angleDiff = normalizeAngleDiff(angleToObj, camAngle);

        if (Math.abs(angleDiff) > fov * 0.75) continue;

        const projX = width * 0.5 + (Math.tan(angleDiff) / Math.tan(fov / 2)) * (width * 0.5);
        const perpDist = Math.max(0.3, item.dist * Math.cos(angleDiff));
        const rayIdx = Math.min(numRays - 1, Math.max(0, Math.floor((projX / width) * numRays)));

        // Depth test against wall zBuffer
        if (perpDist > zBuffer[rayIdx] + 0.2) continue;

        const scale = Math.min(height * 0.85, height / perpDist);
        const floorY = horizonY + scale * 0.45;

        if (item.kind === 'PENTAGRAM') {
          // Glowing crimson rotating pentagram on the dungeon floor
          const rx = scale * 0.44;
          const ry = scale * 0.16;
          ctx.save();
          ctx.translate(projX, floorY);
          const pulse = 0.75 + Math.sin(totalTime * 4) * 0.25;
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.85 * pulse})`;
          ctx.lineWidth = Math.max(2, scale * 0.018);
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Draw 5-pointed star inside ellipse
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const idx = (i * 2) % 5;
            const a = totalTime * 0.8 + (idx * Math.PI * 2) / 5;
            const sx = Math.cos(a) * rx * 0.88;
            const sy = Math.sin(a) * ry * 0.88;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();

          // Rising crimson aura pillar
          const pillarGrad = ctx.createLinearGradient(0, 0, 0, -scale * 0.75);
          pillarGrad.addColorStop(0, `rgba(225, 29, 72, ${0.35 * pulse})`);
          pillarGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
          ctx.fillStyle = pillarGrad;
          ctx.fillRect(-rx * 0.7, -scale * 0.75, rx * 1.4, scale * 0.75);
          ctx.restore();
        } else if (item.kind === 'TRAP_ARMED') {
          const rx = scale * 0.34;
          const ry = scale * 0.12;
          ctx.save();
          ctx.translate(projX, floorY);
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Blood spikes
          ctx.fillStyle = '#ea580c';
          for (let s = -2; s <= 2; s++) {
            ctx.beginPath();
            ctx.moveTo(s * rx * 0.35 - 4, 0);
            ctx.lineTo(s * rx * 0.35, -scale * 0.18);
            ctx.lineTo(s * rx * 0.35 + 4, 0);
            ctx.fill();
          }
          ctx.restore();
        } else if (item.kind === 'RELIC_CHEST') {
          const boxW = scale * 0.32;
          const boxH = scale * 0.22;
          ctx.save();
          ctx.translate(projX, floorY);
          ctx.fillStyle = '#451a03';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.fillRect(-boxW / 2, -boxH, boxW, boxH);
          ctx.strokeRect(-boxW / 2, -boxH, boxW, boxH);
          ctx.restore();
        } else if (item.kind === 'STAIRS_UP') {
          const stW = scale * 0.52;
          const stH = scale * 0.78;
          ctx.save();
          ctx.translate(projX, floorY);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.fillRect(-stW / 2, -stH, stW, stH);
          ctx.strokeRect(-stW / 2, -stH, stW, stH);
          for (let step = 1; step <= 4; step++) {
            const sy = -stH * (step / 5);
            ctx.beginPath();
            ctx.moveTo(-stW / 2, sy);
            ctx.lineTo(stW / 2, sy);
            ctx.stroke();
          }
          ctx.restore();
        } else if (item.kind === 'NEMESIS_PARTY') {
          // Composite Crusader Party silhouette with glowing sun-shield & banner
          const figH = scale * 0.68;
          const figW = scale * 0.42;
          ctx.save();
          ctx.translate(projX, floorY);

          // Contact shadow disc
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.beginPath();
          ctx.ellipse(0, 0, figW * 0.65, figW * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Armored cloak & torso silhouette
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = item.color || '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-figW * 0.45, 0);
          ctx.lineTo(-figW * 0.3, -figH * 0.78);
          ctx.lineTo(figW * 0.3, -figH * 0.78);
          ctx.lineTo(figW * 0.45, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Crusader helm
          ctx.beginPath();
          ctx.arc(0, -figH * 0.88, figW * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Radiant Sun Shield emblem
          ctx.fillStyle = item.color || '#f59e0b';
          ctx.beginPath();
          ctx.arc(-figW * 0.22, -figH * 0.45, figW * 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Floating nameplate & telegraph above party
          if (perpDist < 5.5 && item.label) {
            ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(item.label, 0, -figH - 18);
            if (item.partySub) {
              ctx.font = '500 10px "JetBrains Mono", monospace';
              ctx.fillStyle = '#fcd34d';
              ctx.fillText(item.partySub, 0, -figH - 4);
            }
          }
          ctx.restore();
        }
      }

      // 4. Update & Render Pre-Allocated Particle Ring Buffer (Arcane Embers)
      for (let i = 0; i < MAX_PARTICLES; i++) {
        pX[i] += pVx[i] * simDt;
        pY[i] += pVy[i] * simDt;
        if (pY[i] < 0) {
          pY[i] = 1;
          pX[i] = Math.random();
        }
        if (pX[i] < 0) pX[i] = 1;
        if (pX[i] > 1) pX[i] = 0;

        ctx.fillStyle = `hsla(${pHue[i]}, 85%, 62%, ${pAlpha[i] * 0.55})`;
        ctx.beginPath();
        ctx.arc(pX[i] * width, pY[i] * height, pSize[i], 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Peripheral Vignette (intensifies at critical low HP per Gaze Routing rules)
      const hpRatio = st.werdnaHp / Math.max(1, st.werdnaMaxHp);
      const lowHpPulse = hpRatio <= 0.35 ? 0.35 + Math.sin(totalTime * 6) * 0.15 : 0;
      const vigGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        width * 0.28,
        width * 0.5,
        height * 0.5,
        width * 0.65
      );
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(
        1,
        lowHpPulse > 0 ? `rgba(153, 27, 27, ${0.45 + lowHpPulse})` : 'rgba(5, 4, 9, 0.72)'
      );
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();

      const stillMoving =
        Math.hypot(targetX - camX, targetY - camY) > 0.004 ||
        Math.abs(normalizeAngleDiff(targetAngle, camAngle)) > 0.004 ||
        traumaRef.current > 0.01 ||
        hitstopRef.current > 0.001;

      if (stillMoving) {
        scheduleNextFrame();
      } else {
        isLoopActive = false;
      }
    };

    kickLoop();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 w-full h-full z-0" />;
};
