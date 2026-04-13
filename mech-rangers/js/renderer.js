/* ═══════════════════════════════════════════════════════
   renderer.js — SVG Mech Warrior Art Engine
   Depends on: rng.js
   Returns an SVG string. Zero DOM access.
   ═══════════════════════════════════════════════════════ */

/**
 * Renders one NFT as an SVG string at the given pixel size.
 * @param {Object} nft  - NFT data object from generator.js
 * @param {number} sz   - Output size in px (square)
 * @returns {string}    - Complete SVG markup
 */
function renderSVG(nft, sz) {
  const rng  = rng32(nft.seed + 7777);
  const suit = nft.traits.suit;
  const P    = suit.primary;
  const A    = suit.accent;
  const bg   = nft.traits.background;
  const aura = nft.traits.aura;
  const c1   = bg.color[0];
  const c2   = bg.color[1];
  const w = sz, h = sz;
  const uid  = 'm' + nft.id;
  const out  = [];

  /* Sketch jitter — adds hand-drawn wobble to any coordinate */
  const jit = (v, mag = 1.8) => v + (rng() - 0.5) * mag * 2;

  /* ─── OPEN SVG ─────────────────────────────────────── */
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`);

  /* ─── DEFS ─────────────────────────────────────────── */
  out.push(`<defs>
  <radialGradient id="bg${uid}" cx="50%" cy="45%" r="70%">
    <stop offset="0%" stop-color="${c2}"/>
    <stop offset="100%" stop-color="${c1}"/>
  </radialGradient>
  <linearGradient id="suit${uid}" x1="10%" y1="0%" x2="90%" y2="100%">
    <stop offset="0%"   stop-color="${A}" stop-opacity=".9"/>
    <stop offset="50%"  stop-color="${P}"/>
    <stop offset="100%" stop-color="${c1}"/>
  </linearGradient>
  <linearGradient id="suitHi${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%"   stop-color="rgba(255,255,255,.18)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
  <filter id="sk${uid}" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="4" seed="${nft.seed % 97}" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="glow${uid}" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="4.5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glowSoft${uid}" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="8" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  </defs>`);

  /* ─── BACKGROUND ────────────────────────────────────── */
  out.push(`<rect width="${w}" height="${h}" fill="url(#bg${uid})"/>`);

  if (bg.val === 'cyber') {
    for (let i = 0; i < 9; i++) {
      out.push(`<line x1="0" y1="${(h/9*i+jit(0,3)).toFixed(1)}" x2="${w}" y2="${(h/9*i+jit(0,3)).toFixed(1)}" stroke="${A}" stroke-opacity=".045" stroke-width="1"/>`);
      out.push(`<line x1="${(w/9*i+jit(0,3)).toFixed(1)}" y1="0" x2="${(w/9*i+jit(0,3)).toFixed(1)}" y2="${h}" stroke="${A}" stroke-opacity=".045" stroke-width="1"/>`);
    }
    // Corner bracket art
    const b = w * .06;
    out.push(`<path d="M${b},${w*.02} L${w*.02},${w*.02} L${w*.02},${b}" stroke="${A}" stroke-opacity=".25" stroke-width="1.5" fill="none"/>`);
    out.push(`<path d="M${w-b},${w*.02} L${w-w*.02},${w*.02} L${w-w*.02},${b}" stroke="${A}" stroke-opacity=".25" stroke-width="1.5" fill="none"/>`);
    out.push(`<path d="M${w*.02},${h-b} L${w*.02},${h-w*.02} L${b},${h-w*.02}" stroke="${A}" stroke-opacity=".25" stroke-width="1.5" fill="none"/>`);
    out.push(`<path d="M${w-w*.02},${h-b} L${w-w*.02},${h-w*.02} L${w-b},${h-w*.02}" stroke="${A}" stroke-opacity=".25" stroke-width="1.5" fill="none"/>`);
  }
  if (bg.val === 'dimension') {
    out.push(`<circle cx="${w/2}" cy="${h/2}" r="${(w*.42).toFixed(1)}" fill="none" stroke="${A}" stroke-opacity=".09" stroke-width="52"/>`);
    out.push(`<circle cx="${w/2}" cy="${h/2}" r="${(w*.25).toFixed(1)}" fill="none" stroke="${P}" stroke-opacity=".07" stroke-width="25"/>`);
    for (let i = 0; i < 8; i++) {
      const a = (i/8)*Math.PI*2;
      out.push(`<line x1="${w/2}" y1="${h/2}" x2="${(w/2+Math.cos(a)*w).toFixed(1)}" y2="${(h/2+Math.sin(a)*h).toFixed(1)}" stroke="${A}" stroke-opacity=".03" stroke-width="1"/>`);
    }
  }
  if (bg.val === 'golden') {
    for (let i = 0; i < 20; i++) {
      const a = (i/20)*Math.PI*2;
      out.push(`<line x1="${w/2}" y1="${h/2}" x2="${(w/2+Math.cos(a)*w).toFixed(1)}" y2="${(h/2+Math.sin(a)*h).toFixed(1)}" stroke="${A}" stroke-opacity=".035" stroke-width="6"/>`);
    }
  }
  if (bg.val === 'volcanic') {
    out.push(`<ellipse cx="${(w/2).toFixed(1)}" cy="${h}" rx="${(w*.75).toFixed(1)}" ry="${(h*.28).toFixed(1)}" fill="#ff3300" fill-opacity=".07" filter="url(#glowSoft${uid})"/>`);
  }
  if (bg.val === 'arctic') {
    for (let i = 0; i < 5; i++) {
      const bx = rng()*w, by = rng()*h*.4;
      out.push(`<polygon points="${jit(bx,8)},${jit(by,8)} ${jit(bx+20,8)},${jit(by-30,8)} ${jit(bx+35,8)},${jit(by,8)}" fill="${A}" fill-opacity=".04" stroke="${A}" stroke-opacity=".08" stroke-width="1"/>`);
    }
  }

  // Ground shadow
  out.push(`<ellipse cx="${(w/2).toFixed(1)}" cy="${(h*.885).toFixed(1)}" rx="${(w*.29).toFixed(1)}" ry="${(h*.052).toFixed(1)}" fill="rgba(0,0,0,.55)"/>`);

  /* ─── AURA ──────────────────────────────────────────── */
  if (aura.val !== 'none') {
    const aC = aura.color;
    out.push(`<ellipse cx="${(w/2).toFixed(1)}" cy="${(h*.52).toFixed(1)}" rx="${(w*.28).toFixed(1)}" ry="${(h*.44).toFixed(1)}" fill="${aC}" fill-opacity=".038" filter="url(#glowSoft${uid})"/>`);
    for (let i = 0; i < 9; i++) {
      const px = w/2 + (rng()-.5)*w*.42;
      const py = h*.25 + rng()*h*.48;
      const r  = .8 + rng()*2.8;
      out.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(1)}" fill="${aC}" fill-opacity="${(.35+rng()*.55).toFixed(2)}" filter="url(#glow${uid})"/>`);
    }
    if (['electric','plasma','cosmic'].includes(aura.val)) {
      for (let i = 0; i < 3; i++) {
        const x1=w/2+(rng()-.5)*w*.35, y1=h*.2+rng()*h*.2;
        const x2=w/2+(rng()-.5)*w*.35, y2=h*.55+rng()*h*.25;
        const cx=(x1+(rng()-.5)*60).toFixed(1), cy=((y1+y2)/2+(rng()-.5)*40).toFixed(1);
        out.push(`<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx},${cy} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${aC}" stroke-opacity="${(.25+rng()*.3).toFixed(2)}" stroke-width="${(.6+rng()*1.2).toFixed(1)}" fill="none" filter="url(#glow${uid})"/>`);
      }
    }
  }

  /* ─── LAYOUT ANCHORS ────────────────────────────────── */
  const bx   = w/2, by  = h*.54;
  const tW   = w*.265, tH = h*.245;
  const armW = w*.082, armH = h*.195;
  const legW = w*.088, legH = h*.215;

  // Wobbly polygon helper
  const wp = (pts, attr) => {
    const ps = pts.map(p => `${jit(p[0]).toFixed(1)},${jit(p[1]).toFixed(1)}`).join(' ');
    return `<polygon points="${ps}" ${attr}/>`;
  };

  /* ─── LEGS ──────────────────────────────────────────── */
  // Left leg
  out.push(wp([[bx-legW*1.15,by+tH*.5],[bx-legW*.12,by+tH*.5],[bx-legW*.22,by+tH*.5+legH],[bx-legW*1.28,by+tH*.5+legH]],
    `fill="url(#suit${uid})" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`));
  // Left knee guard
  out.push(wp([[bx-legW*1.22,by+tH*.75],[bx-legW*.08,by+tH*.75],[bx-legW*.18,by+tH*.75+legH*.3],[bx-legW*1.32,by+tH*.75+legH*.3]],
    `fill="${A}" fill-opacity=".38" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"`));
  // Right leg
  out.push(wp([[bx+legW*.12,by+tH*.5],[bx+legW*1.15,by+tH*.5],[bx+legW*1.28,by+tH*.5+legH],[bx+legW*.22,by+tH*.5+legH]],
    `fill="url(#suit${uid})" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`));
  // Right knee guard
  out.push(wp([[bx+legW*.08,by+tH*.75],[bx+legW*1.22,by+tH*.75],[bx+legW*1.32,by+tH*.75+legH*.3],[bx+legW*.18,by+tH*.75+legH*.3]],
    `fill="${A}" fill-opacity=".38" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"`));
  // Ankle strips
  const ankY = by + tH*.5 + legH*.82;
  out.push(`<rect x="${jit(bx-legW*1.22).toFixed(1)}" y="${jit(ankY).toFixed(1)}" width="${(legW*1.1).toFixed(1)}" height="${(legH*.1).toFixed(1)}" fill="${P}" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"/>`);
  out.push(`<rect x="${jit(bx+legW*.08).toFixed(1)}"  y="${jit(ankY).toFixed(1)}" width="${(legW*1.1).toFixed(1)}" height="${(legH*.1).toFixed(1)}" fill="${P}" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"/>`);
  // Feet
  const fy = by+tH*.5+legH, fh = h*.04;
  out.push(wp([[bx-legW*1.48,fy],[bx-legW*.04,fy],[bx+legW*.04,fy+fh],[bx-legW*1.56,fy+fh]],
    `fill="${P}" stroke="${A}" stroke-width="1.5" filter="url(#sk${uid})"`));
  out.push(wp([[bx+legW*.04,fy],[bx+legW*1.48,fy],[bx+legW*1.56,fy+fh],[bx-legW*.04,fy+fh]],
    `fill="${P}" stroke="${A}" stroke-width="1.5" filter="url(#sk${uid})"`));

  /* ─── WAIST / BELT ──────────────────────────────────── */
  out.push(wp([[bx-tW*.74,by+tH*.38],[bx+tW*.74,by+tH*.38],[bx+tW*.52,by+tH*.58],[bx-tW*.52,by+tH*.58]],
    `fill="${A}" fill-opacity=".42" stroke="${A}" stroke-width="1.6" filter="url(#sk${uid})"`));
  // Belt buckle
  out.push(`<rect x="${jit(bx-w*.035).toFixed(1)}" y="${jit(by+tH*.4).toFixed(1)}" width="${(w*.07).toFixed(1)}" height="${(h*.04).toFixed(1)}" fill="${A}" fill-opacity=".7" stroke="${A}" stroke-width="1" filter="url(#glow${uid})"/>`);

  /* ─── ARMS ──────────────────────────────────────────── */
  // Left arm + shoulder pad + elbow guard
  out.push(wp([[bx-tW-armW,by-tH*.3],[bx-tW,by-tH*.3],[bx-tW+armW*.28,by+armH],[bx-tW-armW*1.3,by+armH]],
    `fill="url(#suit${uid})" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`));
  out.push(wp([[bx-tW-armW*.75,by-tH*.44],[bx-tW+armW*.22,by-tH*.44],[bx-tW+armW*.1,by-tH*.12],[bx-tW-armW*.92,by-tH*.12]],
    `fill="${A}" fill-opacity=".68" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`));
  out.push(wp([[bx-tW-armW*.9,by+armH*.42],[bx-tW+armW*.1,by+armH*.42],[bx-tW+armW*.05,by+armH*.62],[bx-tW-armW*.85,by+armH*.62]],
    `fill="${A}" fill-opacity=".3" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"`));
  // Right arm + shoulder pad + elbow guard
  out.push(wp([[bx+tW,by-tH*.3],[bx+tW+armW,by-tH*.3],[bx+tW+armW*1.3,by+armH],[bx+tW-armW*.28,by+armH]],
    `fill="url(#suit${uid})" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`));
  out.push(wp([[bx+tW-armW*.22,by-tH*.44],[bx+tW+armW*.75,by-tH*.44],[bx+tW+armW*.92,by-tH*.12],[bx+tW-armW*.1,by-tH*.12]],
    `fill="${A}" fill-opacity=".68" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`));
  out.push(wp([[bx+tW-armW*.1,by+armH*.42],[bx+tW+armW*.9,by+armH*.42],[bx+tW+armW*.85,by+armH*.62],[bx+tW-armW*.05,by+armH*.62]],
    `fill="${A}" fill-opacity=".3" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"`));
  // Fists
  out.push(`<rect x="${jit(bx-tW-armW*1.4).toFixed(1)}"  y="${jit(by+armH*.82).toFixed(1)}" width="${(armW*1.6).toFixed(1)}" height="${(h*.08).toFixed(1)}" rx="3" fill="${P}" stroke="${A}" stroke-width="1.5" filter="url(#sk${uid})"/>`);
  out.push(`<rect x="${jit(bx+tW-armW*.2).toFixed(1)}"   y="${jit(by+armH*.82).toFixed(1)}" width="${(armW*1.6).toFixed(1)}" height="${(h*.08).toFixed(1)}" rx="3" fill="${P}" stroke="${A}" stroke-width="1.5" filter="url(#sk${uid})"/>`);
