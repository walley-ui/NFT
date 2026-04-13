/* ═══════════════════════════════════════════════════════
   roast.js — The Global Toxic Brain of Mech Rangers
   BRUTAL INFINITE EDITION -Savage Combinations
   ═══════════════════════════════════════════════════════ */

const ROASTS = {
    fragments: {
        hooks: [
            "Listen `$user`,", "Fact check:", "Warning:", "System analysis:", "Imagine this:", "Quick reality check:", 
            "Breaking your delusions:", "I checked the logs and", "According to the blockchain,", "Note to self:", 
            "Look here, digital peasant:", "Attention `$user`:", "Checking the metadata...", "I've seen enough:", 
            "Just so we are clear,", "Hold on,", "Wait for it...", "Actually,", "No offense but", "Daily reminder:",
            "Internal Error:", "Analysis complete:", "Breaking news from the void:", "Hey `{last_ref}`'s liability,",
            "I'm not a bot, but even I can see", "Your file is a mess:", "Listen carefully,", "Stop everything:",
            "To be perfectly honest,", "I’d call this a tragedy, but", "Is this a joke?", "Metadata suggests",
            "Emergency Broadcast:", "Uncomfortable truth:", "Your statistics just sighed:", "Look at this mess:"
        ],
        subjects: {
            parasite: [
                "your pathetic grind", "your non-existent influence", "your social circle", "your empty wallet", 
                "your lonely referral link", "your desperate hustle", "your 0 invites", "your attempt at being relevant",
                "your portfolio", "your 'alpha' calls", "your gas fee history", "your paper hands", "your smooth brain",
                "your exit liquidity potential", "your invitation strategy", "your digital footprint", "your zero-tier energy",
                "your tragic network", "your dusty assets", "your invitation link", "your lack of impact",
                "your struggle for relevance", "your bottom-feeding tactics", "your ghost-town wallet"
            ],
            mid: [
                "your mediocre strategy", "those {count} invites", "your slow progress", "your mid-tier rank", 
                "your lazy effort", "your current status", "your trajectory", "your contribution", 
                "your glass hands", "your roadmap to nowhere", "your FOMO habits", "your entry price", 
                "your desperate shilling", "your obsession with `{last_ref}`", "your boring profile",
                "your average-at-best performance", "your temporary relevance", "your struggle for attention",
                "your plateauing stats", "your participation trophy energy", "your lack of momentum"
            ],
            threat: [
                "your temporary growth", "your dominance", "your target on your back", "your massive ego", "your climb", 
                "your potential", "your 5% royalty tax", "your upcoming liquidation", "your lucky streak", 
                "your threat level", "your inevitable fall", "your fragile success", "your suspicious stats",
                "your over-inflated reputation", "your aggressive networking", "your unstable power",
                "your looming disaster", "your temporary seat at the table"
            ],
            legendary: [
                "your empire", "your throne", "your highness", "your superiority complex", "your luck multiplier", 
                "your 1% status", "your legendary stench", "your whale status", "your god-complex", "your crown",
                "your immunity to reality", "your inflated ego", "your top-tier arrogance", "your excessive dominance",
                "your hoarding of the floor price", "your absolute lack of humility", "your toxic throne"
            ]
        },
        verbs: [
            "is lagging harder than dial-up internet.", "is more disappointing than a rugpull.", "is a cry for help.", 
            "makes my circuits hurt.", "is giving 'failed influencer' energy.", "is strictly mediocre.", 
            "is actually embarrassing.", "is peak NPC behavior.", "belongs in the digital trash.", 
            "is why we can't have nice things.", "is a 404 error in human form.", "is dryer than the Sahara.", 
            "is the reason your luck is zero.", "is just... pathetic.", "is purely aesthetic and useless.",
            "is proof that evolution can go in reverse.", "is the human equivalent of a participation award.",
            "is flatter than a crashed stablecoin.", "is more volatile than a shitcoin.", "is basically vaporware.",
            "is hurting the community's eyes.", "is nothing more than a glitch.", "is decaying in real-time.",
            "is slower than a blockchain with 1 Gwei gas.", "is statistically insignificant.", "is a total disaster.",
            "is offensive to the concept of intelligence.", "is the visual equivalent of a headache."
        ],
        finishers: [
            "I've seen smarter decisions made by a Magic 8-Ball.",
            "Your ancestors are watching, and they're disappointed.",
            "You’re the human equivalent of a 0% gas fee—non-existent.",
            "If failure was an NFT, you'd be a Whale.",
            "Even a rugpull has more roadmap than you do.",
            "I’d call you a 'clown', but clowns actually get paid.",
            "You’re the guy who cleans the Mech's exhaust pipe.",
            "You're the reason they put instructions on shampoo bottles.",
            "Your brain is like a software update—I keep clicking 'Not now'.",
            "You have your entire life to be an idiot; why not take today off?",
            "You're as useful as a screen door on a submarine.",
            "I’d tell you to go to hell, but I don’t want to see you twice.",
            "Your wallet has more commitment issues than a teenager.",
            "If 'doing the bare minimum' was a person, it would be you.",
            "You're not an 'Action Believer,' you're just a spectator.",
            "I've seen better art on a 404 page.",
            "You are moving with the speed of a dying battery.",
            "Your social skills are as decentralized as your wallet.",
            "I've met smarter inanimate objects.", "You're a technicality in the success of others.",
            "You're the 'Before' picture in a 'Before and After' ad.",
            "Your presence is a burden on the server bandwidth.",
            "Even Bob Ross would call you a 'happy accident' that went wrong.",
            "The bar was on the floor and you brought a shovel.",
            "You are the reason we have to have 'terms and conditions'.",
            "You're proof that practice doesn't always make perfect.",
            "I've seen better recovery from a liquidating whale than from your ego.",
            "Your potential is currently on airplane mode.",
            "You’re the type of person who buys the peak and sells the bottom of a heart monitor."
        ]
    },

    welcome: [
        "Link generated. Now go and invite your unsmart friends before I change my mind.",
        "There's your link, `$user`. Try not to fail as hard as you did on your last 'gem' call.",
        "Your referral link is ready. Go beg for clicks like the digital peasant you are.",
        "Link active. Let’s see if you can actually influence people or if you're just screaming into the void.",
        "Generated. Go tell your 'alpha group' to join. We need more exit liquidity anyway.",
        "Oh look, another 'influencer' in the making. Your link is ready, `$user`.",
        "Link created. Try to find people with actual money, not just your bot friends.",
        "Your path to Legendary starts here. Or more likely, your path to a Common mint.",
        "The link is live. Go hustle. My calculator has more ambition than you.",
        "Link live. Try not to spam it like a bot, even though you act like one.",
        "Here is the link. Try to find someone who actually likes you to click it.",
        "Created. Go find some victims... I mean, referrals.",
        "Success. Now go shill this like your life depends on it.",
        "Your link is active. Please use it responsibly—meaning, don't be a weirdo."
    ],

    recheck: {
        parasite: [
            "Still at {count}? Your referral link is as lonely as your wallet.",
            "Oh look, `$user` invited their mom. Groundbreaking. Back to the Common tier.",
            "You're not a Ranger; you're a spectator. Stop wasting our bandwidth.",
            "Only {count} invites? I've seen rugpulls with more community support.",
            "You invited `$last_ref`? Even a broken bot could do better than that.",
            "Your invite count is lower than your credit score. Fix it.",
            "At {count}, you are officially the 'background noise' of this community.",
            "Zero progress. Just like your bank account after that last 'safe' moonshot."
        ],
        mid: [
            "You managed to invite {last_ref}? Wow. One more person who's going to out-mint you.",
            "You’re doing just enough to be forgotten. `$user` is the definition of 'Mid'.",
            "Congratulations, you’re the smartest person in the loser bracket.",
            "You have {count} invites. In the real world, we call that 'negligible'.",
            "You're the type of person who buys the peak and holds to zero.",
            "Almost relevant. Keep inviting people so they can get better Mechs than you.",
            "You're at {count}. You're the human equivalent of lukewarm water."
        ],
        threat: [
            "You think you're safe? I’ve seen smarter people liquidated in seconds.",
            "Working hard so I can take 5% of your royalties? Thanks for the service, `$user`.",
            "Almost Legendary. But 'almost' is just a fancy word for 'failure'.",
            "You're actually trying. That's adorable. Don't let the others overtake you.",
            "Top 100 is calling, but you're still on hold. Step it up.",
            "You have {count} invites. Don't let it go to your head, you're still a target."
        ],
        legendary: [
            "You’re at the top, which means everyone below you wants to step on your neck.",
            "Finally, someone with a brain. Too bad your multiplier can't fix your personality.",
            "Top of the food chain. For now. Don't get comfortable, `$user`.",
            "You have {count} invites. You're either a genius or you're paying people.",
            "Legendary status? Great. Now everyone hates you twice as much."
        ]
    }
};

