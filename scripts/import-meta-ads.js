#!/usr/bin/env node

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp({
    projectId: 'trevor-dashboard'
});

const db = getFirestore();

// Meta Ads data (from API)
const adsData = [
    { id: "120235414174630130", name: "09/09- HP- AP - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad  - V3", spend: 12106.6, roas: 3.66, cpa: 208.73, ctr: 0.0163, impressions: 637290, purchases: 58 },
    { id: "120235043104550130", name: "Static Ad 1", spend: 4991.29, roas: 1.72, cpa: 155.98, ctr: 0.0055, impressions: 276740, purchases: 32 },
    { id: "120235825375620130", name: "9/18 - HP - OG - VID - Versatility - Indoor Workouts - Quick Transitions - White background - V1 - GIds", spend: 4684.04, roas: 4.56, cpa: 187.36, ctr: 0.0145, impressions: 218043, purchases: 25 },
    { id: "120235362604350130", name: "09/09- HP-AT - VID - Versatility - Indoor Workout - Quick Transitions - Is the Hyper Sturdy - V2", spend: 3820.56, roas: 3.55, cpa: 201.08, ctr: 0.0096, impressions: 220091, purchases: 19 },
    { id: "120235070067290130", name: "09/03- HP- SA - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad  - V1", spend: 2100.71, roas: 1.80, cpa: 525.18, ctr: 0.0087, impressions: 118057, purchases: 4 },
    { id: "120233643038440130", name: "08/09 - HP- JG - VID - Versatility - Indoor Workout - Quick Transitions - Bill Mays Ad NO Music - V2", spend: 2085.87, roas: 3.10, cpa: 160.45, ctr: 0.0098, impressions: 129908, purchases: 13 },
    { id: "120235921327530130", name: "09/20- HP - Brent Hill - VID - Ability - Indoor Workouts - Quick Transitions - Todays Workout - V3 - Aubrey", spend: 1840.1, roas: 2.28, cpa: 184.01, ctr: 0.0114, impressions: 93424, purchases: 10 },
    { id: "120235414144530130", name: "09/09- HP- AP - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad  - V2", spend: 1827.4, roas: 4.33, cpa: 261.06, ctr: 0.0106, impressions: 118579, purchases: 7 },
    { id: "120233827783490130", name: "08/09 - HP- HG - VID - Ability - Indoor Workout - Quick Transitions - Tennis - Gids", spend: 936.78, roas: 3.23, cpa: 156.13, ctr: 0.0111, impressions: 80287, purchases: 6 },
    { id: "120235882311130130", name: "09/19- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - August Ad - V4 - Aubrey", spend: 893.02, roas: 0.34, cpa: 446.51, ctr: 0.0221, impressions: 42524, purchases: 2 },
    { id: "120235820649430130", name: "9/17  - HP - VD - VID - Ability - Quick Transitions - Indoor Workouts - Victoria August Ads 1  - V3  - Gids", spend: 685.45, roas: 1.82, cpa: 342.73, ctr: 0.0534, impressions: 39329, purchases: 2 },
    { id: "120235921297310130", name: "09/20- HP - Brent Hill - VID - Ability - Indoor Workouts - Quick Transitions - Todays Workout - V2 - Aubrey", spend: 684.66, roas: 4.19, cpa: 114.11, ctr: 0.0209, impressions: 45588, purchases: 6 },
    { id: "120235921002560130", name: "09/20- HP - Brent Hill - VID - Ability - Indoor Workouts - Quick Transitions - Todays Workout - V1 - Aubrey", spend: 631.08, roas: 10.34, cpa: 90.15, ctr: 0.0089, impressions: 39996, purchases: 7 },
    { id: "120234803932290130", name: "08/29 - HP-  AB  - VID - Versatility - Indoor Workout - Quick Transitions - Whitelist Ad  - V1  - Genner", spend: 595.25, roas: 3.54, cpa: 198.42, ctr: 0.0046, impressions: 29144, purchases: 3 },
    { id: "120236087915130130", name: "09/22 - HP- BM - VID - Versatility -Indoor Workout - Quick Transitions - August 1 Ads - V1 - Genner", spend: 384.38, roas: 2.53, cpa: 192.19, ctr: 0.0276, impressions: 16662, purchases: 2 },
    { id: "120235880649520130", name: "09/19- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - August Ad - V1 - Aubrey", spend: 301.32, roas: 4.30, cpa: 150.66, ctr: 0.0230, impressions: 13168, purchases: 2 },
    { id: "120235362159480130", name: "09/09- HP-AT - VID - Versatility - Indoor Workout - Quick Transitions - Is the Hyper Sturdy - V1", spend: 242.15, roas: 7.89, cpa: 121.08, ctr: 0.0075, impressions: 17370, purchases: 2 },
    { id: "120235436711770130", name: "09/10- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad  - V1", spend: 91.99, roas: 2.83, cpa: 91.99, ctr: 0.0060, impressions: 8111, purchases: 1 },
    { id: "120235882263240130", name: "09/19- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - August Ad - V3 - Aubrey", spend: 55.79, roas: 6.76, cpa: 27.90, ctr: 0.0041, impressions: 5647, purchases: 2 },
    { id: "120235820617910130", name: "9/17  - HP - VD - VID - Ability - Quick Transitions - Indoor Workouts - Victoria August Ads 1  - V2  - Gids", spend: 16.86, roas: 51.19, cpa: 16.86, ctr: 0.0096, impressions: 1972, purchases: 1 },
];

