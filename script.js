// --- 1. DATA DEFINITIONS ---
const CRITERIA = [
    { name: 'Stage Presence', max: 30 },
    { name: 'Talent Execution', max: 50 },
    { name: 'Costume & Props', max: 20 }
];
const MAX_TOTAL_SCORE = CRITERIA.reduce((sum, c) => sum + c.max, 0); // Should be 100

// Initial list of contestants (you can expand this)
const CONTESTANTS = [
    { id: 'C001', name: 'Althea' },
    { id: 'C002', name: 'Brian' },
    { id: 'C003', name: 'Carlyn' }
];

let currentContestantId = null;

// The structure to hold all scores for all contestants.
// This will be saved to localStorage.
let allScores = {}; 

// --- 2. LOCAL STORAGE FUNCTIONS ---
// The term you asked for is Web Storage, specifically localStorage for persistent data.
// 

function loadScores() {
    const savedScores = localStorage.getItem('talentScoringSheet');
    if (savedScores) {
        // Parse the JSON string back into a JavaScript object
        allScores = JSON.parse(savedScores);
    } else {
        // Initialize scores structure if nothing is found
        CONTESTANTS.forEach(c => {
            allScores[c.id] = CRITERIA.reduce((obj, crit) => {
                obj[crit.name] = 0; // Initialize score to 0
                return obj;
            }, {});
        });
    }
}

function saveScores() {
    // Stringify the JavaScript object into a JSON string
    localStorage.setItem('talentScoringSheet', JSON.stringify(allScores));
    document.getElementById('save-status').textContent = 'Status: Scores Saved Locally!';
    // Hide the status message after a few seconds
    setTimeout(() => {
        document.getElementById('save-status').textContent = '';
    }, 3000);
}
