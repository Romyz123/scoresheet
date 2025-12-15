// --- 1. DATA DEFINITIONS ---

// Define the scoring criteria and the allowed point options for each
const CRITERIA = [
    { name: 'Creativity & Originality', max: 25, options: [5, 10, 15, 20, 25] },
    { name: 'Relevance to the Theme', max: 20, options: [5, 10, 15, 20] },
    { name: 'Talent & Skill', max: 25, options: [5, 10, 15, 20, 25] },
    { name: 'Audience Impact', max: 15, options: [5, 10, 15] },
    { name: 'Production Value', max: 15, options: [5, 10, 15] }
];

const MAX_TOTAL_SCORE = CRITERIA.reduce((sum, c) => sum + c.max, 0); // 100 points

// Updated list of contestants (using 8 groups from your screenshot)
const CONTESTANTS = [
    { id: 'G01', name: 'TEAM BATANG TERRASOL' },
    { id: 'G02', name: 'TEAM SEC_SUNNIN_EM' },
    { id: 'G03', name: 'TEAM HMB_HMS R4S' },
    { id: 'G04', name: 'TEAM ITOS_ADMIN_SQPHHS' },
    { id: 'G05', name: 'TEAM LTD TECHNO MOVERS' },
    { id: 'G06', name: 'TEAM O-SIDE POMPSSS_BIG_OCS' },
    { id: 'G07', name: 'TEAM VEE_EFF-ES_BF3' },
    { id: 'G08', name: 'TEAM G-EO' } // Assuming one more based on spreadsheet columns/data
];

let currentContestantId = null;
let allScores = {}; // This is where localStorage will save the data
// Generates the criteria radio buttons for the selected contestant
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
        div.className = 'criterion-block';
        
        // 1. Title/Max Points
        let html = `<label class="criterion-title">${crit.name} (Max: ${crit.max} pts)</label><div class="radio-options">`;
        
        // 2. Radio Buttons
        crit.options.forEach(option => {
            const isChecked = (currentScores[crit.name] === option);
            html += `
                <input 
                    type="radio" 
                    id="score-${idName}-${option}" 
                    name="score-${idName}" 
                    value="${option}"
                    ${isChecked ? 'checked' : ''}
                    onclick="updateScore()"
                >
                <label for="score-${idName}-${option}">${option}</label>
            `;
        });
        
        html += '</div>';
        div.innerHTML = html;
        criteriaContainer.appendChild(div);
    });
    
    // Recalculate total score based on loaded values
    updateScore(); 
}

// Calculates the total score and updates the UI (minor change to look at radio groups)
function updateScore() {
    if (!currentContestantId) return;

    let total = 0;
    const currentScores = allScores[currentContestantId];
    
    CRITERIA.forEach(crit => {
        const idName = crit.name.replace(/\s/g, '-');
        
        // Get the selected radio button value for this criteria group
        const selectedRadio = document.querySelector(`input[name="score-${idName}"]:checked`);
        
        let score = 0;
        if (selectedRadio) {
            score = parseInt(selectedRadio.value);
        }

        // Update the central data structure and total
        currentScores[crit.name] = score;
        total += score;
    });

    // Display the total score
    document.getElementById('final-total').textContent = total;
    
    // Save the changes to localStorage immediately
    saveScores();
}
