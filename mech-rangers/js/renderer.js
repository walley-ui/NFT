/* ═════════
   renderer.js — SVG Mech Warrior Art Engine
   Refactored Premium Metal Edition
   ────────── */

let _rcc = 0;

/**
 * Main Entry Point
 * Maintains 100% of original logic, traits, and styling.
 */
function renderSVG(nft, sz = 500) {
  const rng = rng32(nft.seed + 7777);
  const { traits, id, seed } = nft;
  const { suit, background: bg, aura, weapon, badge, helmet } = traits;
  
  const ctx = {
    rng,
    seed,
    uid: `r${id}x${++_rcc}`,
    w: sz,
    h: sz,
    P: suit.primary,
    A: suit.accent,
    c1: bg.color[0],
    c2: bg.color[1],
    isLeft: rng32(seed + 1234)() > 0.5,
   jit: (v, mag = 0.08) => v + (rng() - 0.5) * mag,  
    wp: (pts, attr, jit) => {
        const ps = pts.map(p => `${jit(p[0]).toFixed(1)},${jit(p[1]).toFixed(1)}`).join(' ');
        return `<polygon points="${ps}" ${attr}/>`;
    }
  };

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ctx.w} ${ctx.h}" width="${ctx.w}" height="${ctx.h}" shape-rendering="geometricPrecision">`);
  
  out.push(_renderDefs(ctx, aura));
  out.push(_renderBackground(ctx, bg));
  out.push(_renderAura(ctx, aura));
  out.push(_renderMechBody(ctx, nft.traits));
  out.push(_renderWatermarks(ctx, nft));
  
  out.push(`</svg>`);
  return out.join('');
}

/**
 * Asset Definitions (Gradients, Filters, Patterns)
 * Maintained: Full specular lighting, carbon fiber, and unique salt IDs.
 */
function _renderDefs(ctx, aura) {
  const { uid, P, A, c1, c2, seed } = ctx;
  return `<defs>
    <radialGradient id="bg${uid}" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="${c2}"/><stop offset="100%" stop-color="${c1}"/>
    </radialGradient>
    <linearGradient id="suit${uid}" x1="8%" y1="0%" x2="92%" y2="100%">
      <stop offset="0%" stop-color="${A}" stop-opacity=".95"/>
      <stop offset="45%" stop-color="${P}"/>
      <stop offset="100%" stop-color="${c1}"/>
    </linearGradient>
    <linearGradient id="suitHi${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,.28)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="bevel${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="30%" stop-color="${A}"/><stop offset="70%" stop-color="${P}"/><stop offset="100%" stop-color="rgba(0,0,0,.5)"/>
    </linearGradient>
    <linearGradient id="blade${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0e0e20"/><stop offset="34%" stop-color="#c8c8e0"/><stop offset="50%" stop-color="#f5f5ff"/><stop offset="100%" stop-color="#08080e"/>
    </linearGradient>
    <linearGradient id="bladeTip${uid}" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0)"/><stop offset="100%" stop-color="rgba(255,255,255,.55)"/>
    </linearGradient>
    <linearGradient id="gunmetal${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#46465e"/><stop offset="42%" stop-color="#26263a"/><stop offset="100%" stop-color="#0c0c18"/>
    </linearGradient>
    <linearGradient id="barrel${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0a0a14"/><stop offset="50%" stop-color="#a8a8c8"/><stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
    <linearGradient id="chrome${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0c0c18"/><stop offset="44%" stop-color="#e0e0f0"/><stop offset="100%" stop-color="#0c0c18"/>
    </linearGradient>
    <linearGradient id="titanium${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#585878"/><stop offset="28%" stop-color="${A}" stop-opacity=".88"/><stop offset="55%" stop-color="${P}"/><stop offset="100%" stop-color="#0a0a18"/>
    </linearGradient>
    <linearGradient id="artillery${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#383850"/><stop offset="36%" stop-color="#202034"/><stop offset="100%" stop-color="#0a0a12"/>
    </linearGradient>
    <radialGradient id="orb${uid}" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="rgba(255,255,255,.9)"/><stop offset="30%" stop-color="${A}"/><stop offset="68%" stop-color="${P}"/><stop offset="100%" stop-color="rgba(0,0,0,.6)"/>
    </radialGradient>
    <linearGradient id="knuckle${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#888aaa"/><stop offset="32%" stop-color="${A}" stop-opacity=".8"/><stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>

    <pattern id="carbon${uid}" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="rgba(0,0,0,.08)"/>
      <rect x="0" y="0" width="3" height="3" fill="rgba(255,255,255,.022)"/>
      <rect x="3" y="3" width="3" height="3" fill="rgba(255,255,255,.022)"/>
      <line x1="0" y1="0" x2="3" y2="3" stroke="rgba(255,255,255,.038)" stroke-width=".5"/>
      <line x1="3" y1="0" x2="6" y2="3" stroke="rgba(0,0,0,.055)" stroke-width=".5"/>
      <line x1="0" y1="3" x2="3" y2="6" stroke="rgba(0,0,0,.055)" stroke-width=".5"/>
      <line x1="3" y1="3" x2="6" y2="6" stroke="rgba(255,255,255,.038)" stroke-width=".5"/>
    </pattern>

    <filter id="metal${uid}" x="-5%" y="-5%" width="110%" height="110%">
      <feSpecularLighting surfaceScale="4" specularConstant="1.8" specularExponent="42" lighting-color="#ffffff" result="spec">
        <feDistantLight elevation="52" azimuth="38"/>
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceGraphic" operator="in" result="sm"/>
      <feComposite in="SourceGraphic" in2="sm" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0"/>
    </filter>

    <filter id="wm${uid}" x="-8%" y="-8%" width="116%" height="116%">
      <feSpecularLighting surfaceScale="6" specularConstant="2.4" specularExponent="65" lighting-color="#ffffff" result="spec">
        <feDistantLight elevation="44" azimuth="28"/>
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceGraphic" operator="in" result="sm"/>
      <feComposite in="SourceGraphic" in2="sm" operator="arithmetic" k1="0" k2="1" k3="0.78" k4="0"/>
    </filter>

    <filter id="sk${uid}" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="${seed % 99}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="w"/>
      <feComposite in="w" in2="SourceGraphic" operator="atop"/>
    </filter>

    <filter id="glow${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feColorMatrix in="b" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.8 0" result="boost"/>
      <feMerge><feMergeNode in="boost"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <filter id="bloom${uid}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="11" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

/**
 * Background rendering
 * Maintained: cyber, dimension, golden, volcanic, arctic logic.
 */
function _renderBackground(ctx, bg) {
  const { w, h, uid, A, P, jit, rng } = ctx;
  const out = [`<rect width="${w}" height="${h}" fill="url(#bg${uid})"/>`];

  if (bg.val === 'cyber') {
    for (let i = 0; i < 10; i++) {
      out.push(`<line x1="0" y1="${(h/10*i+jit(0,3)).toFixed(1)}" x2="${w}" y2="${(h/10*i+jit(0,3)).toFixed(1)}" stroke="${A}" stroke-opacity=".055" stroke-width="1.2"/>`);
      out.push(`<line x1="${(w/10*i+jit(0,3)).toFixed(1)}" y1="0" x2="${(w/10*i+jit(0,3)).toFixed(1)}" y2="${h}" stroke="${A}" stroke-opacity=".055" stroke-width="1.2"/>`);
    }
    const b = w*.08;
    [`M${b},${w*.03} L${w*.03},${w*.03} L${w*.03},${b}`,
     `M${w-b},${w*.03} L${w-w*.03},${w*.03} L${w-w*.03},${b}`,
     `M${w*.03},${h-b} L${w*.03},${h-w*.03} L${b},${h-w*.03}`,
     `M${w-w*.03},${h-b} L${w-w*.03},${h-w*.03} L${w-b},${h-w*.03}`
    ].forEach(d => out.push(`<path d="${d}" stroke="${A}" stroke-opacity=".45" stroke-width="2" fill="none" filter="url(#glow${uid})"/>`));
  }
  if (bg.val === 'dimension') {
    out.push(`<circle cx="${w/2}" cy="${h/2}" r="${(w*.42).toFixed(1)}" fill="none" stroke="${A}" stroke-opacity=".11" stroke-width="42" stroke-dasharray="8,5"/>`);
    out.push(`<circle cx="${w/2}" cy="${h/2}" r="${(w*.24).toFixed(1)}" fill="none" stroke="${P}" stroke-opacity=".09" stroke-width="18"/>`);
    for (let i=0;i<12;i++){const a=(i/12)*Math.PI*2;out.push(`<line x1="${w/2}" y1="${h/2}" x2="${(w/2+Math.cos(a)*w).toFixed(1)}" y2="${(h/2+Math.sin(a)*h).toFixed(1)}" stroke="${A}" stroke-opacity=".035" stroke-width="1.2"/>`);}
  }
  if (bg.val === 'golden') {
    for (let i=0;i<28;i++){const a=(i/28)*Math.PI*2;out.push(`<line x1="${w/2}" y1="${h/2}" x2="${(w/2+Math.cos(a)*w).toFixed(1)}" y2="${(h/2+Math.sin(a)*h).toFixed(1)}" stroke="${A}" stroke-opacity=".048" stroke-width="5"/>`);}
  }
  if (bg.val === 'volcanic') out.push(`<ellipse cx="${(w/2).toFixed(1)}" cy="${h}" rx="${(w*.85).toFixed(1)}" ry="${(h*.35).toFixed(1)}" fill="#ff4500" fill-opacity=".11" filter="url(#bloom${uid})"/>`);
  if (bg.val === 'arctic') {
    for(let i=0;i<8;i++){const ix=rng()*w,iy=rng()*h*.5;out.push(`<polygon points="${jit(ix,10)},${jit(iy,10)} ${jit(ix+22,10)},${jit(iy-38,10)} ${jit(ix+42,10)},${jit(iy,10)}" fill="${A}" fill-opacity=".055" stroke="${A}" stroke-opacity=".1" stroke-width="1"/>`);}
  }
  
  // Ground Shadow
  out.push(`<ellipse cx="${(w/2).toFixed(1)}" cy="${(h*.892).toFixed(1)}" rx="${(w*.35).toFixed(1)}" ry="${(h*.065).toFixed(1)}" fill="rgba(0,0,0,.7)" filter="url(#bloom${uid})"/>`);
  out.push(`<ellipse cx="${(w/2).toFixed(1)}" cy="${(h*.889).toFixed(1)}" rx="${(w*.22).toFixed(1)}" ry="${(h*.034).toFixed(1)}" fill="rgba(0,0,0,.45)"/>`);

  return out.join('');
}

/**
 * Aura rendering
 */
function _renderAura(ctx, aura) {
  if (aura.val === 'none') return '';
  const { w, h, uid, rng, jit } = ctx;
  const aC = aura.color;
  const out = [];
  out.push(`<ellipse cx="${(w/2).toFixed(1)}" cy="${(h*.52).toFixed(1)}" rx="${(w*.32).toFixed(1)}" ry="${(h*.48).toFixed(1)}" fill="${aC}" fill-opacity=".042" filter="url(#bloom${uid})"/>`);
  for(let i=0;i<14;i++){const px=w/2+(rng()-.5)*w*.5,py=h*.18+rng()*h*.62,r=.5+rng()*3.8;out.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(1)}" fill="${aC}" fill-opacity="${(.38+rng()*.52).toFixed(2)}" filter="url(#glow${uid})"/>`);}
  if(['electric','plasma','cosmic'].includes(aura.val)){
    for(let i=0;i<5;i++){
      const x1=w/2+(rng()-.5)*w*.42,y1=h*.14+rng()*h*.26,x2=w/2+(rng()-.5)*w*.42,y2=h*.6+rng()*h*.3;
      const cx=(x1+(rng()-.5)*90).toFixed(1),cy=((y1+y2)/2+(rng()-.5)*55).toFixed(1);
      out.push(`<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx},${cy} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${aC}" stroke-opacity="${(.38+rng()*.42).toFixed(2)}" stroke-width="${(.7+rng()*2.2).toFixed(1)}" fill="none" filter="url(#glow${uid})"/>`);
    }
  }
  return out.join('');
}

