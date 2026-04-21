export function getFAQHTML() {
  return `
    <div class="faq-standalone-container" style="margin-top: 50px; padding: 30px; border-top: 2px solid #5d2a18; background: rgba(12, 8, 7, 0.95);">
      <div class="faq-content">
        <h2 style="font-family:'Bebas Neue'; color:#eeeef8; margin-top:0; letter-spacing:4px; text-align:center; font-size: 2.5rem;">THE VANDOR LOGS</h2>
        
        <div style="background: rgba(0, 230, 118, 0.05); padding: 15px; border-left: 3px solid #00e676; margin-bottom: 40px;">
          <p style="color:#00e676; font-family:'Share Tech Mono'; font-size: 0.85rem; margin: 0;">
            <strong>[LOG START] UNIT 734 (RUSTY):</strong> "Oh, great. Another recruit. Listen, I’m the one who has to buff the scratches out of these 10,000-ton death machines. If you blow yours up in the first five minutes, don't come crying to my repair bay. I'm busy. Here’s the data dump. Read it or don't, I'm not your mother-board."
          </p>
        </div>

        <div style="display: grid; gap: 40px;">
          
          <section>
            <h3 style="font-family:'Bebas Neue'; color:#8b4513; border-bottom: 1px solid #5d2a18; letter-spacing: 2px;">THE DEPLOYMENT (HOW DO I GET ONE?)</h3>
            <p style="font-family:'Share Tech Mono'; color:#eee; font-size: 0.9rem; margin-top: 15px;">RUSTY'S TAKE:</p>
            <p style="font-family:'Share Tech Mono'; color:#6a6a9a; font-size: 0.8rem; line-height: 1.7;">
              "Look, the 'Big Brains' haven't given us the exact second we launch yet. They say 'Deployment Imminent'—which is Commander-speak for 'we're still loading the batteries.' Price? It’s fair. If you have to ask, you probably can't afford the fuel anyway. But we’re keeping it steady so the whole Resistance can actually fight."
            </p>
            
            <p style="font-family:'Share Tech Mono'; color:#eee; font-size: 0.9rem; margin-top: 20px;">COMMANDER VARK'S INTEL (THE STRUCTURE):</p>
            <p style="font-family:'Share Tech Mono'; color:#6a6a9a; font-size: 0.8rem; line-height: 1.7;">
              "We have 10,000 Mechs ready for orbit. We’ve hand-picked 700 of you—the legends, the creators, the ones who didn't run when things got loud—to get yours first. 4,300 are reserved for the GTD operatives. The remaining 5,000? That’s an FCFC scrap-heap. First come, first claimed. If you're slow, you're walking. And walking on Vandor is a death sentence."
            </p>
          </section>

          <section>
            <h3 style="font-family:'Bebas Neue'; color:#8b4513; border-bottom: 1px solid #5d2a18; letter-spacing: 2px;">WHY ARE WE EVEN HERE?</h3>
            <p style="font-family:'Share Tech Mono'; color:#6a6a9a; font-size: 0.8rem; line-height: 1.7;">
              <strong>UNIT 734:</strong> "Because some genius decided to poke a hole in deep space and now things with too many teeth are coming through. These Mechs? They weren't built for parades. They were built because we’re tired of being the galaxy's chew-toy. You mint a Mech, you get a seat at the table. You get 'Stronghold' airdrops (which are basically Christmas for soldiers) and access to the games. Plus, you get to look cool while the world ends. Win-win."
            </p>
          </section>

          <section>
            <h3 style="font-family:'Bebas Neue'; color:#8b4513; border-bottom: 1px solid #5d2a18; letter-spacing: 2px;">THE COLD HARD TRUTH</h3>
            <p style="font-family:'Share Tech Mono'; color:#6a6a9a; font-size: 0.8rem; line-height: 1.7;">
              "We call ourselves Mechies. We fight, we argue, and yeah, sometimes Rusty over here accidentally installs a toaster instead of a radar system. But we own our destiny. These Mechs are yours. You upgrade them, you level them up, and if you want to sell your battle-scarred beast on OpenSea, that’s your call. We don't take a cut of your glory. Now, get in the cockpit. We've got work to do."
            </p>
          </section>
          
        </div>

        <p style="text-align:center; color: #5d2a18; font-family:'Share Tech Mono'; font-size: 0.6rem; margin-top: 50px;">
          // END OF TRANSMISSION // VANDOR DEFENSE FORCE RECRUITMENT DIVISION //
        </p>
      </div>
    </div>
  `;
}
