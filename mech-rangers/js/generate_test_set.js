import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

const envPath = path.resolve(process.cwd(), 'mech-rangers', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const TEST_LOG_PATH = path.join(process.cwd(), 'test_wallets.json');

const PERSONAS = [
    { label: "The Whale", referrals: 600 },
    { label: "The Influencer", referrals: 300 },
    { label: "The Recruiter", referrals: 150 },
    { label: "The Scout", referrals: 20 },
    { label: "The Grunt", referrals: 2 }
];

function generateWallet() {
    return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

async function buildTestSet() {
    console.log("🛠️ INJECTING MOCKED DATA...");
    const testData = [];

    for (const p of PERSONAS) {
        const wallet = generateWallet();
        
        // 1. Insert into 'recruits' (The main table)
        await supabase.from('recruits').upsert([{
            wallet_address: wallet,
            twitter_handle: `@Test_${p.label.replace(' ', '')}`,
            has_followed: true
        }]);

        // 2. Insert into 'referrals' (The points table used by points.js)
        await supabase.from('referrals').upsert([{
            referrer_wallet: wallet,
            count: p.referrals
        }]);

        testData.push({ role: p.label, wallet: wallet });
        console.log(`✅ ${p.label} added: ${wallet}`);
    }

    fs.writeFileSync(TEST_LOG_PATH, JSON.stringify(testData, null, 2));
    
    console.log("\n⏳ Waiting 3 seconds for Supabase consistency...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("\n🔄 TRIGGERING SNAPSHOT...");
    execSync('node mech-rangers/js/points.js', { stdio: 'inherit' });
    
    console.log("\n🏁 TEST SET READY. Now run the validator.");
}

buildTestSet();