/**
 * Main Mech Body logic
 * Assembles legs, waist, arms, torso, weapon, and helmet.
 */
function _renderMechBody(ctx, traits) {
  const { w, h, bx=w/2, by=h*.70, tW=w*.20, tH=h*.18, armW=w*.082, armH=h*.195, legW=w*.088, legH=h*.215, uid, A, P, c1, jit, wp, isLeft } = ctx;
  const jC = "rgba(0,0,0,0.6)"; 
  const out = [];

  /* LEGS */
  const lA=`fill="url(#suit${uid})" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid}) url(#metal${uid})"`;
  out.push(wp([[bx-legW*1.15,by+tH*.5],[bx-legW*.12,by+tH*.5],[bx-legW*.22,by+tH*.5+legH],[bx-legW*1.28,by+tH*.5+legH]],lA,jit));
  out.push(wp([[bx-legW*1.15,by+tH*.5],[bx-legW*.12,by+tH*.5],[bx-legW*.22,by+tH*.5+legH],[bx-legW*1.28,by+tH*.5+legH]],`fill="url(#carbon${uid})"`,jit));
  out.push(wp([[bx-legW*1.22,by+tH*.75],[bx-legW*.08,by+tH*.75],[bx-legW*.18,by+tH*.75+legH*.3],[bx-legW*1.32,by+tH*.75+legH*.3]],`fill="url(#bevel${uid})" fill-opacity=".5" stroke="${A}" stroke-width="1.4" filter="url(#sk${uid})"`,jit));
  out.push(wp([[bx+legW*.12,by+tH*.5],[bx+legW*1.15,by+tH*.5],[bx+legW*1.28,by+tH*.5+legH],[bx+legW*.22,by+tH*.5+legH]],lA,jit));
  out.push(wp([[bx+legW*.12,by+tH*.5],[bx+legW*1.15,by+tH*.5],[bx+legW*1.28,by+tH*.5+legH],[bx+legW*.22,by+tH*.5+legH]],`fill="url(#carbon${uid})"`,jit));
  out.push(wp([[bx+legW*.08,by+tH*.75],[bx+legW*1.22,by+tH*.75],[bx+legW*1.32,by+tH*.75+legH*.3],[bx+legW*.18,by+tH*.75+legH*.3]],`fill="url(#bevel${uid})" fill-opacity=".5" stroke="${A}" stroke-width="1.4" filter="url(#sk${uid})"`,jit));
  const ankY=by+tH*.5+legH*.82;
  out.push(`<rect x="${jit(bx-legW*1.22).toFixed(1)}" y="${jit(ankY).toFixed(1)}" width="${(legW*1.14).toFixed(1)}" height="${(legH*.115).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"/>`);
  out.push(`<rect x="${jit(bx+legW*.08).toFixed(1)}"  y="${jit(ankY).toFixed(1)}" width="${(legW*1.14).toFixed(1)}" height="${(legH*.115).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"/>`);
  const fy=by+tH*.5+legH,fh=h*.044;
  out.push(wp([[bx-legW*1.48,fy],[bx-legW*.04,fy],[bx+legW*.04,fy+fh],[bx-legW*1.56,fy+fh]],`fill="${P}" stroke="${A}" stroke-width="2" filter="url(#sk${uid})"`,jit));
  out.push(wp([[bx+legW*.04,fy],[bx+legW*1.48,fy],[bx+legW*1.56,fy+fh],[bx-legW*.04,fy+fh]],`fill="${P}" stroke="${A}" stroke-width="2" filter="url(#sk${uid})"`,jit));

  /* WAIST */
  out.push(wp([[bx-tW*1.15,by+tH*.38],[bx+tW*1.15,by+tH*.38],[bx+tW*0.9,by+tH*.58],[bx-tW*0.9,by+tH*.58]],`fill="${A}" fill-opacity=".52" stroke="${A}" stroke-width="2" filter="url(#sk${uid})"`,jit));
  out.push(`<rect x="${jit(bx-w*.036).toFixed(1)}" y="${jit(by+tH*.4).toFixed(1)}" width="${(w*.072).toFixed(1)}" height="${(h*.042).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1.4" filter="url(#glow${uid})"/>`);
  out.push(`<rect x="${jit(bx-w*.014).toFixed(1)}" y="${jit(by+tH*.41).toFixed(1)}" width="${(w*.028).toFixed(1)}" height="${(h*.022).toFixed(1)}" rx="1" fill="rgba(255,255,255,.48)"/>`);

  /* ARMS */
  const aA=`fill="url(#suit${uid})" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid}) url(#metal${uid})"`;
  const pA=`fill="url(#bevel${uid})" fill-opacity=".72" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"`;
  const eA=`fill="${A}" fill-opacity=".42" stroke="${A}" stroke-width="1" filter="url(#sk${uid})"`;
  out.push(wp([[bx-tW-armW,by-tH*.3],[bx-tW,by-tH*.3],[bx-tW+armW*.28,by+armH],[bx-tW-armW*1.3,by+armH]],aA,jit));
  out.push(wp([[bx-tW-armW*.75,by-tH*.44],[bx-tW+armW*.22,by-tH*.44],[bx-tW+armW*.1,by-tH*.12],[bx-tW-armW*.92,by-tH*.12]],pA,jit));
  out.push(wp([[bx-tW-armW*.9,by+armH*.42],[bx-tW+armW*.1,by+armH*.42],[bx-tW+armW*.05,by+armH*.62],[bx-tW-armW*.85,by+armH*.62]],eA,jit));
  out.push(wp([[bx+tW,by-tH*.3],[bx+tW+armW,by-tH*.3],[bx+tW+armW*1.3,by+armH],[bx+tW-armW*.28,by+armH]],aA,jit));
  out.push(wp([[bx+tW-armW*.22,by-tH*.44],[bx+tW+armW*.75,by-tH*.44],[bx+tW+armW*.92,by-tH*.12],[bx+tW-armW*.1,by-tH*.12]],pA,jit));
  out.push(wp([[bx+tW-armW*.1,by+armH*.42],[bx+tW+armW*.9,by+armH*.42],[bx+tW+armW*.85,by+armH*.62],[bx+tW-armW*.05,by+armH*.62]],eA,jit));
  /* fists */
  out.push(`<rect x="${jit(bx-tW-armW*1.4).toFixed(1)}"  y="${jit(by+armH*.82).toFixed(1)}" width="${(armW*1.65).toFixed(1)}" height="${(h*.085).toFixed(1)}" rx="4" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"/>`);
  out.push(`<rect x="${jit(bx+tW-armW*.2).toFixed(1)}"   y="${jit(by+armH*.82).toFixed(1)}" width="${(armW*1.65).toFixed(1)}" height="${(h*.085).toFixed(1)}" rx="4" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"/>`);
  for(let k=0;k<3;k++){
    out.push(`<line x1="${jit(bx-tW-armW*1.04+k*armW*.4).toFixed(1)}" y1="${jit(by+armH*.83).toFixed(1)}" x2="${jit(bx-tW-armW*1.04+k*armW*.4).toFixed(1)}" y2="${jit(by+armH*.83+h*.082).toFixed(1)}" stroke="${A}" stroke-opacity=".38" stroke-width="1"/>`);
    out.push(`<line x1="${jit(bx+tW+armW*.16+k*armW*.4).toFixed(1)}" y1="${jit(by+armH*.83).toFixed(1)}" x2="${jit(bx+tW+armW*.16+k*armW*.4).toFixed(1)}" y2="${jit(by+armH*.83+h*.082).toFixed(1)}" stroke="${A}" stroke-opacity=".38" stroke-width="1"/>`);
  }

  /* TORSO */
  const tPts=[[bx-tW,by-tH*.5],[bx+tW,by-tH*.5],[bx+tW*.84,by+tH*.5],[bx-tW*.84,by+tH*.5]];
  out.push(wp(tPts,`fill="url(#suit${uid})" stroke="${A}" stroke-width="2.6" filter="url(#sk${uid}) url(#metal${uid})"`,jit));
  out.push(wp(tPts,`fill="url(#carbon${uid})"`,jit));
  out.push(wp([[bx-tW*.5,by-tH*.5],[bx+tW*.5,by-tH*.5],[bx+tW*.42,by-tH*.1],[bx-tW*.42,by-tH*.1]],`fill="url(#suitHi${uid})"`,jit));
  out.push(`<line x1="${jit(bx-tW*.52).toFixed(1)}" y1="${jit(by-tH*.28).toFixed(1)}" x2="${jit(bx+tW*.52).toFixed(1)}" y2="${jit(by-tH*.28).toFixed(1)}" stroke="${A}" stroke-opacity=".52" stroke-width="1.3" filter="url(#sk${uid})"/>`);
  out.push(`<line x1="${jit(bx-tW*.38).toFixed(1)}" y1="${jit(by+tH*.04).toFixed(1)}" x2="${jit(bx+tW*.38).toFixed(1)}" y2="${jit(by+tH*.04).toFixed(1)}" stroke="${A}" stroke-opacity=".52" stroke-width="1.3" filter="url(#sk${uid})"/>`);
  for(let i=0;i<4;i++){const vy=by-tH*.2+i*(tH*.13);out.push(`<line x1="${jit(bx-tW*.88).toFixed(1)}" y1="${jit(vy).toFixed(1)}" x2="${jit(bx-tW*.68).toFixed(1)}" y2="${jit(vy).toFixed(1)}" stroke="${A}" stroke-opacity=".62" stroke-width="1.8"/>`);out.push(`<line x1="${jit(bx+tW*.68).toFixed(1)}" y1="${jit(vy).toFixed(1)}" x2="${jit(bx+tW*.88).toFixed(1)}" y2="${jit(vy).toFixed(1)}" stroke="${A}" stroke-opacity=".62" stroke-width="1.8"/>`);}
  /* BADGE */
  out.push(_renderBadge(ctx, traits.badge.val));

  /* WEAPON */
  out.push(_renderWeapon(ctx, traits.weapon.val, traits.aura));

  /* HELMET */
  out.push(_renderHelmet(ctx, traits.helmet.val));

  return out.join('');
}

