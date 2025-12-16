// --- CRITICAL DATA DEFINITIONS (Based on your Google Form) ---
const CRITERIA = [
    { name: 'Creativity & Originality', max: 25, options: [5, 10, 15, 20, 25] },
    { name: 'Relevance to the Theme', max: 20, options: [5, 10, 15, 20] },
    { name: 'Talent & Skill', max: 25, options: [5, 10, 15, 20, 25] },
    { name: 'Audience Impact', max: 15, options: [5, 10, 15] },
    { name: 'Production Value', max: 15, options: [5, 10, 15] }
];

// Contestant data (8 groups, based on your spreadsheet)
const CONTESTANTS = [
    { id: 'G01', name: 'TEAM BATANG TERRASOL_CTS' },
    { id: 'G02', name: 'TEAM SEC_SUNNIN_EM' },
    { id: 'G03', name: 'TEAM HMB_HMS R4S' },
    { id: 'G04', name: 'TEAM ITOS_ADMIN_SQPHHS' },
    { id: 'G05', name: 'TEAM LTD TECHNO MOVERS_VOL_LMR_TRS' },
    { id: 'G06', name: 'TEAM O-SIDE POMPSSS_BIG_OCS' },
    { id: 'G07', name: 'TEAM VEE_EFF-ES_BF3' },
    { id: 'G08', name: 'TEAM G-EO' } // Placeholder for the 8th group
];

// Local storage key
const STORAGE_KEY = 'talentShowSubmissions';

// --- LOCAL STORAGE FUNCTIONS ---

// Load all previous submissions (an array of score objects)
function loadSubmissions() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

