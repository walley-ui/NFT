export function getFAQHTML() {
  return `
    <div id="faq-overlay" onclick="closeFAQ()">
      <div class="faq-modal" onclick="event.stopPropagation()">
        <button class="faq-close" onclick="closeFAQ()">✕</button>
        <div class="faq-content">
          <h2 style="font-family:'Bebas Neue'; color:#eee; margin-top:0; letter-spacing:2px;">INTEL & SURVIVAL GUIDE</h2>
          
          <p style="color:#00e676; font-style:italic; margin-bottom:20px;">
            "Listen close because we're only saying this once. if you actually give a damn about Mech, then sit down and pay attention. This isn’t a game to us. It is survival, plain and simple."
          </p>

          <h3>WHAT ARE WE DOING HERE?</h3>
          <p>We are clawing a future out of the Ethereum network. It is a messy, high-stakes mix of 3D tech and a hard-earned economy. We pilot giant robots called Mechs, and we fight every single day just to keep what is ours from being torn away by the void.</p>

          <h3>THE MECH GENESIS HISTORY </h3>
          <p>There are ten thousand of these Genesis Mechs left, and they are not just some digital assets you can ignore. They are unique souls. We have eight different models and thirteen distinct traits, with stats that actually determine if you live or die when the scrap hits the fan. If you manage to get your hands on one, you are part of the inner circle. That means you get the Stronghold access, the airdrops, and you are always first in line when the new tech drops. In this wasteland, it is the closest thing to royalty we have left.</p>

          <h3>MONEY AND POWER</h3>
          <p>We run a dual-token system because one currency just isn’t enough to keep these engines screaming. First, there is $MECH. That is the big leagues. It is for the staking, the voting, and the marketplace control. If you hold that, you have a real seat at the table to decide how the treasury gets spent. Then there is $CREDITS. Think of that as the grease in the gears. You need it to level up your character and patch up your Mech so it doesn't fall apart in the middle of a duel. Since these are all on the blockchain, they belong to you and nobody else. If you spend months leveling up your machine and decide to sell it on OpenSea for a massive profit, that is your right. No corporate overlord is going to stop you.</p>

          <h3>THE MISSION AND THE ROADMAP</h3>
          <p>The plan is aggressive, and frankly, it’s terrifying. We started with Mech Fights, which is just pure adrenaline in arena combat where you prove your machine isn't a shiny paperweight. Then we move to Tower Defense. That requires a Mech, a Commander, and a Stronghold. If you can’t defend your own base, you don’t deserve the rewards. Finally, there is the MMO RTS. That is the endgame. We are talking faction wars, land ownership, and a universe that never sleeps. It is beautiful, but it will break you if you aren't ready.</p>

          <h3>THE BITTER TRUTH ABOUT MECH</h3>
          <p>The mech are brilliant, desperate people who built these machines to protect us from the hell coming from deep space. Now, the torch has passed to us. We call ourselves Mechies. We pilot, we protect, and yeah, we get angry and frustrated when the tech glitches out, but we never back down. Welcome to the Mechaverse. Do your job, stay sharp, and for the love of everything, don't get scrapped."</p>
        </div>
      </div>
    </div>
    <div class="faq-trigger-wrap">
      <span class="faq-link" onclick="openFAQ()">Frequently Asked Questions</span>
    </div>
  `;
}

window.openFAQ = () => { document.getElementById('faq-overlay').style.display = 'flex'; };
window.closeFAQ = () => { document.getElementById('faq-overlay').style.display = 'none'; };