function _renderBadge(ctx, badge) {
    const { w, bx, by, tH, uid, A, c1, jit, wp } = ctx;
    const bsx=bx, bsy=by-tH*.12, bs=w*.058;
    const out = [`<g filter="url(#glow${uid})">`];
    switch(badge){
        case 'star':case 'zord':{let sp='';for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r2=i%2===0?bs:bs*.44;sp+=`${jit(bsx+Math.cos(a)*r2).toFixed(1)},${jit(bsy+Math.sin(a)*r2).toFixed(1)} `;}out.push(`<polygon points="${sp}" fill="${A}" stroke="${c1}" stroke-width="1.4" filter="url(#sk${uid})"/>`);out.push(`<polygon points="${sp}" fill="url(#suitHi${uid})" opacity=".45"/>`);break;}
        case 'lightning':out.push(wp([[bsx-bs*.3,bsy-bs],[bsx+bs*.22,bsy-bs*.08],[bsx,bsy-bs*.08],[bsx+bs*.3,bsy+bs],[bsx-bs*.22,bsy+bs*.08],[bsx,bsy+bs*.08]],`fill="${A}" stroke="${c1}" stroke-width="1.4" filter="url(#sk${uid})"`,jit));out.push(wp([[bsx-bs*.3,bsy-bs],[bsx+bs*.22,bsy-bs*.08],[bsx,bsy-bs*.08],[bsx+bs*.3,bsy+bs],[bsx-bs*.22,bsy+bs*.08],[bsx,bsy+bs*.08]],`fill="url(#suitHi${uid})" opacity=".4"`,jit));break;
        case 'diamond':out.push(wp([[bsx,bsy-bs],[bsx+bs*.72,bsy],[bsx,bsy+bs],[bsx-bs*.72,bsy]],`fill="${A}" stroke="${c1}" stroke-width="1.4" filter="url(#sk${uid})"`,jit));out.push(wp([[bsx,bsy-bs],[bsx+bs*.72,bsy],[bsx,bsy+bs],[bsx-bs*.72,bsy]],`fill="url(#suitHi${uid})" opacity=".45"`,jit));break;
        case 'skull':out.push(`<circle cx="${jit(bsx).toFixed(1)}" cy="${jit(bsy-bs*.18).toFixed(1)}" r="${(bs*.54).toFixed(1)}" fill="${A}" stroke="${c1}" stroke-width="1.4" filter="url(#sk${uid})"/>`);out.push(`<circle cx="${jit(bsx-bs*.2).toFixed(1)}" cy="${jit(bsy-bs*.22).toFixed(1)}" r="${(bs*.12).toFixed(1)}" fill="${c1}"/>`);out.push(`<circle cx="${jit(bsx+bs*.2).toFixed(1)}" cy="${jit(bsy-bs*.22).toFixed(1)}" r="${(bs*.12).toFixed(1)}" fill="${c1}"/>`);for(let i=-1;i<=1;i++)out.push(`<rect x="${jit(bsx+i*bs*.2-bs*.07).toFixed(1)}" y="${jit(bsy+bs*.2).toFixed(1)}" width="${(bs*.16).toFixed(1)}" height="${(bs*.3).toFixed(1)}" rx="1" fill="${A}" stroke="${c1}" stroke-width=".6"/>`);break;
        case 'eye':out.push(`<ellipse cx="${jit(bsx).toFixed(1)}" cy="${jit(bsy).toFixed(1)}" rx="${(bs*.74).toFixed(1)}" ry="${(bs*.4).toFixed(1)}" fill="${c1}" stroke="${A}" stroke-width="1.6" filter="url(#sk${uid})"/>`);out.push(`<circle cx="${jit(bsx).toFixed(1)}" cy="${jit(bsy).toFixed(1)}" r="${(bs*.26).toFixed(1)}" fill="${A}"/>`);out.push(`<circle cx="${jit(bsx-bs*.05).toFixed(1)}" cy="${jit(bsy-bs*.06).toFixed(1)}" r="${(bs*.1).toFixed(1)}" fill="${c1}"/>`);out.push(`<ellipse cx="${jit(bsx-bs*.08).toFixed(1)}" cy="${jit(bsy-bs*.1).toFixed(1)}" rx="${(bs*.06).toFixed(1)}" ry="${(bs*.04).toFixed(1)}" fill="rgba(255,255,255,.7)"/>`);break;
        case 'wings':out.push(`<path d="M${bsx},${bsy} C${jit(bsx-bs*1.85,6)},${jit(bsy-bs*1.05,6)} ${jit(bsx-bs,6)},${jit(bsy+bs*.62,6)} ${bsx},${jit(bsy+bs*.36,4)}" fill="${A}" fill-opacity=".88" stroke="${A}" stroke-width="1.2" filter="url(#sk${uid})"/>`);out.push(`<path d="M${bsx},${bsy} C${jit(bsx+bs*1.85,6)},${jit(bsy-bs*1.05,6)} ${jit(bsx+bs,6)},${jit(bsy+bs*.62,6)} ${bsx},${jit(bsy+bs*.36,4)}" fill="${A}" fill-opacity=".88" stroke="${A}" stroke-width="1.2" filter="url(#sk${uid})"/>`);out.push(`<path d="M${bsx},${bsy-bs*.3} C${jit(bsx-bs*.8,3)},${jit(bsy-bs*.8,3)} ${jit(bsx-bs*.4,3)},${jit(bsy+bs*.1,3)} ${bsx},${jit(bsy+bs*.2,2)}" fill="rgba(255,255,255,.14)"/>`);out.push(`<path d="M${bsx},${bsy-bs*.3} C${jit(bsx+bs*.8,3)},${jit(bsy-bs*.8,3)} ${jit(bsx+bs*.4,3)},${jit(bsy+bs*.1,3)} ${bsx},${jit(bsy+bs*.2,2)}" fill="rgba(255,255,255,.14)"/>`);break;
        case 'crown':out.push(wp([[bsx-bs*.65,bsy+bs*.32],[bsx-bs*.65,bsy-bs*.22],[bsx-bs*.32,bsy-bs*.74],[bsx,bsy-bs*.22],[bsx+bs*.32,bsy-bs*.74],[bsx+bs*.65,bsy-bs*.22],[bsx+bs*.65,bsy+bs*.32]],`fill="${A}" stroke="${c1}" stroke-width="1.4" filter="url(#sk${uid})"`,jit));out.push(wp([[bsx-bs*.65,bsy+bs*.32],[bsx-bs*.65,bsy-bs*.22],[bsx-bs*.32,bsy-bs*.74],[bsx,bsy-bs*.22],[bsx+bs*.32,bsy-bs*.74],[bsx+bs*.65,bsy-bs*.22],[bsx+bs*.65,bsy+bs*.32]],`fill="url(#suitHi${uid})" opacity=".38"`,jit));break;
        case 'dragon':
          out.push(`<path d="M${bsx.toFixed(1)},${(bsy-bs*1.05).toFixed(1)} C${(bsx-bs*.65).toFixed(1)},${(bsy-bs*1.1).toFixed(1)} ${(bsx-bs*1.0).toFixed(1)},${(bsy-bs*.5).toFixed(1)} ${(bsx-bs*.9).toFixed(1)},${(bsy+bs*.05).toFixed(1)} L${(bsx-bs*.7).toFixed(1)},${(bsy+bs*.55).toFixed(1)} C${(bsx-bs*.4).toFixed(1)},${(bsy+bs*.45).toFixed(1)} ${(bsx-bs*.15).toFixed(1)},${(bsy+bs*.7).toFixed(1)} ${bsx.toFixed(1)},${(bsy+bs*.7).toFixed(1)} C${(bsx+bs*.15).toFixed(1)},${(bsy+bs*.7).toFixed(1)} ${(bsx+bs*.4).toFixed(1)},${(bsy+bs*.45).toFixed(1)} ${(bsx+bs*.7).toFixed(1)},${(bsy+bs*.55).toFixed(1)} L${(bsx+bs*.9).toFixed(1)},${(bsy+bs*.05).toFixed(1)} C${(bsx+bs*1.0).toFixed(1)},${(bsy-bs*.5).toFixed(1)} ${(bsx+bs*.65).toFixed(1)},${(bsy-bs*1.1).toFixed(1)} ${bsx.toFixed(1)},${(bsy-bs*1.05).toFixed(1)} Z" fill="${A}" fill-opacity=".92" stroke="${c1}" stroke-width="1.3" filter="url(#sk${uid})"/>`);
          out.push(`<path d="M${(bsx-bs*.28).toFixed(1)},${(bsy+bs*.15).toFixed(1)} Q${bsx.toFixed(1)},${(bsy+bs*.4).toFixed(1)} ${(bsx+bs*.28).toFixed(1)},${(bsy+bs*.15).toFixed(1)}" stroke="${c1}" stroke-width="1" fill="none" opacity=".58"/>`);
          out.push(`<ellipse cx="${(bsx-bs*.32).toFixed(1)}" cy="${(bsy-bs*.22).toFixed(1)}" rx="${(bs*.15).toFixed(1)}" ry="${(bs*.11).toFixed(1)}" fill="${c1}" opacity=".95"/>`);
          out.push(`<ellipse cx="${(bsx+bs*.32).toFixed(1)}" cy="${(bsy-bs*.22).toFixed(1)}" rx="${(bs*.15).toFixed(1)}" ry="${(bs*.11).toFixed(1)}" fill="${c1}" opacity=".95"/>`);
          out.push(`<ellipse cx="${(bsx-bs*.32).toFixed(1)}" cy="${(bsy-bs*.22).toFixed(1)}" rx="${(bs*.04).toFixed(1)}" ry="${(bs*.1).toFixed(1)}" fill="${A}"/>`);
          out.push(`<ellipse cx="${(bsx+bs*.32).toFixed(1)}" cy="${(bsy-bs*.22).toFixed(1)}" rx="${(bs*.04).toFixed(1)}" ry="${(bs*.1).toFixed(1)}" fill="${A}"/>`);
          out.push(`<path d="M${(bsx-bs*.5).toFixed(1)},${(bsy-bs*.75).toFixed(1)} L${(bsx-bs*.72).toFixed(1)},${(bsy-bs*1.45).toFixed(1)} L${(bsx-bs*.32).toFixed(1)},${(bsy-bs*.82).toFixed(1)}" fill="${A}" stroke="${c1}" stroke-width=".9"/>`);
          out.push(`<path d="M${(bsx+bs*.5).toFixed(1)},${(bsy-bs*.75).toFixed(1)} L${(bsx+bs*.72).toFixed(1)},${(bsy-bs*1.45).toFixed(1)} L${(bsx+bs*.32).toFixed(1)},${(bsy-bs*.82).toFixed(1)}" fill="${A}" stroke="${c1}" stroke-width=".9"/>`);
          out.push(`<path d="M${(bsx-bs*.4).toFixed(1)},${(bsy-bs*1.0).toFixed(1)} C${(bsx-bs*.2).toFixed(1)},${(bsy-bs*1.06).toFixed(1)} ${(bsx+bs*.2).toFixed(1)},${(bsy-bs*1.06).toFixed(1)} ${(bsx+bs*.4).toFixed(1)},${(bsy-bs*1.0).toFixed(1)}" fill="rgba(255,255,255,.18)"/>`);
          break;
        default:
          out.push(wp([[bsx,bsy-bs],[bsx+bs*.62,bsy-bs*.32],[bsx+bs*.9,bsy+bs*.4],[bsx,bsy+bs],[bsx-bs*.9,bsy+bs*.4],[bsx-bs*.62,bsy-bs*.32]],`fill="${A}" stroke="${c1}" stroke-width="1.4" filter="url(#sk${uid})"`,jit));
    }
    out.push(`</g>`);
    return out.join('');
}