// Parse ad name for tags
function parseAdName(name) {
    const tags = {
        platform: 'meta',
        ad_type: 'video',
        hook_type: null,
        environment: null
    };
    
    const nameLower = name.toLowerCase();
    
    // Detect hook type
    if (nameLower.includes('ability')) tags.hook_type = 'Ability';
    else if (nameLower.includes('versatility')) tags.hook_type = 'Versatility';
    else if (nameLower.includes('money')) tags.hook_type = 'Money';
    else if (nameLower.includes('social proof')) tags.hook_type = 'Social Proof';
    
    // Detect environment
    if (nameLower.includes('indoor')) tags.environment = 'indoor';
    else if (nameLower.includes('outdoor')) tags.environment = 'outdoor';
    else if (nameLower.includes('gym')) tags.environment = 'gym';
    else if (nameLower.includes('home')) tags.environment = 'home';
    
    // Detect if static
    if (nameLower.includes('static')) tags.ad_type = 'static';
    
    // Detect creator
    if (name.includes('VD') || name.includes('Victoria')) tags.creator = 'Victoria';
    else if (name.includes('AB') || name.includes('Alec')) tags.creator = 'Alec Briggs';
    else if (name.includes('BM') || name.includes('Bill')) tags.creator = 'Bill Mays';
    else if (name.includes('Brent Hill')) tags.creator = 'Brent Hill';
    else if (name.includes('NB')) tags.creator = 'NB';
    
    return tags;
}

async function importAds() {
    console.log('Starting import...');
    
    const batch = db.batch();
    
    for (const ad of adsData) {
        const tags = parseAdName(ad.name);
        
        const docRef = db.collection('creatives').doc();
        batch.set(docRef, {
            brand_id: 'freak-athlete',
            name: ad.name,
            platform: tags.platform,
            ad_type: tags.ad_type,
            hook_type: tags.hook_type,
            creator_name: tags.creator || null,
            status: 'active',
            spend: ad.spend,
            roas: ad.roas,
            cpa: ad.cpa,
            ctr: ad.ctr,
            impressions: ad.impressions,
            conversions: ad.purchases,
            meta_ad_id: ad.id,
            launch_date: null,
            notes: `Imported from Meta Ads API`,
            created_at: new Date(),
            updated_at: new Date()
        });
        
        console.log(`Added: ${ad.name.substring(0, 50)}... (ROAS: ${ad.roas}x)`);
    }
    
    await batch.commit();
    console.log(`\nImported ${adsData.length} creatives to Firestore!`);
}

importAds().catch(console.error);
