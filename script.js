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
// --- 3. UI RENDERING AND LOGIC ---

// Calculates the total score and updates the UI
function updateScore() {
    if (!currentContestantId) return;

    let total = 0;
    const currentScores = allScores[currentContestantId];
    
    // Loop through all input fields to get current values
    CRITERIA.forEach(crit => {
        const inputElement = document.getElementById(`score-${crit.name.replace(/\s/g, '-')}`);
        let score = parseInt(inputElement.value) || 0;

        // Simple Validation: Ensure score is not above max
        if (score > crit.max) {
            score = crit.max;
            inputElement.value = crit.max;
        }

        // Update the central data structure
        currentScores[crit.name] = score;
        total += score;
    });

    // Display the total score
    document.getElementById('final-total').textContent = total;
    
    // Save the changes to localStorage immediately
    saveScores();
}

// Generates the criteria input fields for the selected contestant
function renderScoringSheet(contestantId) {
    currentContestantId = contestantId;
    const contestant = CONTESTANTS.find(c => c.id === contestantId);
    
    document.getElementById('contestant-name').textContent = `${contestant.name} (${contestant.id})`;
    document.getElementById('scoring-sheet').classList.remove('hidden');

    const criteriaContainer = document.getElementById('criteria-scores');
    criteriaContainer.innerHTML = ''; // Clear previous criteria

    const currentScores = allScores[contestantId];

    CRITERIA.forEach(crit => {
        const idName = crit.name.replace(/\s/g, '-');
        
        // Create the HTML structure for one criterion
        const div = document.createElement('div');
        div.className = 'criterion';
        div.innerHTML = `
            <label for="score-${idName}">
                ${crit.name} (Max: ${crit.max} pts)
            </label>
            <input 
                type="number" 
                id="score-${idName}" 
                min="0" 
                max="${crit.max}" 
                value="${currentScores[crit.name] || 0}"
                oninput="updateScore()"
            >
        `;
        criteriaContainer.appendChild(div);
    });
    
    // Recalculate total score based on loaded values
    updateScore(); 
}


// Generates the list of contestant buttons
function renderContestantList() {
    const listContainer = document.getElementById('contestant-list');

    CONTESTANTS.forEach(c => {
        const button = document.createElement('button');
        button.textContent = `${c.id} - ${c.name}`;
        button.onclick = () => {
            // Highlight the active button (you'd style this with CSS)
            document.querySelectorAll('#contestant-list button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderScoringSheet(c.id);
        };
        listContainer.appendChild(button);
    });
}


// --- 4. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    loadScores(); // Load scores from localStorage first
    renderContestantList(); // Display contestant buttons
});