function _renderWeapon(ctx, wpn, aura) {
    if(wpn === 'none') return '';
    const { w, h, by, tH, armW, tW, uid, A, jit, wp, isLeft, bx } = ctx;
    const lr=isLeft?-1:1;
    const wxBase=tW+armW*1.62;
    const wx=isLeft?bx-wxBase:bx+wxBase,wy=by-tH*.28;
    const out = [`<g>`];
    
    switch(wpn){
      case 'sword':{
        const bw=w*.026,bTop=wy-h*.5,bBot=wy+h*.2;
        out.push(`<polygon points="${(wx-bw).toFixed(1)},${bBot.toFixed(1)} ${(wx+bw).toFixed(1)},${bBot.toFixed(1)} ${(wx+bw*.4).toFixed(1)},${bTop.toFixed(1)} ${(wx-bw*.4).toFixed(1)},${bTop.toFixed(1)}" fill="url(#blade${uid})" filter="url(#wm${uid})"/>`);
        out.push(`<polygon points="${(wx-bw*.4).toFixed(1)},${bTop.toFixed(1)} ${(wx+bw*.4).toFixed(1)},${bTop.toFixed(1)} ${wx.toFixed(1)},${(bTop-h*.11).toFixed(1)}" fill="url(#blade${uid})" filter="url(#wm${uid})"/>`);
        out.push(`<polygon points="${(wx-bw*.07).toFixed(1)},${bBot.toFixed(1)} ${(wx+bw*.07).toFixed(1)},${bBot.toFixed(1)} ${(wx+bw*.02).toFixed(1)},${(bTop-h*.1).toFixed(1)} ${(wx-bw*.02).toFixed(1)},${(bTop-h*.1).toFixed(1)}" fill="url(#bladeTip${uid})" opacity=".9"/>`);
        out.push(`<line x1="${jit(wx+bw*.36)}" y1="${jit(bBot)}" x2="${jit(wx+bw*.04)}" y2="${jit(bTop-h*.1)}" stroke="rgba(255,255,255,.68)" stroke-width="1.5"/>`);
        out.push(`<line x1="${jit(wx-bw*.36)}" y1="${jit(bBot)}" x2="${jit(wx-bw*.04)}" y2="${jit(bTop-h*.1)}" stroke="${A}" stroke-width="1" stroke-opacity=".45"/>`);
        out.push(`<line x1="${(wx+bw*.18).toFixed(1)}" y1="${(bBot-h*.02).toFixed(1)}" x2="${(wx+bw*.07).toFixed(1)}" y2="${(bTop+h*.04).toFixed(1)}" stroke="rgba(0,0,0,.38)" stroke-width="1.6"/>`);
        out.push(`<line x1="${(wx-bw*.18).toFixed(1)}" y1="${(bBot-h*.02).toFixed(1)}" x2="${(wx-bw*.07).toFixed(1)}" y2="${(bTop+h*.04).toFixed(1)}" stroke="rgba(0,0,0,.38)" stroke-width="1.6"/>`);
        out.push(`<rect x="${jit(wx-w*.056)}" y="${jit(bBot-h*.002)}" width="${(w*.112).toFixed(1)}" height="${(h*.028).toFixed(1)}" rx="3" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1.6" filter="url(#wm${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.032)}" y="${jit(bBot+h*.002)}" width="${(w*.064).toFixed(1)}" height="${(h*.01).toFixed(1)}" rx="1" fill="rgba(255,255,255,.32)"/>`);
        for(let g=0;g<6;g++)out.push(`<rect x="${jit(wx-w*.012)}" y="${jit(bBot+h*.006+g*h*.008)}" width="${(w*.024).toFixed(1)}" height="${(h*.006).toFixed(1)}" rx="1" fill="${A}" fill-opacity=".35"/>`);
        out.push(`<ellipse cx="${jit(wx)}" cy="${jit(bBot+h*.055)}" rx="${(w*.022).toFixed(1)}" ry="${(h*.016).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1.2" filter="url(#wm${uid})"/>`);
        break;
      }
      case 'blaster':{
        out.push(`<rect x="${jit(wx-w*.068)}" y="${jit(wy-h*.05)}" width="${(w*.148).toFixed(1)}" height="${(h*.082).toFixed(1)}" rx="5" fill="url(#gunmetal${uid})" stroke="${A}" stroke-width="2" filter="url(#wm${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.068)}" y="${jit(wy-h*.05)}" width="${(w*.148).toFixed(1)}" height="${(h*.082).toFixed(1)}" rx="5" fill="url(#carbon${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.06)}" y="${jit(wy-h*.068)}" width="${(w*.09).toFixed(1)}" height="${(h*.022).toFixed(1)}" rx="3" fill="url(#barrel${uid})" stroke="${A}" stroke-width="1" filter="url(#wm${uid})"/>`);
        out.push(`<circle cx="${jit(wx-w*.02)}" cy="${jit(wy-h*.057)}" r="${(w*.015).toFixed(1)}" fill="${A}" opacity=".8" filter="url(#glow${uid})"/>`);
        out.push(`<circle cx="${jit(wx-w*.02)}" cy="${jit(wy-h*.057)}" r="${(w*.006).toFixed(1)}" fill="rgba(255,255,255,.9)"/>`);
        out.push(`<rect x="${jit(wx+w*.048*lr)}" y="${jit(wy-h*.016)}" width="${(w*.078).toFixed(1)}" height="${(h*.036).toFixed(1)}" rx="5" fill="url(#barrel${uid})" stroke="${A}" stroke-width="1.2" filter="url(#wm${uid})"/>`);
        out.push(`<circle cx="${jit(wx+w*.122*lr)}" cy="${jit(wy)}" r="${(w*.018).toFixed(1)}" fill="${A}" filter="url(#glow${uid})" opacity=".88"/>`);
        out.push(`<circle cx="${jit(wx+w*.122*lr)}" cy="${jit(wy)}" r="${(w*.007).toFixed(1)}" fill="#ffffff"/>`);
        out.push(`<rect x="${jit(wx-w*.024)}" y="${jit(wy+h*.03)}" width="${(w*.044).toFixed(1)}" height="${(h*.042).toFixed(1)}" rx="3" fill="url(#gunmetal${uid})" stroke="${A}" stroke-width="1" filter="url(#wm${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.065)}" y="${jit(wy-h*.048)}" width="${(w*.09).toFixed(1)}" height="${(h*.01).toFixed(1)}" rx="2" fill="rgba(255,255,255,.22)"/>`);
        for(let v=0;v<3;v++)out.push(`<line x1="${jit(wx-w*.04+v*w*.016)}" y1="${jit(wy+h*.015)}" x2="${jit(wx-w*.04+v*w*.016)}" y2="${jit(wy+h*.048)}" stroke="${A}" stroke-opacity=".5" stroke-width="1.2"/>`);
        break;
      }
      case 'lance':{
        out.push(`<line x1="${jit(wx)}" y1="${jit(wy+h*.32)}" x2="${jit(wx+w*.016*lr)}" y2="${jit(wy-h*.36)}" stroke="url(#chrome${uid})" stroke-width="${(w*.028).toFixed(1)}" stroke-linecap="round" filter="url(#wm${uid})"/>`);
        out.push(`<line x1="${jit(wx+w*.005*lr)}" y1="${jit(wy+h*.3)}" x2="${jit(wx+w*.014*lr)}" y2="${jit(wy-h*.34)}" stroke="rgba(255,255,255,.42)" stroke-width="${(w*.005).toFixed(1)}" stroke-linecap="round"/>`);
        out.push(wp([[wx-w*.028,wy-h*.32],[wx+w*.038,wy-h*.32],[wx+w*.018*lr,wy-h*.48]],`fill="url(#blade${uid})" stroke="${A}" stroke-width="1.8" filter="url(#wm${uid})"`,jit));
        out.push(`<line x1="${(wx+w*.038).toFixed(1)}" y1="${(wy-h*.32).toFixed(1)}" x2="${(wx+w*.018*lr).toFixed(1)}" y2="${(wy-h*.48).toFixed(1)}" stroke="rgba(255,255,255,.72)" stroke-width="1.6"/>`);
        for(let i=0;i<4;i++){const ly=wy-h*.05+i*(h*.09);out.push(`<rect x="${jit(wx-w*.019)}" y="${jit(ly)}" width="${(w*.04).toFixed(1)}" height="${(h*.02).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1" filter="url(#wm${uid})"/>`)}
        out.push(`<ellipse cx="${jit(wx)}" cy="${jit(wy+h*.32)}" rx="${(w*.022).toFixed(1)}" ry="${(h*.015).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1" filter="url(#wm${uid})"/>`);
        break;
      }
      case 'shield':{
        out.push(wp([[wx-w*.07,wy-h*.178],[wx+w*.07,wy-h*.178],[wx+w*.07,wy+h*.12],[wx,wy+h*.255],[wx-w*.07,wy+h*.12]],`fill="url(#titanium${uid})" stroke="${A}" stroke-width="2.6" filter="url(#wm${uid})"`,jit));
        out.push(wp([[wx-w*.07,wy-h*.178],[wx+w*.07,wy-h*.178],[wx+w*.07,wy+h*.12],[wx,wy+h*.255],[wx-w*.07,wy+h*.12]],`fill="url(#carbon${uid})"`,jit));
        out.push(wp([[wx-w*.038,wy-h*.11],[wx+w*.038,wy-h*.11],[wx+w*.038,wy+h*.07],[wx,wy+h*.16],[wx-w*.038,wy+h*.07]],`fill="${A}" fill-opacity=".28" stroke="${A}" stroke-width="1.5"`,jit));
        out.push(`<line x1="${jit(wx-w*.052)}" y1="${jit(wy-h*.04)}" x2="${jit(wx+w*.052)}" y2="${jit(wy-h*.04)}" stroke="${A}" stroke-opacity=".65" stroke-width="1.3"/>`);
        out.push(`<line x1="${jit(wx)}" y1="${jit(wy-h*.14)}" x2="${jit(wx)}" y2="${jit(wy+h*.12)}" stroke="${A}" stroke-opacity=".4" stroke-width="1"/>`);
        out.push(`<line x1="${jit(wx-w*.068)}" y1="${jit(wy-h*.175)}" x2="${jit(wx+w*.068)}" y2="${jit(wy-h*.175)}" stroke="rgba(255,255,255,.5)" stroke-width="2"/>`);
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.04)}" r="${(w*.018).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1.2" filter="url(#wm${uid})"/>`);
        break;
      }
      case 'twin':{
        out.push(wp([[wx-w*.03,wy+h*.22],[wx+w*.002,wy+h*.22],[wx-w*.064,wy-h*.2]],`fill="url(#blade${uid})" stroke="${A}" stroke-width="1.8" filter="url(#wm${uid})"`,jit));
        out.push(`<line x1="${(wx-w*.005).toFixed(1)}" y1="${(wy+h*.22).toFixed(1)}" x2="${(wx-w*.056).toFixed(1)}" y2="${(wy-h*.2).toFixed(1)}" stroke="rgba(255,255,255,.58)" stroke-width="1.3"/>`);
        out.push(wp([[wx+w*.014,wy+h*.22],[wx+w*.046,wy+h*.22],[wx+w*.088,wy-h*.2]],`fill="url(#blade${uid})" stroke="${A}" stroke-width="1.8" filter="url(#wm${uid})"`,jit));
        out.push(`<line x1="${(wx+w*.044).toFixed(1)}" y1="${(wy+h*.22).toFixed(1)}" x2="${(wx+w*.082).toFixed(1)}" y2="${(wy-h*.2).toFixed(1)}" stroke="rgba(255,255,255,.58)" stroke-width="1.3"/>`);
        out.push(`<rect x="${jit(wx-w*.034)}" y="${jit(wy+h*.21)}" width="${(w*.096).toFixed(1)}" height="${(h*.026).toFixed(1)}" rx="2" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1.4" filter="url(#wm${uid})"/>`);
        break;
      }
      case 'cannon':{
        out.push(`<rect x="${jit(wx-w*.06)}" y="${jit(wy-h*.075)}" width="${(w*.175).toFixed(1)}" height="${(h*.118).toFixed(1)}" rx="7" fill="url(#artillery${uid})" stroke="${A}" stroke-width="2.6" filter="url(#wm${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.06)}" y="${jit(wy-h*.075)}" width="${(w*.175).toFixed(1)}" height="${(h*.118).toFixed(1)}" rx="7" fill="url(#carbon${uid})"/>`);
        out.push(`<rect x="${jit(wx+w*.085*lr)}" y="${jit(wy-h*.024)}" width="${(w*.078).toFixed(1)}" height="${(h*.032).toFixed(1)}" rx="6" fill="url(#barrel${uid})" stroke="${A}" stroke-width="1.4" filter="url(#wm${uid})"/>`);
        out.push(`<circle cx="${jit(wx-w*.016*lr)}" cy="${jit(wy)}" r="${(w*.048).toFixed(1)}" fill="rgba(0,0,0,.55)" stroke="${A}" stroke-width="2" filter="url(#wm${uid})"/>`);
        out.push(`<circle cx="${jit(wx-w*.016*lr)}" cy="${jit(wy)}" r="${(w*.034).toFixed(1)}" fill="${A}" fill-opacity=".4" filter="url(#bloom${uid})"/>`);
        out.push(`<circle cx="${jit(wx-w*.016*lr)}" cy="${jit(wy)}" r="${(w*.018).toFixed(1)}" fill="${A}" filter="url(#glow${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.055)}" y="${jit(wy-h*.09)}" width="${(w*.1).toFixed(1)}" height="${(h*.018).toFixed(1)}" rx="2" fill="url(#bevel${uid})" stroke="${A}" stroke-width="1" filter="url(#wm${uid})"/>`);
        out.push(`<rect x="${jit(wx-w*.058)}" y="${jit(wy-h*.073)}" width="${(w*.12).toFixed(1)}" height="${(h*.012).toFixed(1)}" rx="3" fill="rgba(255,255,255,.2)"/>`);
        for(let v=0;v<4;v++)out.push(`<line x1="${jit(wx-w*.05+v*w*.024)}" y1="${jit(wy+h*.048)}" x2="${jit(wx-w*.05+v*w*.024)}" y2="${jit(wy+h*.078)}" stroke="${A}" stroke-opacity=".6" stroke-width="2"/>`);
        break;
      }
      case 'gauntlets':{
        out.push(`<rect x="${jit(bx-tW-armW*1.46).toFixed(1)}" y="${jit(by+armH*.83).toFixed(1)}" width="${(armW*1.68).toFixed(1)}" height="${(h*.088).toFixed(1)}" rx="5" fill="url(#bevel${uid})" stroke="${A}" stroke-width="2" filter="url(#wm${uid})"/>`);
        out.push(`<rect x="${jit(bx-tW-armW*1.46).toFixed(1)}" y="${jit(by+armH*.83).toFixed(1)}" width="${(armW*1.68).toFixed(1)}" height="${(h*.088).toFixed(1)}" rx="5" fill="url(#carbon${uid})"/>`);
        out.push(`<rect x="${jit(bx+tW-armW*.2).toFixed(1)}"  y="${jit(by+armH*.83).toFixed(1)}" width="${(armW*1.68).toFixed(1)}" height="${(h*.088).toFixed(1)}" rx="5" fill="url(#bevel${uid})" stroke="${A}" stroke-width="2" filter="url(#wm${uid})"/>`);
        out.push(`<rect x="${jit(bx+tW-armW*.2).toFixed(1)}"  y="${jit(by+armH*.83).toFixed(1)}" width="${(armW*1.68).toFixed(1)}" height="${(h*.088).toFixed(1)}" rx="5" fill="url(#carbon${uid})"/>`);
        for(let k=0;k<4;k++){
          out.push(`<rect x="${jit(bx-tW-armW*1.38+k*armW*.36).toFixed(1)}" y="${jit(by+armH*.82).toFixed(1)}" width="${(armW*.28).toFixed(1)}" height="${(h*.022).toFixed(1)}" rx="2" fill="url(#knuckle${uid})" stroke="${A}" stroke-width=".8" filter="url(#wm${uid})"/>`);
          out.push(`<rect x="${jit(bx+tW-armW*.12+k*armW*.36).toFixed(1)}" y="${jit(by+armH*.82).toFixed(1)}" width="${(armW*.28).toFixed(1)}" height="${(h*.022).toFixed(1)}" rx="2" fill="url(#knuckle${uid})" stroke="${A}" stroke-width=".8" filter="url(#wm${uid})"/>`);
        }
        out.push(`<ellipse cx="${jit(bx-tW-armW*.62)}" cy="${jit(by+armH*.876)}" rx="${(armW*.55).toFixed(1)}" ry="${(h*.03).toFixed(1)}" fill="${A}" fill-opacity=".25" filter="url(#glow${uid})"/>`);
        out.push(`<ellipse cx="${jit(bx+tW+armW*.64)}" cy="${jit(by+armH*.876)}" rx="${(armW*.55).toFixed(1)}" ry="${(h*.03).toFixed(1)}" fill="${A}" fill-opacity=".25" filter="url(#glow${uid})"/>`);
        break;
      }
       case 'staff':{
        out.push(`<line x1="${jit(wx)}" y1="${jit(wy+h*.36)}" x2="${jit(wx)}" y2="${jit(wy-h*.36)}" stroke="url(#chrome${uid})" stroke-width="${(w*.022).toFixed(1)}" stroke-linecap="round" filter="url(#wm${uid})"/>`);
        out.push(`<line x1="${jit(wx+w*.004*lr)}" y1="${jit(wy+h*.34)}" x2="${jit(wx+w*.004*lr)}" y2="${jit(wy-h*.34)}" stroke="rgba(255,255,255,.35)" stroke-width="${(w*.004).toFixed(1)}" stroke-linecap="round"/>`);
        for(let r2=0;r2<3;r2++){const ry=wy+h*.15-r2*(h*.18);out.push(`<rect x="${jit(wx-w*.016)}" y="${jit(ry)}" width="${(w*.032).toFixed(1)}" height="${(h*.018).toFixed(1)}" fill="url(#bevel${uid})" stroke="${A}" stroke-width=".8" filter="url(#wm${uid})"/>`)}
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.36)}" r="${(w*.058).toFixed(1)}" fill="rgba(0,0,0,.52)" stroke="${A}" stroke-width="2.2" filter="url(#wm${uid})"/>`);
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.36)}" r="${(w*.046).toFixed(1)}" fill="url(#orb${uid})" filter="url(#bloom${uid})"/>`);
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.36)}" r="${(w*.02).toFixed(1)}" fill="${aura.val !== 'none' ? aura.color : A}" filter="url(#glow${uid})"/>`);
        out.push(`<circle cx="${jit(wx)}" cy="${jit(wy-h*.36)}" r="${(w*.066).toFixed(1)}" fill="none" stroke="${A}" stroke-opacity=".4" stroke-width="1.3" stroke-dasharray="4,4"/>`);
        out.push(`<ellipse cx="${jit(wx)}" cy="${jit(wy-h*.36)}" rx="${(w*.066).toFixed(1)}" ry="${(w*.03).toFixed(1)}" fill="none" stroke="${A}" stroke-opacity=".24" stroke-width="1" stroke-dasharray="3,5" transform="rotate(60,${wx.toFixed(1)},${(wy-h*.36).toFixed(1)})"/>`);
        break;
      }
    }
    out.push(`</g>`);
    return out.join('');
}