// Save a new submission
function saveSubmission(submission) {
    const submissions = loadSubmissions();
    submissions.push(submission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

// --- SCORING SHEET LOGIC ---

function renderContestantDropdown() {
    const select = document.getElementById('contestant-select');
    // Clear previous options
    select.innerHTML = '<option value="" disabled selected>Select a Group</option>'; 
    
    CONTESTANTS.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

function renderCriteria() {
    const criteriaContainer = document.getElementById('criteria-container');
    criteriaContainer.innerHTML = ''; // Clear previous criteria

    CRITERIA.forEach(crit => {
        const idName = crit.name.replace(/\s/g, '-').toLowerCase();
        
        // Structure for the Google Forms look
        let html = `
            <div class="criteria-block">
                <label class="criteria-title">${crit.name} (Max: ${crit.max} pts) *</label>
                <div class="radio-options">
        `;
        
        // Radio Buttons
        crit.options.forEach(option => {
            html += `
                <input 
                    type="radio" 
                    id="${idName}-${option}" 
                    name="score-${idName}" 
                    value="${option}"
                    required
                >
                <label for="${idName}-${option}">${option}</label>
            `;
        });
        
        html += '</div></div>';
        criteriaContainer.innerHTML += html;
    });
}

function handleSubmit(event) {
    event.preventDefault(); // Stop default form submission

    const judgeName = document.getElementById('judge-name').value.trim();
    const contestantId = document.getElementById('contestant-select').value;
    
    if (!judgeName || !contestantId) {
        alert("Please enter your name and select a group before submitting.");
        return;
    }

    let totalScore = 0;
    const criteriaScores = {};
    let allScored = true;

    // Iterate through criteria to collect scores
    CRITERIA.forEach(crit => {
        const idName = crit.name.replace(/\s/g, '-').toLowerCase();
        // Get the selected radio button value for this criteria group
        const selectedRadio = document.querySelector(`input[name="score-${idName}"]:checked`);
        
        if (selectedRadio) {
            const score = parseInt(selectedRadio.value);
            criteriaScores[crit.name] = score;
            totalScore += score;
        } else {
            allScored = false;
        }
    });

    if (!allScored) {
        alert("Please score all criteria before submitting.");
        return;
    }

    // Create the submission object
    const submission = {
        submissionId: Date.now(), // Unique ID based on timestamp
        judgeName: judgeName,
        contestantId: contestantId,
        contestantName: CONTESTANTS.find(c => c.id === contestantId).name,
        timestamp: new Date().toISOString(),
        totalScore: totalScore,
        criteriaScores: criteriaScores
    };

    // Save the submission to localStorage (the "cache")
    saveSubmission(submission);
    
    // Success message and reset form
    alert(`Score saved for ${submission.contestantName} by Judge ${judgeName}! Total: ${totalScore}`);
    document.getElementById('scoring-form').reset();
    document.getElementById('judge-name').value = judgeName; // Keep judge name pre-filled
}


document.addEventListener('DOMContentLoaded', () => {
    renderContestantDropdown();
    renderCriteria();
    
    // Attach the submission handler
    document.getElementById('scoring-form').addEventListener('submit', handleSubmit);
});
// --- RESULTS LOGIC ---

function calculateAndDisplayResults() {
    const submissions = loadSubmissions();
    document.getElementById('submission-count').textContent = submissions.length;

    if (submissions.length === 0) {
        return;
    }

    // 1. Group submissions and calculate averages
    const aggregatedResults = CONTESTANTS.map(c => ({
        id: c.id,
        name: c.name,
        scores: [],
        talentScores: []
    }));

    submissions.forEach(sub => {
        const team = aggregatedResults.find(a => a.id === sub.contestantId);
        if (team) {
            team.scores.push(sub.totalScore);
            // Collect the score for the tie-breaker criterion: 'Talent & Skill'
            team.talentScores.push(sub.criteriaScores['Talent & Skill'] || 0);
        }
    });

    // 2. Finalize aggregation (Calculate Averages)
    const finalResults = aggregatedResults
        .filter(a => a.scores.length > 0) // Only show teams that have been scored
        .map(team => {
            const avgScore = team.scores.reduce((sum, score) => sum + score, 0) / team.scores.length;
            const avgTalentScore = team.talentScores.reduce((sum, score) => sum + score, 0) / team.talentScores.length;
            
            return {
                ...team,
                avgScore: parseFloat(avgScore.toFixed(2)),
                count: team.scores.length,
                avgTalentScore: parseFloat(avgTalentScore.toFixed(2))
            };
        });

    // 3. Sort and Rank (with Tie Breaker)
    finalResults.sort((a, b) => {
        // Primary Sort: Average Score (High to Low)
        if (b.avgScore !== a.avgScore) {
            return b.avgScore - a.avgScore;
        }
        
        // Tie Breaker: Average Talent & Skill Score (High to Low)
        return b.avgTalentScore - a.avgTalentScore;
    });

    // Assign rank (No ties in rank number, as the sorting is deterministic)
    finalResults.forEach((result, index) => {
        result.rank = index + 1;
    });

    // 4. Display Results in Table
    const tableBody = document.querySelector('#results-table tbody');
    tableBody.innerHTML = '';

    finalResults.forEach(result => {
        const row = tableBody.insertRow();
        
        if (result.rank === 1) row.classList.add('rank-1');
        if (result.rank === 2) row.classList.add('rank-2');
        if (result.rank === 3) row.classList.add('rank-3');
        
        row.insertCell().textContent = result.rank;
        row.insertCell().textContent = result.name;
        row.insertCell().textContent = result.avgScore;
        row.insertCell().textContent = result.count;
        row.insertCell().textContent = result.avgTalentScore;
    });
}

function clearAllScores() {
    if (confirm("WARNING: This will permanently delete ALL saved scores for ALL judges from this browser. Are you sure?")) {
        localStorage.removeItem(STORAGE_KEY);
        alert("All scores have been cleared.");
        calculateAndDisplayResults(); // Refresh the table
    }
}

document.addEventListener('DOMContentLoaded', calculateAndDisplayResults);

// Function to export all data currently saved by this judge
function exportMyScores() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data || data === '[]') {
        alert("No scores recorded yet to export.");
        return;
    }
    
    // Copy data to clipboard
    navigator.clipboard.writeText(data).then(() => {
        alert("Your scores have been copied to your clipboard. Please paste this into the Admin Results Page.");
    }).catch(err => {
        console.error('Could not copy text: ', err);
        alert("Could not automatically copy scores. Please check the console for the data.");
    });
}
// IMPORTANT: This function must be accessible globally, so we define it outside the DOMContentLoaded
