/* ═══════════════════════════════════════════════════════
   roast.js — The Global Recruitment AI of Mech Rangers
   NETWORK ANALYTICS EDITION - Referral-Based Only
   ═══════════════════════════════════════════════════════ */

const ROASTS = {
    fragments: {
        hooks: [
            "Operative `$user`,", "Signal analysis:", "Recruitment telemetry:", "Dossier update:", "Network ping:", "Priority alert:", 
            "Field transmission:", "Scanning the link logs...", "According to the ledger,", "System invite log:", 
            "Network report:", "Attention `$user`:", "Checking referral integrity...", "Evaluation complete:", 
            "For the record,", "Status check,", "Calculating recruitment odds...", "Observation:", "Status update:", "Command reminder:",
            "Network frequency:", "Analysis finalized:", "Broadcast from the hub:", "Regarding `{last_ref}`'s enlistment,",
            "The AI core notes:", "Your recruitment file is thin:", "Listen carefully,", "Protocol override:",
            "Strictly speaking,", "This update is data-driven:", "Is this your current invite capacity?", "Signal suggests",
            "Referral Frequency:", "Objective truth:", "Your statistics are suboptimal:", "Review this data:",
            "Scanning for leadership traits...", "Grid alert:", "Under further review,", "The tactical audit is in:"
        ],
        subjects: {
            parasite: [
                "your current enlistment rate", "your initial influence tier", "your empty squad roster", "your inactive link status", 
                "your isolated referral signal", "your recruitment workflow", "your 0 confirmed invites", "your attempt at influence",
                "your tactical network", "your broadcast attempts", "your transmission history", "your link's metadata", "your basic invite logic",
                "your low-impact potential", "your invitation strategy", "your digital footprint", "your entry-level energy",
                "your limited network", "your stagnant assets", "your invitation link", "your lack of presence",
                "your struggle for recruits", "your entry-level tactics", "your ghost-town sector",
                "your bottom-tier output", "your attempt at deployment"
            ],
            mid: [
                "your average invite strategy", "those {count} recruits", "your slow deployment", "your mid-tier clearance", 
                "your routine effort", "your current standing", "your growth curve", "your contribution", 
                "your shaky execution", "your roadmap to more invites", "your conversion tactics", "your entry data", 
                "your repetitive sharing", "your focus on `{last_ref}`", "your standard profile",
                "your average-at-best performance", "your temporary relevance", "your struggle for attention",
                "your plateauing stats", "your participation-tier energy", "your lack of momentum",
                "your lukewarm presence", "your placeholder energy"
            ],
            threat: [
                "your rapid invite growth", "your sector dominance", "your target profile", "your rising influence", "your climb", 
                "your potential", "your 5% referral bonus", "your upcoming rank", "your lucky streak", 
                "your threat level", "your inevitable challenge", "your high-tier success", "your suspicious stats",
                "your aggressive networking", "your unstable power",
                "your looming promotion", "your temporary seat at the table", "your rising infamy"
            ],
            mythic: [
                "your high-tier luck", "your reality-bending wallet", "your temporary immortality", 
                "your glitch-in-the-matrix stats", "your cosmic-level influence", "your absolute server dominance"
                 ],
            legendary: [
                "your recruitment empire", "your throne", "your highness", "your superiority", "your luck multiplier", 
                "your 1% status", "your command presence", "your whale status", "your top-tier data", "your crown",
                "your immunity to reality", "your high-tier metrics", "your excessive dominance",
                "your hoarding of the floor price", "your absolute lack of humility", "your toxic throne",
                "your unbearable presence at the top", "your ego's gravity well"
            ]
        },
        verbs: [
            "is lagging behind the mission.", "is less effective than a ghost signal.", "is a cry for reinforcements.", 
            "makes my processors stall.", "is giving 'unqualified' energy.", "is strictly mediocre.", 
            "is actually concerning.", "is standard NPC behavior.", "belongs in the archive bin.", 
            "is why the squad is struggling.", "is a 404 error in the strategy.", "is dryer than the wastes.", 
            "is the reason your luck is zero.", "is just... inefficient.", "is purely aesthetic and useless.",
            "is proof that influence can't be taught.", "is the digital equivalent of a white flag.",
            "is flatter than a crashed stablecoin.", "is more volatile than a shitcoin.", "is basically vaporware.",
            "is hurting the project's visibility.", "is nothing more than a glitch.", "is decaying in real-time.",
            "is slower than a blockchain with 1 Gwei gas.", "is statistically insignificant.", "is a total disaster.",
            "is currently underperforming my expectations by 200%.", "is a stain on the ledger."
        ],
        finishers: [
            "I've seen smarter decisions made by an offline terminal.",
            "The mission requires more than just your presence.",
            "You’re the digital equivalent of a 0% gas fee—non-existent.",
            "If 'stagnation' was an NFT, you'd be the Whale.",
            "Even a rugpull has more roadmap than your recruitment.",
            "I’d call you an elite recruiter, but elite recruiters actually get results.",
            "You’re currently assigned to clean the Mech exhaust pipes.",
            "You're the reason they put 'Invite Others' on the mission brief.",
            "Your strategic mind is like a software update—I keep clicking 'Skip'.",
            "You have the whole mission to be a hero; why not start today?",
            "You're as useful as a screen door on a submarine.",
            "I’d send you to the front lines, but I don't want to lose the sector.",
            "Your recruitment link has more commitment issues than a teenager.",
            "If 'doing the bare minimum' was a rank, it would be yours.",
            "You're not an 'Action Believer,' you're just a spectator.",
            "I've seen better recovery on a 404 page.",
            "You are moving with the speed of a dying battery.",
            "Your social signals are as decentralized as your wallet.",
            "I've met smarter inanimate objects.", "You're a technicality in the success of others.",
            "You're the 'Before' picture in a recruitment ad.",
            "Your presence is a burden on the server bandwidth.",
            "Even the commander would call you a 'happy accident' that went wrong.",
            "The bar was on the floor and you brought a shovel.",
            "You are the reason we have to have 'terms and conditions'.",
            "You're proof that practice doesn't always make perfect.",
            "I've seen better recovery from a liquidating whale than from your ego.",
            "Your potential is currently on airplane mode.",
            "You’re the type of person who buys the peak and sells the bottom of a heart monitor.",
            "I wouldn't trust you to guard a dead wallet.",
            "The system is literally laughing at you in binary."
        ]
    },

    welcome: [
        "Link generated. Now go and generate referrals before I change my mind.",
        "There's your link, `$user`. Try to find someone to click it.",
        "Your referral link is ready. Distribute this signal across the network.",
        "Link active. Let’s see if you can actually influence people or if you're just screaming into the void.",
        "Generated. Go tell your 'alpha group' to join. We need more active users anyway.",
        "A new recruiter in the making. Your link is ready, `$user`.",
        "Link created. Try to find people with actual conviction, not just bots.",
        "Your path to Legendary starts here. Or more likely, your path to a Common mint.",
        "The link is live. Start the hustle. My calculator has more ambition than you.",
        "Link live. Try not to spam it like a bot.",
        "Success. Now go generate referrals like your life depends on it.",
        "Created. Go find some recruits... I mean, referrals.",
        "Success. Now broadcast this like the mission depends on it.",
        "Your link is active. Please use it strategically."
    ],

    recheck: {
        parasite: [
            "Still at {count}? Your referral link is as lonely as your wallet.",
            "Oh look, `$user` invited their mom. Groundbreaking. Back to the Common tier.",
            "You're not a Ranger; you're a spectator. Stop wasting our bandwidth.",
            "Only {count} invites? I've seen rugpulls with more community support.",
            "You recruited `{last_ref}`? Even a broken bot could do better than that.",
            "Your invite count is lower than mission requirements. Fix it.",
            "At {count}, you are officially the 'background noise' of this community.",
            "Zero progress. Just like your impact on the sector."
        ],
        mid: [
            "You managed to recruit `{last_ref}`? Interesting. One more person who's going to out-rank you.",
            "You’re doing just enough to be forgotten. `$user` is the definition of 'Standard'.",
            "Congratulations, you’re the most efficient person in the low-clearance bracket.",
            "You have {count} recruits. In the real world, we call that 'negligible'.",
            "You're the type of person who buys the peak and holds to zero.",
            "Almost relevant. Keep recruiting people so they can get better Mechs than you.",
            "You're at {count}. You're the digital equivalent of lukewarm water."
        ],
        threat: [
            "You think you're safe? I’ve seen smarter sectors liquidated in seconds.",
            "Working hard so I can archive your data? Thanks for the service, `$user`.",
            "Almost Legendary. But 'almost' is just a fancy word for 'failure'.",
            "You're actually trying. That's noted. Don't let the others overtake you.",
            "Top 100 is calling, but you're still on hold. Step it up.",
            "You have {count} recruits. Don't let it go to your head, you're still a target."
        ],
        mythic: [
            "Mythic? Either you're a dev or you've never seen sunlight. Congrats, `$user`.",
            "At {count} recruits, you've transcended humanity. Too bad your social skills didn't.",
            "You're a Mythic Ranger now. Please don't forget the recruits you stepped on to get here."
            ],
        legendary: [
            "You’re at the top, which means everyone below you wants to outrank you.",
            "Finally, someone with a brain. Too bad your multiplier can't fix your attitude.",
            "Top of the food chain. For now. Don't get comfortable, `$user`.",
            "You have {count} recruits. You're either a genius or you're highly influential.",
            "Legendary status? Great. Now everyone is tracking your progress."
        ]
    }
};