const STINGERS = [
    " Stay mad.", " Fix your life.", " Pathetic.", " LMAO.", " Skill issue.",
    " We see you.", " Cope harder.", " Get better friends.", " Tick tock.", " Log off.",
    " Ratioed.", " Go touch grass.", " Error 404: Skill not found.", " Imagine.", " Get rekt.",
    " Honestly? Sad.", " Do better.", " NPC detected.", " NGMI.", " HFSP.", 
    " Jeet energy.", " Diamond hands, paper brain.", " Delete your account.",
    " Yikes.", " Big yikes.", " Cringe.", " Keep dreaming.", " You’re done.", " Goodbye.",
    " Stop typing.", " Go outside.", " Seek help.", " Take the L.", " Mid at best.",
    " Not looking good.", " Clown behavior.", " Empathy not found.", " Cry about it.",
    " Embarrassing for you.", " Absolute zero.", " Bottom of the barrel."
];

function getRoast(type, tier, data) {
    // 75% chance to build a brutal unique dynamic sentence
    if (Math.random() > 0.25) {
        const h = ROASTS.fragments.hooks[Math.floor(Math.random() * ROASTS.fragments.hooks.length)];
        const sPool = ROASTS.fragments.subjects[tier] || ROASTS.fragments.subjects.parasite;
        const s = sPool[Math.floor(Math.random() * sPool.length)];
        const v = ROASTS.fragments.verbs[Math.floor(Math.random() * ROASTS.fragments.verbs.length)];
        const f = ROASTS.fragments.finishers[Math.floor(Math.random() * ROASTS.fragments.finishers.length)];
        const st = STINGERS[Math.floor(Math.random() * STINGERS.length)];
        
        return `${h} ${s} ${v} ${f} ${st}`.replace('`$user`', data.user)
                                          .replace('{count}', data.count)
                                          .replace('{last_ref}', data.lastRef || "some random");
    }

    // Pick from the curated pool
    let pool = type === 'welcome' ? ROASTS.welcome : (ROASTS.recheck[tier] || ROASTS.recheck.parasite);
    let base = pool[Math.floor(Math.random() * pool.length)];
    let stinger = STINGERS[Math.floor(Math.random() * STINGERS.length)];
    
    return base.replace('`$user`', data.user)
               .replace('{count}', data.count)
               .replace('{last_ref}', data.lastRef || "some random") + stinger;
}
