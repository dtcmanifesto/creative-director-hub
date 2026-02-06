#!/bin/bash

# Import creatives to Firestore via REST API
PROJECT_ID="trevor-dashboard"
API_KEY="AIzaSyC-DAnuZ0G3OeRvlzXER17h8I0SXHvASYQ"
COLLECTION="creatives"

# Function to add a document
add_doc() {
    local name="$1"
    local spend="$2"
    local roas="$3"
    local cpa="$4"
    local ctr="$5"
    local impressions="$6"
    local purchases="$7"
    local meta_ad_id="$8"
    local hook_type="$9"
    local creator="${10}"
    
    curl -s -X POST \
        "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?key=${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"fields\": {
                \"brand_id\": {\"stringValue\": \"freak-athlete\"},
                \"name\": {\"stringValue\": \"${name}\"},
                \"platform\": {\"stringValue\": \"meta\"},
                \"ad_type\": {\"stringValue\": \"video\"},
                \"hook_type\": {\"stringValue\": \"${hook_type}\"},
                \"creator_name\": {\"stringValue\": \"${creator}\"},
                \"status\": {\"stringValue\": \"active\"},
                \"spend\": {\"doubleValue\": ${spend}},
                \"roas\": {\"doubleValue\": ${roas}},
                \"cpa\": {\"doubleValue\": ${cpa}},
                \"ctr\": {\"doubleValue\": ${ctr}},
                \"impressions\": {\"integerValue\": \"${impressions}\"},
                \"conversions\": {\"integerValue\": \"${purchases}\"},
                \"meta_ad_id\": {\"stringValue\": \"${meta_ad_id}\"},
                \"notes\": {\"stringValue\": \"Imported from Meta Ads API\"}
            }
        }" > /dev/null
    
    echo "Added: ${name:0:60}... (ROAS: ${roas}x)"
}

echo "Importing creatives to Firestore..."

# Top performers from Freak Athlete Meta account
add_doc "09/09- HP- AP - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad - V3" 12106.6 3.66 208.73 0.0163 637290 58 "120235414174630130" "Ability" ""
add_doc "9/18 - HP - OG - VID - Versatility - Indoor Workouts - Quick Transitions - White background - V1" 4684.04 4.56 187.36 0.0145 218043 25 "120235825375620130" "Versatility" ""
add_doc "09/09- HP-AT - VID - Versatility - Indoor Workout - Quick Transitions - Is the Hyper Sturdy - V2" 3820.56 3.55 201.08 0.0096 220091 19 "120235362604350130" "Versatility" ""
add_doc "08/09 - HP- JG - VID - Versatility - Indoor Workout - Quick Transitions - Bill Mays Ad NO Music - V2" 2085.87 3.10 160.45 0.0098 129908 13 "120233643038440130" "Versatility" "Bill Mays"
add_doc "09/20- HP - Brent Hill - VID - Ability - Indoor Workouts - Quick Transitions - Todays Workout - V3" 1840.1 2.28 184.01 0.0114 93424 10 "120235921327530130" "Ability" "Brent Hill"
add_doc "09/09- HP- AP - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad - V2" 1827.4 4.33 261.06 0.0106 118579 7 "120235414144530130" "Ability" ""
add_doc "08/09 - HP- HG - VID - Ability - Indoor Workout - Quick Transitions - Tennis - Gids" 936.78 3.23 156.13 0.0111 80287 6 "120233827783490130" "Ability" ""
add_doc "09/20- HP - Brent Hill - VID - Ability - Indoor Workouts - Quick Transitions - Todays Workout - V2" 684.66 4.19 114.11 0.0209 45588 6 "120235921297310130" "Ability" "Brent Hill"
add_doc "09/20- HP - Brent Hill - VID - Ability - Indoor Workouts - Quick Transitions - Todays Workout - V1" 631.08 10.34 90.15 0.0089 39996 7 "120235921002560130" "Ability" "Brent Hill"
add_doc "08/29 - HP- AB - VID - Versatility - Indoor Workout - Quick Transitions - Whitelist Ad - V1" 595.25 3.54 198.42 0.0046 29144 3 "120234803932290130" "Versatility" "Alec Briggs"
add_doc "09/22 - HP- BM - VID - Versatility - Indoor Workout - Quick Transitions - August 1 Ads - V1" 384.38 2.53 192.19 0.0276 16662 2 "120236087915130130" "Versatility" "Bill Mays"
add_doc "09/19- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - August Ad - V1" 301.32 4.30 150.66 0.0230 13168 2 "120235880649520130" "Ability" ""
add_doc "09/09- HP-AT - VID - Versatility - Indoor Workout - Quick Transitions - Is the Hyper Sturdy - V1" 242.15 7.89 121.08 0.0075 17370 2 "120235362159480130" "Versatility" ""
add_doc "09/10- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad - V1" 91.99 2.83 91.99 0.0060 8111 1 "120235436711770130" "Ability" ""
add_doc "09/19- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - August Ad - V3" 55.79 6.76 27.90 0.0041 5647 2 "120235882263240130" "Ability" ""
add_doc "9/17 - HP - VD - VID - Ability - Quick Transitions - Indoor Workouts - Victoria August Ads 1 - V2" 16.86 51.19 16.86 0.0096 1972 1 "120235820617910130" "Ability" "Victoria"
add_doc "Static Ad 1" 4991.29 1.72 155.98 0.0055 276740 32 "120235043104550130" "" ""
add_doc "09/03- HP- SA - VID - Ability - Indoor Workout - Quick Transitions - Whitelist Ad - V1" 2100.71 1.80 525.18 0.0087 118057 4 "120235070067290130" "Ability" ""
add_doc "9/17 - HP - VD - VID - Ability - Quick Transitions - Indoor Workouts - Victoria August Ads 1 - V3" 685.45 1.82 342.73 0.0534 39329 2 "120235820649430130" "Ability" "Victoria"
add_doc "09/19- HP- NB - VID - Ability - Indoor Workout - Quick Transitions - August Ad - V4" 893.02 0.34 446.51 0.0221 42524 2 "120235882311130130" "Ability" ""

echo ""
echo "Done! Imported 20 creatives to Firestore."