const STINGERS = [
    " Stay alert.", " Improve your tactics.", " Insufficient.", " Tracking.", " Skill gap.",
    " We see you.", " Tactical error.", " Get better allies.", " Tick tock.", " Signal lost.",
    " Low impact.", " Mission failure.", " Error 404.", " Imagine.", " Sector compromised.",
    " Honestly? Unimpressive.", " Do better.", " NPC detected.", " NGMI.", " Low Clearance.", 
    " Weak energy.", " Solid hands, shaky mind.", " Data purged.",
    " Caution.", " System warning.", " Suboptimal.", " Keep dreaming.", " Mission over.", " Goodbye.",
    " Stop transmitting.", " Breach detected.", " Seek help.", " Take the loss.", " Mid-tier.",
    " Not looking good.", " Erratic behavior.", " Logic not found.", " Tactical retreat.",
    " Embarrassing for the squad.", " Absolute zero.", " Bottom of the roster.", " Get audited.",
    " Logged and evaluated."
];

// Exported for use in recruitment and bridge modules
export function getRoast(type, tier, data) {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    if (Math.random() > 0.25) {
        const h = pick(ROASTS.fragments.hooks);
        const sPool = ROASTS.fragments.subjects[tier] || ROASTS.fragments.subjects.parasite;
        const s = pick(sPool);
        const v = pick(ROASTS.fragments.verbs);
        const f = pick(ROASTS.fragments.finishers);
        const st = pick(STINGERS);
        
        const doubleBurn = (Math.random() > 0.9) ? ` ${pick(ROASTS.fragments.finishers)}` : "";
        
        return `${h} ${s} ${v} ${f}${doubleBurn} ${st}`.replace(/`\$user`/g, data.user)
                                          .replace(/{count}/g, data.count)
                                          .replace(/{last_ref}/g, data.lastRef || "some random");
    }

    let pool = type === 'welcome' ? ROASTS.welcome : (ROASTS.recheck[tier] || ROASTS.recheck.parasite);
    let base = pick(pool);
    let stinger = pick(STINGERS);
    
    return (base + stinger).replace(/`\$user`/g, data.user)
                           .replace(/{count}/g, data.count)
                           .replace(/{last_ref}/g, data.lastRef || "some random");
}
window.getRoast = getRoast;