function _renderHelmet(ctx, helm) {
  const { w, h, bx, by, tH, uid, A, P, c1, jit, wp } = ctx;
  const hx=bx, hy=by-tH*.92, hW=w*.11, hH=h*.13; 
    const out = [];
    out.push(`<rect x="${jit(hx-w*.05)}" y="${jit(hy+hH*.68)}" width="${(w*.1).toFixed(1)}"  height="${(h*.056).toFixed(1)}" fill="${P}" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"/>`);
    out.push(`<rect x="${jit(hx-w*.076)}" y="${jit(hy+hH*.77)}" width="${(w*.152).toFixed(1)}" height="${(h*.026).toFixed(1)}" fill="url(#bevel${uid})" fill-opacity=".65" stroke="${A}" stroke-width="1.2" filter="url(#sk${uid})"/>`);
    const hPts=[[hx-hW,hy-hH*.18],[hx-hW*.78,hy-hH*.6],[hx,hy-hH*.68],[hx+hW*.78,hy-hH*.6],[hx+hW,hy-hH*.18],[hx+hW*.88,hy+hH*.42],[hx,hy+hH*.72],[hx-hW*.88,hy+hH*.42]];
    out.push(wp(hPts,`fill="url(#suit${uid})" stroke="${A}" stroke-width="2.8" filter="url(#sk${uid}) url(#metal${uid})"`,jit));
    out.push(wp(hPts,`fill="url(#carbon${uid})"`,jit));
    out.push(wp([[hx-hW*.62,hy-hH*.56],[hx,hy-hH*.64],[hx+hW*.62,hy-hH*.56],[hx+hW*.56,hy-hH*.18],[hx-hW*.56,hy-hH*.18]],`fill="url(#suitHi${uid})"`,jit));
    out.push(wp([[hx-hW*.62,hy-hH*.18],[hx-hW*.7,hy+hH*.04],[hx-hW*.35,hy+hH*.42],[hx,hy+hH*.54],[hx+hW*.35,hy+hH*.42],[hx+hW*.7,hy+hH*.04],[hx+hW*.62,hy-hH*.18]],`fill="${c1}" fill-opacity=".88" stroke="${A}" stroke-width="1.8" filter="url(#sk${uid})"`,jit));
    const ey=hy+hH*.04;
    out.push(wp([[hx-hW*.62,ey-hH*.07],[hx-hW*.12,ey-hH*.07],[hx-hW*.08,ey+hH*.07],[hx-hW*.58,ey+hH*.07]],`fill="${A}" filter="url(#glow${uid})"`,jit));
    out.push(wp([[hx+hW*.12,ey-hH*.07],[hx+hW*.62,ey-hH*.07],[hx+hW*.58,ey+hH*.07],[hx+hW*.08,ey+hH*.07]],`fill="${A}" filter="url(#glow${uid})"`,jit));
    out.push(`<ellipse cx="${(hx-hW*.36).toFixed(1)}" cy="${ey.toFixed(1)}" rx="${(hW*.2).toFixed(1)}"  ry="${(hH*.04).toFixed(1)}" fill="#ffffff" opacity=".88"/>`);
    out.push(`<ellipse cx="${(hx+hW*.36).toFixed(1)}" cy="${ey.toFixed(1)}" rx="${(hW*.2).toFixed(1)}"  ry="${(hH*.04).toFixed(1)}" fill="#ffffff" opacity=".88"/>`);
    out.push(`<line x1="${jit(hx-hW*.08)}" y1="${jit(ey-hH*.06)}" x2="${jit(hx+hW*.08)}" y2="${jit(ey-hH*.06)}" stroke="${A}" stroke-opacity=".52" stroke-width="2"/>`);
    out.push(`<line x1="${jit(hx-hW*.08)}" y1="${jit(ey+hH*.06)}" x2="${jit(hx+hW*.08)}" y2="${jit(ey+hH*.06)}" stroke="${A}" stroke-opacity=".52" stroke-width="2"/>`);
    out.push(`<line x1="${jit(hx)}" y1="${jit(ey+hH*.14)}" x2="${jit(hx)}" y2="${jit(ey+hH*.28)}" stroke="${A}" stroke-opacity=".58" stroke-width="2.2" filter="url(#sk${uid})"/>`);
    for(let i=-2;i<=2;i++)out.push(`<line x1="${jit(hx+i*(hW*.12))}" y1="${jit(ey+hH*.32)}" x2="${jit(hx+i*(hW*.12))}" y2="${jit(ey+hH*.46)}" stroke="${A}" stroke-opacity=".52" stroke-width="1.5" filter="url(#sk${uid})"/>`);
    out.push(wp([[hx-hW*.35,hy+hH*.42],[hx+hW*.35,hy+hH*.42],[hx+hW*.28,hy+hH*.68],[hx-hW*.28,hy+hH*.68]],`fill="${P}" fill-opacity=".72" stroke="${A}" stroke-width="1.3" filter="url(#sk${uid})"`,jit));

    switch(helm){
      case 'horned':
        out.push(`<path d="M${jit(hx-hW*.58)} ${jit(hy-hH*.44)} Q${jit(hx-hW*.88)} ${jit(hy-hH*.98)} ${jit(hx-hW*.62)} ${jit(hy-hH*1.35)}" stroke="${A}" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#sk${uid})"/>`);
        out.push(`<path d="M${jit(hx-hW*.58)} ${jit(hy-hH*.44)} Q${jit(hx-hW*.88)} ${jit(hy-hH*.98)} ${jit(hx-hW*.62)} ${jit(hy-hH*1.35)}" stroke="rgba(255,255,255,.25)" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
        out.push(`<path d="M${jit(hx+hW*.58)} ${jit(hy-hH*.44)} Q${jit(hx+hW*.88)} ${jit(hy-hH*.98)} ${jit(hx+hW*.62)} ${jit(hy-hH*1.35)}" stroke="${A}" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#sk${uid})"/>`);
        out.push(`<path d="M${jit(hx+hW*.58)} ${jit(hy-hH*.44)} Q${jit(hx+hW*.88)} ${jit(hy-hH*.98)} ${jit(hx+hW*.62)} ${jit(hy-hH*1.35)}" stroke="rgba(255,255,255,.25)" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
        break;
      case 'crown':
        for(let i=-2;i<=2;i++){const cx2=hx+i*(hW*.42),ch=hH*(.62+Math.abs(i)*.1);out.push(wp([[cx2-hW*.12,hy-hH*.55],[cx2+hW*.12,hy-hH*.55],[cx2,hy-hH*.55-ch*.65]],`fill="url(#bevel${uid})" fill-opacity=".95" stroke="${A}" stroke-width="1.6" filter="url(#sk${uid}) url(#glow${uid})"`,jit));}
        break;
      case 'dragon':
        out.push(`<path d="M${jit(hx-hW*.14)} ${jit(hy-hH*.52)} C${jit(hx-hW*1.02)} ${jit(hy-hH*1.32)} ${jit(hx-hW*.42)} ${jit(hy-hH*.86)} ${jit(hx)} ${jit(hy-hH*.52)}" fill="${A}" fill-opacity=".92" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"/>`);
        out.push(`<path d="M${jit(hx-hW*.14)} ${jit(hy-hH*.52)} C${jit(hx-hW*1.02)} ${jit(hy-hH*1.32)} ${jit(hx-hW*.42)} ${jit(hy-hH*.86)} ${jit(hx)} ${jit(hy-hH*.52)}" fill="url(#suitHi${uid})" opacity=".28"/>`);
        out.push(`<path d="M${jit(hx+hW*.14)} ${jit(hy-hH*.52)} C${jit(hx+hW*1.02)} ${jit(hy-hH*1.32)} ${jit(hx+hW*.42)} ${jit(hy-hH*.86)} ${jit(hx)} ${jit(hy-hH*.52)}" fill="${A}" fill-opacity=".92" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"/>`);
        out.push(`<path d="M${jit(hx+hW*.14)} ${jit(hy-hH*.52)} C${jit(hx+hW*1.02)} ${jit(hy-hH*1.32)} ${jit(hx+hW*.42)} ${jit(hy-hH*.86)} ${jit(hx)} ${jit(hy-hH*.52)}" fill="url(#suitHi${uid})" opacity=".28"/>`);
        break;
      case 'oni':
        out.push(`<path d="M${jit(hx-hW*.54)} ${jit(hy-hH*.34)} C${jit(hx-hW*.82)} ${jit(hy-hH*1.28)} ${jit(hx-hW*.26)} ${jit(hy-hH*.92)} ${jit(hx-hW*.13)} ${jit(hy-hH*.47)}" fill="${A}" stroke="${A}" stroke-width="2.8" filter="url(#sk${uid})"/>`);
        out.push(`<path d="M${jit(hx+hW*.54)} ${jit(hy-hH*.34)} C${jit(hx+hW*.82)} ${jit(hy-hH*1.28)} ${jit(hx+hW*.26)} ${jit(hy-hH*.92)} ${jit(hx+hW*.13)} ${jit(hy-hH*.47)}" fill="${A}" stroke="${A}" stroke-width="2.8" filter="url(#sk${uid})"/>`);
        out.push(`<path d="M${jit(hx-hW*.56)} ${jit(hy+hH*.04)} L${jit(hx-hW*.2)} ${jit(hy-hH*.13)} L${jit(hx)} ${jit(hy+hH*.04)} L${jit(hx+hW*.2)} ${jit(hy-hH*.13)} L${jit(hx+hW*.56)} ${jit(hy+hH*.04)}" stroke="${A}" stroke-width="2.2" fill="none" filter="url(#sk${uid})"/>`);
        break;
      case 'angular':
        out.push(wp([[hx-hW*.12,hy-hH*.56],[hx+hW*.12,hy-hH*.56],[hx+hW*.06,hy-hH*1.18],[hx-hW*.06,hy-hH*1.18]],`fill="url(#bevel${uid})" stroke="${A}" stroke-width="2.2" filter="url(#sk${uid})"`,jit));
        out.push(wp([[hx-hW*.7,hy-hH*.46],[hx-hW*.22,hy-hH*.46],[hx-hW*.16,hy-hH*.92]],`fill="url(#bevel${uid})" fill-opacity=".78" stroke="${A}" stroke-width="1.5" filter="url(#sk${uid})"`,jit));
        out.push(wp([[hx+hW*.22,hy-hH*.46],[hx+hW*.7,hy-hH*.46],[hx+hW*.16,hy-hH*.92]],`fill="url(#bevel${uid})" fill-opacity=".78" stroke="${A}" stroke-width="1.5" filter="url(#sk${uid})"`,jit));
        break;
      case 'legendary':
        out.push(`<circle cx="${hx.toFixed(1)}" cy="${(hy-hH*.5).toFixed(1)}" r="${(hW*1.06).toFixed(1)}" fill="none" stroke="${A}" stroke-width="3" stroke-dasharray="6,4" filter="url(#bloom${uid})"/>`);
        out.push(`<circle cx="${hx.toFixed(1)}" cy="${(hy-hH*.5).toFixed(1)}" r="${(hW*.7).toFixed(1)}"   fill="none" stroke="${A}" stroke-width="1.2" stroke-opacity=".42"/>`);
        for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2,r2=hW*1.06;out.push(`<circle cx="${(hx+Math.cos(a)*r2).toFixed(1)}" cy="${(hy-hH*.5+Math.sin(a)*r2).toFixed(1)}" r="${(1.8+Math.sin(i)*1.1).toFixed(1)}" fill="${A}" filter="url(#glow${uid})"/>`);}
        break;
      case 'ancient':
        out.push(`<path d="M${jit(hx-hW*.82)} ${jit(hy-hH*.22)} Q${jit(hx-hW*.62)} ${jit(hy-hH*.88)} ${jit(hx)} ${jit(hy-hH*.66)}" stroke="${A}" stroke-width="2.8" fill="none" stroke-opacity=".88" filter="url(#sk${uid})"/>`);
        out.push(`<path d="M${jit(hx+hW*.82)} ${jit(hy-hH*.22)} Q${jit(hx+hW*.62)} ${jit(hy-hH*.88)} ${jit(hx)} ${jit(hy-hH*.66)}" stroke="${A}" stroke-width="2.8" fill="none" stroke-opacity=".88" filter="url(#sk${uid})"/>`);
        for(let i=0;i<4;i++)out.push(`<line x1="${jit(hx-hW*.42+i*hW*.3)}" y1="${jit(hy+hH*.26)}" x2="${jit(hx-hW*.32+i*hW*.3)}" y2="${jit(hy+hH*.42)}" stroke="${A}" stroke-opacity=".52" stroke-width="1.3" filter="url(#sk${uid})"/>`);
        break;
    }
    return out.join('');
}

/**
 * Text Overlays
 */
function _renderWatermarks(ctx, nft) {
  const { w, h, A } = ctx;
  return `
    <text x="${(w*.03).toFixed(1)}" y="${(h*.975).toFixed(1)}" font-family="monospace" font-weight="bold" font-size="${(w*.022).toFixed(1)}" fill="rgba(255,255,255,.22)">#${String(nft.id).padStart(4,'0')}</text>
    <text x="${(w/2).toFixed(1)}" y="${(h*.975).toFixed(1)}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="${(w*.022).toFixed(1)}" fill="${A}" fill-opacity=".48">${nft.traits.suit.label.toUpperCase()}</text>
    <text x="${(w*.97).toFixed(1)}" y="${(h*.975).toFixed(1)}" text-anchor="end" font-family="monospace" font-weight="bold" font-size="${(w*.022).toFixed(1)}" fill="${A}" fill-opacity=".32">MECH RANGERS</text>
  `;
}