/* ─── TORSO ─────────────────────────────────────────── */
  out.push(wp([[bx-tW,by-tH*.5],[bx+tW,by-tH*.5],[bx+tW*.84,by+tH*.5],[bx-tW*.84,by+tH*.5]],
    `fill="url(#suit${uid})" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"`));
  // Torso highlight
  out.push(wp([[bx-tW*.5,by-tH*.5],[bx+tW*.5,by-tH*.5],[bx+tW*.42,by-tH*.1],[bx-tW*.42,by-tH*.1]],
    `fill="url(#suitHi${uid})"`));
  // Panel lines
  out.push(`<line x1="${jit(bx-tW*.52).toFixed(1)}" y1="${jit(by-tH*.26).toFixed(1)}" x2="${jit(bx+tW*.52).toFixed(1)}" y2="${jit(by-tH*.26).toFixed(1)}" stroke="${A}" stroke-opacity=".42" stroke-width="1" filter="url(#sk${uid})"/>`);
  out.push(`<line x1="${jit(bx-tW*.38).toFixed(1)}" y1="${jit(by+tH*.04).toFixed(1)}" x2="${jit(bx+tW*.38).toFixed(1)}" y2="${jit(by+tH*.04).toFixed(1)}" stroke="${A}" stroke-opacity=".42" stroke-width="1" filter="url(#sk${uid})"/>`);
  // Side vents
  for (let i = 0; i < 3; i++) {
    const vy = by - tH*.18 + i*(tH*.14);
    out.push(`<line x1="${jit(bx-tW*.88).toFixed(1)}" y1="${jit(vy).toFixed(1)}" x2="${jit(bx-tW*.68).toFixed(1)}" y2="${jit(vy).toFixed(1)}" stroke="${A}" stroke-opacity=".55" stroke-width="1.5"/>`);
    out.push(`<line x1="${jit(bx+tW*.68).toFixed(1)}" y1="${jit(vy).toFixed(1)}" x2="${jit(bx+tW*.88).toFixed(1)}" y2="${jit(vy).toFixed(1)}" stroke="${A}" stroke-opacity=".55" stroke-width="1.5"/>`);
  }

  /* ─── CHEST BADGE ───────────────────────────────────── */
  const bsx = bx, bsy = by - tH*.12, bs = w*.058;
  const badge = nft.traits.badge.val;
  out.push(`<g filter="url(#glow${uid})">`);
  switch (badge) {
    case 'star': case 'zord': {
      let sp = '';
      for (let i = 0; i < 10; i++) {
        const a = i*Math.PI/5 - Math.PI/2, r2 = i%2===0 ? bs : bs*.44;
        sp += `${jit(bsx+Math.cos(a)*r2).toFixed(1)},${jit(bsy+Math.sin(a)*r2).toFixed(1)} `;
      }
      out.push(`<polygon points="${sp}" fill="${A}" stroke="${c1}" stroke-width="1" filter="url(#sk${uid})"/>`);
      break;
    }
    case 'lightning':
      out.push(wp([[bsx-bs*.3,bsy-bs],[bsx+bs*.22,bsy-bs*.08],[bsx,bsy-bs*.08],[bsx+bs*.3,bsy+bs],[bsx-bs*.22,bsy+bs*.08],[bsx,bsy+bs*.08]],
        `fill="${A}" stroke="${c1}" stroke-width="1" filter="url(#sk${uid})"`));
      break;
    case 'diamond':
      out.push(wp([[bsx,bsy-bs],[bsx+bs*.72,bsy],[bsx,bsy+bs],[bsx-bs*.72,bsy]],
        `fill="${A}" stroke="${c1}" stroke-width="1" filter="url(#sk${uid})"`));
      break;
    case 'skull':
      out.push(`<circle cx="${jit(bsx).toFixed(1)}" cy="${jit(bsy-bs*.18).toFixed(1)}" r="${(bs*.54).toFixed(1)}" fill="${A}" stroke="${c1}" stroke-width="1" filter="url(#sk${uid})"/>`);
      out.push(`<circle cx="${jit(bsx-bs*.2).toFixed(1)}" cy="${jit(bsy-bs*.22).toFixed(1)}" r="${(bs*.12).toFixed(1)}" fill="${c1}"/>`);
      out.push(`<circle cx="${jit(bsx+bs*.2).toFixed(1)}" cy="${jit(bsy-bs*.22).toFixed(1)}" r="${(bs*.12).toFixed(1)}" fill="${c1}"/>`);
      for (let i = -1; i <= 1; i++)
        out.push(`<rect x="${jit(bsx+i*bs*.2-bs*.07).toFixed(1)}" y="${jit(bsy+bs*.2).toFixed(1)}" width="${(bs*.16).toFixed(1)}" height="${(bs*.3).toFixed(1)}" rx="1" fill="${A}" stroke="${c1}" stroke-width=".5"/>`);
      break;
    case 'eye':
      out.push(`<ellipse cx="${jit(bsx).toFixed(1)}" cy="${jit(bsy).toFixed(1)}" rx="${(bs*.74).toFixed(1)}" ry="${(bs*.4).toFixed(1)}" fill="${c1}" stroke="${A}" stroke-width="1.2" filter="url(#sk${uid})"/>`);
      out.push(`<circle cx="${jit(bsx).toFixed(1)}" cy="${jit(bsy).toFixed(1)}" r="${(bs*.26).toFixed(1)}" fill="${A}"/>`);
      out.push(`<circle cx="${jit(bsx).toFixed(1)}" cy="${jit(bsy).toFixed(1)}" r="${(bs*.1).toFixed(1)}"  fill="${c1}"/>`);
      break;
    case 'wings':
      out.push(`<path d="M${bsx},${bsy} C${jit(bsx-bs*1.7,6)},${jit(bsy-bs*.9,6)} ${jit(bsx-bs,6)},${jit(bsy+bs*.5,6)} ${bsx},${jit(bsy+bs*.32,4)}" fill="${A}" fill-opacity=".78" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"/>`);
      out.push(`<path d="M${bsx},${bsy} C${jit(bsx+bs*1.7,6)},${jit(bsy-bs*.9,6)} ${jit(bsx+bs,6)},${jit(bsy+bs*.5,6)} ${bsx},${jit(bsy+bs*.32,4)}" fill="${A}" fill-opacity=".78" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"/>`);
      break;
    case 'crown':
      out.push(wp([[bsx-bs*.65,bsy+bs*.32],[bsx-bs*.65,bsy-bs*.22],[bsx-bs*.32,bsy-bs*.74],[bsx,bsy-bs*.22],[bsx+bs*.32,bsy-bs*.74],[bsx+bs*.65,bsy-bs*.22],[bsx+bs*.65,bsy+bs*.32]],
        `fill="${A}" stroke="${c1}" stroke-width="1" filter="url(#sk${uid})"`));
      break;
    default: // dragon + fallback hex
      out.push(wp([[bsx,bsy-bs],[bsx+bs*.62,bsy-bs*.32],[bsx+bs*.9,bsy+bs*.4],[bsx,bsy+bs],[bsx-bs*.9,bsy+bs*.4],[bsx-bs*.62,bsy-bs*.32]],
        `fill="${A}" stroke="${c1}" stroke-width="1" filter="url(#sk${uid})"`));
  }
  out.push(`</g>`);

  /* ─── WEAPON ────────────────────────────────────────── */
  const wpn = nft.traits.weapon.val;
  const wx  = bx + tW + armW*1.6, wy = by - tH*.28;
  if (wpn !== 'none') {
    out.push(`<g filter="url(#sk${uid})">`);
    switch (wpn) {
      case 'sword':
        out.push(wp([[wx-w*.024,wy+h*.25],[wx+w*.024,wy+h*.25],[wx+w*.009,wy-h*.22],[wx-w*.009,wy-h*.22]],
          `fill="${A}" stroke="${A}" stroke-width="1.8"/>`));
        out.push(`<line x1="${jit(wx+w*.007)}" y1="${jit(wy+h*.22)}" x2="${jit(wx+w*.007)}" y2="${jit(wy-h*.2)}" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/>`);
        out.push(`<rect x="${jit(wx-w*.044)}" y="${jit(wy+h*.23)}" width="${(w*.088).toFixed(1)}" height="${(h*.024).toFixed(1)}" rx="2" fill="${P}" stroke="${A}" stroke-width="1.2"/>`);
        out.push(wp([[wx-w*.009,wy-h*.22],[wx+w*.009,wy-h*.22],[wx,wy-h*.31]],
          `fill="${A}" stroke="${A}" stroke-width="1"/>`));
        break;
      case 'blaster':
        out.push(`<rect x="${jit(wx-w*.064)}" y="${jit(wy-h*.045)}" width="${(w*.134).toFixed(1)}" height="${(h*.075).toFixed(1)}" rx="4" fill="${P}" stroke="${A}" stroke-width="1.8"/>`);
        out.push(`<rect x="${jit(wx+w*.044)}" y="${jit(wy-h*.014)}" width="${(w*.065).toFixed(1)}" height="${(h*.03).toFixed(1)}"  rx="1" fill="${A}"/>`);
        out.push(`<circle cx="${jit(wx-w*.028)}" cy="${wy.toFixed(1)}" r="${(w*.024).toFixed(1)}" fill="${A}" fill-opacity=".55" stroke="${A}" stroke-width="1.2" filter="url(#glow${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.03)}"  y="${jit(wy-h*.074)}" width="${(w*.06).toFixed(1)}" height="${(h*.028).toFixed(1)}" rx="2" fill="${A}" fill-opacity=".6" stroke="${A}" stroke-width="1"/>`);
        out.push(`<rect x="${jit(wx-w*.022)}" y="${jit(wy+h*.028)}" width="${(w*.042).toFixed(1)}" height="${(h*.04).toFixed(1)}"  rx="1" fill="${A}" fill-opacity=".42"/>`);
        break;
      case 'lance':
        out.push(`<line x1="${jit(wx)}" y1="${jit(wy+h*.3)}" x2="${jit(wx+w*.014)}" y2="${jit(wy-h*.32)}" stroke="${A}" stroke-width="4.5"/>`);
        out.push(wp([[wx-w*.024,wy-h*.28],[wx+w*.034,wy-h*.28],[wx+w*.014,wy-h*.4]],
          `fill="${A}" stroke="${A}" stroke-width="1.8"/>`));
        for (let i = 0; i < 3; i++) {
          const ly = wy - h*.05 + i*(h*.08);
          out.push(`<rect x="${jit(wx-w*.015)}" y="${jit(ly)}" width="${(w*.032).toFixed(1)}" height="${(h*.016).toFixed(1)}" fill="${A}" fill-opacity=".5" stroke="${A}" stroke-width="1"/>`);
        }
        break;
      case 'shield':
        out.push(wp([[wx-w*.065,wy-h*.16],[wx+w*.065,wy-h*.16],[wx+w*.065,wy+h*.11],[wx,wy+h*.22],[wx-w*.065,wy+h*.11]],
          `fill="${P}" stroke="${A}" stroke-width="2.2"/>`));
        out.push(wp([[wx-w*.033,wy-h*.1],[wx+w*.033,wy-h*.1],[wx+w*.033,wy+h*.07],[wx,wy+h*.14],[wx-w*.033,wy+h*.07]],
          `fill="${A}" fill-opacity=".32" stroke="${A}" stroke-width="1.2"/>`));
        out.push(`<line x1="${jit(wx-w*.04)}" y1="${jit(wy-h*.06)}" x2="${jit(wx+w*.04)}" y2="${jit(wy-h*.06)}" stroke="${A}" stroke-opacity=".5" stroke-width="1"/>`);
        break;
      case 'twin':
        out.push(wp([[wx-w*.024,wy+h*.22],[wx+w*.006,wy+h*.22],[wx-w*.058,wy-h*.2]],  `fill="${A}" stroke="${A}" stroke-width="1.8"/>`));
        out.push(wp([[wx+w*.018,wy+h*.22],[wx+w*.048,wy+h*.22],[wx+w*.082,wy-h*.2]],  `fill="${A}" stroke="${A}" stroke-width="1.8"/>`));
        break;
      case 'cannon':
        out.push(`<rect x="${jit(wx-w*.054)}" y="${jit(wy-h*.068)}" width="${(w*.155).toFixed(1)}" height="${(h*.104).toFixed(1)}" rx="5" fill="${P}" stroke="${A}" stroke-width="2.2"/>`);
        out.push(`<circle cx="${jit(wx-w*.012)}" cy="${wy.toFixed(1)}" r="${(w*.04).toFixed(1)}" fill="${A}" fill-opacity=".35" stroke="${A}" stroke-width="1.8" filter="url(#glow${uid})"/>`);
        out.push(`<rect x="${jit(wx+w*.074)}" y="${jit(wy-h*.024)}" width="${(w*.055).toFixed(1)}" height="${(h*.022).toFixed(1)}" rx="1" fill="${A}"/>`);
        for (let i = 0; i < 3; i++)
          out.push(`<line x1="${jit(wx-w*.04+i*w*.022)}" y1="${jit(wy+h*.04)}" x2="${jit(wx-w*.04+i*w*.022)}" y2="${jit(wy+h*.065)}" stroke="${A}" stroke-opacity=".55" stroke-width="1.5"/>`);
        break;
      case 'gauntlets':
        out.push(`<rect x="${jit(bx-tW-armW*1.44)}" y="${jit(by+armH*.84)}" width="${(armW*1.62).toFixed(1)}" height="${(h*.082).toFixed(1)}" rx="4" fill="${A}" stroke="${A}" stroke-width="1.8" filter="url(#glow${uid})"/>`);
        out.push(`<rect x="${jit(bx+tW-armW*.18)}"  y="${jit(by+armH*.84)}" width="${(armW*1.62).toFixed(1)}" height="${(h*.082).toFixed(1)}" rx="4" fill="${A}" stroke="${A}" stroke-width="1.8" filter="url(#glow${uid})"/>`);
        break;
      case 'staff':
        out.push(`<line x1="${jit(wx)}" y1="${jit(wy+h*.32)}" x2="${jit(wx)}" y2="${jit(wy-h*.32)}" stroke="${A}" stroke-width="3.5"/>`);
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.32)}" r="${(w*.044).toFixed(1)}" fill="${A}" fill-opacity=".55" stroke="${A}" stroke-width="2.2" filter="url(#glowSoft${uid})"/>`);
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.32)}" r="${(w*.02).toFixed(1)}"  fill="${aura.val!=='none' ? aura.color : A}" filter="url(#glow${uid})"/>`);
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.32)}" r="${(w*.06).toFixed(1)}"  fill="none" stroke="${A}" stroke-opacity=".28" stroke-width="1" stroke-dasharray="3,3"/>`);
        break;
    }
    out.push(`</g>`);
  }

  /* ─── HELMET ────────────────────────────────────────── */
  const hx = bx, hy = by - tH*.5;
  const hW = w*.192, hH = h*.205;
  const helm = nft.traits.helmet.val;

  // Neck + collar
  out.push(`<rect x="${jit(hx-w*.05)}" y="${jit(hy+hH*.68)}" width="${(w*.1).toFixed(1)}"  height="${(h*.05).toFixed(1)}"  fill="${P}" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"/>`);
  out.push(`<rect x="${jit(hx-w*.07)}" y="${jit(hy+hH*.76)}" width="${(w*.14).toFixed(1)}" height="${(h*.022).toFixed(1)}" fill="${A}" fill-opacity=".5" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"/>`);

  // Helmet base (angular mech shape)
  out.push(wp([
    [hx-hW,hy-hH*.18],[hx-hW*.78,hy-hH*.6],[hx,hy-hH*.68],[hx+hW*.78,hy-hH*.6],[hx+hW,hy-hH*.18],
    [hx+hW*.88,hy+hH*.42],[hx,hy+hH*.72],[hx-hW*.88,hy+hH*.42]
  ], `fill="url(#suit${uid})" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"`));
  // Helmet highlight
  out.push(wp([[hx-hW*.6,hy-hH*.58],[hx,hy-hH*.66],[hx+hW*.6,hy-hH*.58],[hx+hW*.55,hy-hH*.18],[hx-hW*.55,hy-hH*.18]],
    `fill="url(#suitHi${uid})"`));

  // Faceplate
  out.push(wp([[hx-hW*.62,hy-hH*.18],[hx-hW*.7,hy+hH*.04],[hx-hW*.35,hy+hH*.42],[hx,hy+hH*.52],[hx+hW*.35,hy+hH*.42],[hx+hW*.7,hy+hH*.04],[hx+hW*.62,hy-hH*.18]],
    `fill="${c1}" fill-opacity=".75" stroke="${A}" stroke-width="1.6" filter="url(#sk${uid})"`));

  // Eyes — angular T-visor style
  const ey = hy + hH*.04;
  out.push(wp([[hx-hW*.62,ey-hH*.06],[hx-hW*.12,ey-hH*.06],[hx-hW*.08,ey+hH*.06],[hx-hW*.58,ey+hH*.06]], `fill="${A}" filter="url(#glow${uid})"`));
  out.push(wp([[hx+hW*.12,ey-hH*.06],[hx+hW*.62,ey-hH*.06],[hx+hW*.58,ey+hH*.06],[hx+hW*.08,ey+hH*.06]], `fill="${A}" filter="url(#glow${uid})"`));
  // Inner eye glow
  out.push(`<ellipse cx="${(hx-hW*.36).toFixed(1)}" cy="${ey.toFixed(1)}" rx="${(hW*.18).toFixed(1)}" ry="${(hH*.035).toFixed(1)}" fill="#fff" opacity=".75"/>`);
  out.push(`<ellipse cx="${(hx+hW*.36).toFixed(1)}" cy="${ey.toFixed(1)}" rx="${(hW*.18).toFixed(1)}" ry="${(hH*.035).toFixed(1)}" fill="#fff" opacity=".75"/>`);
  // Centre T-strip
  out.push(`<line x1="${jit(hx-hW*.08)}" y1="${jit(ey-hH*.05)}" x2="${jit(hx+hW*.08)}" y2="${jit(ey-hH*.05)}" stroke="${A}" stroke-opacity=".4" stroke-width="1.5"/>`);
  out.push(`<line x1="${jit(hx-hW*.08)}" y1="${jit(ey+hH*.05)}" x2="${jit(hx+hW*.08)}" y2="${jit(ey+hH*.05)}" stroke="${A}" stroke-opacity=".4" stroke-width="1.5"/>`);
  // Nose ridge
  out.push(`<line x1="${jit(hx)}" y1="${jit(ey+hH*.14)}" x2="${jit(hx)}" y2="${jit(ey+hH*.25)}" stroke="${A}" stroke-opacity=".48" stroke-width="1.8" filter="url(#sk${uid})"/>`);
  // Mouth grill
  for (let i = -2; i <= 2; i++)
    out.push(`<line x1="${jit(hx+i*(hW*.12))}" y1="${jit(ey+hH*.28)}" x2="${jit(hx+i*(hW*.12))}" y2="${jit(ey+hH*.42)}" stroke="${A}" stroke-opacity=".44" stroke-width="1.2" filter="url(#sk${uid})"/>`);
  // Chin plate
  out.push(wp([[hx-hW*.35,hy+hH*.42],[hx+hW*.35,hy+hH*.42],[hx+hW*.28,hy+hH*.65],[hx-hW*.28,hy+hH*.65]],
    `fill="${P}" fill-opacity=".6" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"`));

  /* ─── HELMET VARIANT EXTRAS ──────────────────────────── */
  switch (helm) {
    case 'horned':
      out.push(`<path d="M${jit(hx-hW*.58)} ${jit(hy-hH*.42)} Q${jit(hx-hW*.82)} ${jit(hy-hH*.9)} ${jit(hx-hW*.54)} ${jit(hy-hH*1.22)}" stroke="${A}" stroke-width="3.5" fill="none" stroke-linecap="round" filter="url(#sk${uid})"/>`);
      out.push(`<path d="M${jit(hx+hW*.58)} ${jit(hy-hH*.42)} Q${jit(hx+hW*.82)} ${jit(hy-hH*.9)} ${jit(hx+hW*.54)} ${jit(hy-hH*1.22)}" stroke="${A}" stroke-width="3.5" fill="none" stroke-linecap="round" filter="url(#sk${uid})"/>`);
      break;
    case 'crown':
      for (let i = -2; i <= 2; i++) {
        const cx2 = hx + i*(hW*.4), ch = hH*(.56 + Math.abs(i)*.08);
        out.push(wp([[cx2-hW*.11,hy-hH*.52],[cx2+hW*.11,hy-hH*.52],[cx2,hy-hH*.52-ch*.62]],
          `fill="${A}" fill-opacity=".88" stroke="${A}" stroke-width="1.2" filter="url(#sk${uid})"`));
      }
      break;
    case 'dragon':
      out.push(`<path d="M${jit(hx-hW*.12)} ${jit(hy-hH*.5)} C${jit(hx-hW*.9)} ${jit(hy-hH*1.25)} ${jit(hx-hW*.35)} ${jit(hy-hH*.8)} ${jit(hx)} ${jit(hy-hH*.5)}" fill="${A}" fill-opacity=".85" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"/>`);
      out.push(`<path d="M${jit(hx+hW*.12)} ${jit(hy-hH*.5)} C${jit(hx+hW*.9)} ${jit(hy-hH*1.25)} ${jit(hx+hW*.35)} ${jit(hy-hH*.8)} ${jit(hx)} ${jit(hy-hH*.5)}" fill="${A}" fill-opacity=".85" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"/>`);
      break;
    case 'oni':
      out.push(`<path d="M${jit(hx-hW*.5)} ${jit(hy-hH*.3)} C${jit(hx-hW*.75)} ${jit(hy-hH*1.22)} ${jit(hx-hW*.22)} ${jit(hy-hH*.88)} ${jit(hx-hW*.1)} ${jit(hy-hH*.42)}" fill="${A}" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"/>`);
      out.push(`<path d="M${jit(hx+hW*.5)} ${jit(hy-hH*.3)} C${jit(hx+hW*.75)} ${jit(hy-hH*1.22)} ${jit(hx+hW*.22)} ${jit(hy-hH*.88)} ${jit(hx+hW*.1)} ${jit(hy-hH*.42)}" fill="${A}" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"/>`);
      out.push(`<path d="M${jit(hx-hW*.52)} ${jit(hy+hH*.02)} L${jit(hx-hW*.18)} ${jit(hy-hH*.1)} L${jit(hx)} ${jit(hy+hH*.02)} L${jit(hx+hW*.18)} ${jit(hy-hH*.1)} L${jit(hx+hW*.52)} ${jit(hy+hH*.02)}" stroke="${A}" stroke-width="1.8" fill="none" filter="url(#sk${uid})"/>`);
      break;
    case 'angular':
      out.push(wp([[hx-hW*.1,hy-hH*.52],[hx+hW*.1,hy-hH*.52],[hx+hW*.05,hy-hH*1.12],[hx-hW*.05,hy-hH*1.12]],
        `fill="${A}" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`));
      out.push(wp([[hx-hW*.64,hy-hH*.4],[hx-hW*.18,hy-hH*.4],[hx-hW*.14,hy-hH*.85]],
        `fill="${A}" fill-opacity=".65" stroke="${A}" stroke-width="1.2" filter="url(#sk${uid})"`));
      out.push(wp([[hx+hW*.18,hy-hH*.4],[hx+hW*.64,hy-hH*.4],[hx+hW*.14,hy-hH*.85]],
        `fill="${A}" fill-opacity=".65" stroke="${A}" stroke-width="1.2" filter="url(#sk${uid})"`));
      break;
    case 'legendary':
      out.push(`<circle cx="${hx.toFixed(1)}" cy="${(hy-hH*.5).toFixed(1)}" r="${(hW*.98).toFixed(1)}" fill="none" stroke="${A}" stroke-width="2.2" stroke-dasharray="5,4" filter="url(#glowSoft${uid})"/>`);
      out.push(`<circle cx="${hx.toFixed(1)}" cy="${(hy-hH*.5).toFixed(1)}" r="${(hW*.65).toFixed(1)}" fill="none" stroke="${A}" stroke-width="1" stroke-opacity=".38"/>`);
      for (let i = 0; i < 12; i++) {
        const a = (i/12)*Math.PI*2;
        out.push(`<circle cx="${(hx+Math.cos(a)*hW*.98).toFixed(1)}" cy="${(hy-hH*.5+Math.sin(a)*hW*.98).toFixed(1)}" r="${(1.5+Math.sin(i)*.8).toFixed(1)}" fill="${A}" filter="url(#glow${uid})"/>`);
      }
      break;
    case 'ancient':
      out.push(`<path d="M${jit(hx-hW*.75)} ${jit(hy-hH*.18)} Q${jit(hx-hW*.54)} ${jit(hy-hH*.76)} ${jit(hx)} ${jit(hy-hH*.56)}" stroke="${A}" stroke-width="2.2" fill="none" stroke-opacity=".78" filter="url(#sk${uid})"/>`);
      out.push(`<path d="M${jit(hx+hW*.75)} ${jit(hy-hH*.18)} Q${jit(hx+hW*.54)} ${jit(hy-hH*.76)} ${jit(hx)} ${jit(hy-hH*.56)}" stroke="${A}" stroke-width="2.2" fill="none" stroke-opacity=".78" filter="url(#sk${uid})"/>`);
      for (let i = 0; i < 3; i++)
        out.push(`<line x1="${jit(hx-hW*.38+i*hW*.38)}" y1="${jit(hy+hH*.22)}" x2="${jit(hx-hW*.28+i*hW*.38)}" y2="${jit(hy+hH*.38)}" stroke="${A}" stroke-opacity=".4" stroke-width="1" filter="url(#sk${uid})"/>`);
      break;
    // 'standard' and 'visor' → no extras
  }

  /* ─── WATERMARKS ────────────────────────────────────── */
  out.push(`<text x="${(w*.03).toFixed(1)}"  y="${(h*.975).toFixed(1)}" font-family="monospace" font-size="${(w*.019).toFixed(1)}" fill="rgba(255,255,255,.15)">#${String(nft.id).padStart(4,'0')}</text>`);
  out.push(`<text x="${(w/2).toFixed(1)}"   y="${(h*.975).toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="${(w*.019).toFixed(1)}" fill="${A}" fill-opacity=".35">${suit.label.toUpperCase()}</text>`);
  out.push(`<text x="${(w*.97).toFixed(1)}" y="${(h*.975).toFixed(1)}" text-anchor="end"    font-family="monospace" font-size="${(w*.019).toFixed(1)}" fill="${A}" fill-opacity=".22">MECH RANGERS</text>`);

  out.push(`</svg>`);
  return out.join('');
}
