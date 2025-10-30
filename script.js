// --- Game Variables ---
let currentProblem = {};
let score = 0;
let problemCount = 0;
const MAX_PROBLEMS = 20;
const POINTS_PER_QUESTION = 5;

// Strategies: 
// 1. Distributive Property (Breaking up a number: e.g., 8 x 15 = 8 x (10 + 5))
// 2. Compensation (Rounding and Adjusting: e.g., 9 x 49 = 9 x (50 - 1))
// 3. Finding compatible numbers (e.g., 4 x 7 x 25 = 4 x 25 x 7)
const STRATEGIES = [
    'Distributive Property',
    'Compensation',
    'Compatible Numbers'
];

// --- DOM Elements (Must be defined first) ---
const gameContainer = document.querySelector('.game-container');
const problemText = document.getElementById('problem-text');
const answerInput = document.getElementById('answer-input');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');
const feedback = document.getElementById('feedback');

// SCORE, COUNTER, HINT ELEMENTS (re-initialize based on previous structure)
const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score-display';
gameContainer.insertBefore(scoreDisplay, problemText.parentElement);

const questionCounter = document.createElement('p');
questionCounter.id = 'question-counter';
gameContainer.insertBefore(questionCounter, scoreDisplay.nextSibling);

const hintButton = document.createElement('button');
hintButton.id = 'hint-button';
hintButton.textContent = 'Strategy Hint';
gameContainer.insertBefore(hintButton, feedback);

const hintDisplay = document.createElement('div');
hintDisplay.id = 'hint-display';
hintDisplay.classList.add('feedback-message', 'hidden');
gameContainer.insertBefore(hintDisplay, feedback);

// --- Problem Generation Functions ---

/**
 * Generates a problem optimized for a specific mental math strategy.
 */
function generateStrategyProblem() {
    const strategyIndex = Math.floor(Math.random() * STRATEGIES.length);
    const strategy = STRATEGIES[strategyIndex];
    let problemString = '';
    let answer = 0;
    let hintText = '';

    if (strategy === 'Distributive Property') {
        const factor1 = Math.floor(Math.random() * 8) + 3; // 3 to 10
        const factor2 = Math.floor(Math.random() * 5) * 5 + 11; // e.g., 15, 20, 25, 30...
        
        problemString = `${factor1} \u00D7 ${factor2}`; // Use × symbol
        answer = factor1 * factor2;
        hintText = `Break the number ${factor2} into **tens and ones** (e.g., $${factor2} = 10 + ${factor2 - 10}$) and multiply both parts by ${factor1}$.`;
    
    } else if (strategy === 'Compensation') {
        const factor = Math.floor(Math.random() * 8) + 2; // 2 to 9
        const near100 = (Math.random() < 0.5) ? 99 : 49;
        
        problemString = `${factor} \u00D7 ${near100}`;
        answer = factor * near100;
        hintText = `Round ${near100} to the nearest ${near100 > 50 ? 'hundred' : 'fifty'} (e.g., $${near100 + 1}$) and then subtract the extra amount you added.`;

    } else if (strategy === 'Compatible Numbers') {
        const compPair = Math.random() < 0.5 ? [4, 25] : [2, 50];
        const factor = Math.floor(Math.random() * 15) + 5;
        
        problemString = `${compPair[0]} \u00D7 ${factor} \u00D7 ${compPair[1]}`;
        answer = compPair[0] * factor * compPair[1];
        hintText = `Use the **Commutative Property** to reorder the factors. Multiply the compatible pair ($${compPair[0]} \u00D7 ${compPair[1]} = ${compPair[0] * compPair[1]}$) first!`;
    }

    currentProblem = {
        question: problemString,
        answer: answer,
        strategy: strategy,
        hint: hintText
    };
}


// --- Game Flow Functions (Modified from previous version) ---

/**
 * Generates and displays a new problem, or ends the game.
 */
function generateProblem() {
    if (problemCount >= MAX_PROBLEMS) {
        endGame();
        return;
    }
    
    // Generate the strategy-based problem
    generateStrategyProblem();
    
    problemCount++;

    // Update the display
    problemText.textContent = currentProblem.question;

    // Reset UI for new problem
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback-message';
    checkButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    hintButton.classList.remove('hidden'); 
    hintDisplay.classList.add('hidden'); 
    answerInput.disabled = false;
    answerInput.focus();
    
    updateScoreDisplay();
}

/**
 * Displays the strategy hint for the current problem.
 */
function giveHint() {
    hintDisplay.innerHTML = `**Strategy: ${currentProblem.strategy}**<br>${currentProblem.hint}`;
    hintDisplay.classList.remove('hidden');
    hintButton.classList.add('hidden');
    hintDisplay.classList.add('incorrect'); 

    answerInput.focus();
}

/**
 * Checks the user's input against the correct answer and updates the score.
 */
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value.trim());

    if (isNaN(userAnswer)) {
        feedback.textContent = 'Please enter a valid number!';
        feedback.className = 'feedback-message incorrect';
        return;
    }

    const isCorrect = userAnswer === currentProblem.answer;

    if (isCorrect) {
        feedback.textContent = `✅ Correct! You used a great strategy to get ${currentProblem.answer}! (+${POINTS_PER_QUESTION} points)`;
        feedback.className = 'feedback-message correct';
        score += POINTS_PER_QUESTION; 
    } else {
        feedback.textContent = `❌ Incorrect. The correct answer is ${currentProblem.answer}. Try using the **${currentProblem.strategy}** strategy next time.`;
        feedback.className = 'feedback-message incorrect';
    }
    
    updateScoreDisplay();

    // Update UI
    checkButton.classList.add('hidden');
    hintButton.classList.add('hidden');
    nextButton.classList.remove('hidden');
    answerInput.disabled = true;
}


/**
 * Updates the score and question counter display.
 */
function updateScoreDisplay() {
    scoreDisplay.textContent = `Total Score: ${score} / ${MAX_PROBLEMS * POINTS_PER_QUESTION}`;
    questionCounter.textContent = `Question ${problemCount} of ${MAX_PROBLEMS}`;
}

/**
 * Ends the game, shows final score, and offers to restart.
 */
function endGame() {
    // Hide game elements
    problemText.textContent = '';
    answerInput.classList.add('hidden');
    checkButton.classList.add('hidden');
    nextButton.classList.add('hidden');
    hintButton.classList.add('hidden');
    hintDisplay.classList.add('hidden');
    questionCounter.classList.add('hidden');
    
    // Remove old play again button if present
    const oldPlayAgainButton = document.getElementById('play-again-button');
    if (oldPlayAgainButton) oldPlayAgainButton.remove();

    // Calculate and display final message
    const finalScore = score;
    const maxScore = MAX_PROBLEMS * POINTS_PER_QUESTION;
    const percentage = (finalScore / maxScore) * 100;

    let celebrationMessage = '';
    if (percentage === 100) {
        celebrationMessage = "🎉 PERFECT SCORE! You are a Mental Math Master! 🎉";
    } else if (percentage >= 80) {
        celebrationMessage = "🌟 Fantastic effort! Great work applying those strategies! 🌟";
    } else if (percentage >= 50) {
        celebrationMessage = "👍 Keep practicing! You've successfully used the properties! 👍";
    } else {
        celebrationMessage = "🧠 Good start! Review how to break numbers apart to make multiplication easier. 🧠";
    }

    feedback.innerHTML = `<h2>Game Over!</h2>
                          <p>${celebrationMessage}</p>
                          <p>Your Final Score: **${finalScore} out of ${maxScore}**</p>
                          <p>Percentage: **${percentage.toFixed(0)}%**</p>`;
    feedback.className = 'feedback-message correct'; 
    
    // Add Play Again Button
    const playAgainButton = document.createElement('button');
    playAgainButton.id = 'play-again-button';
    playAgainButton.textContent = 'Play Again!';
    playAgainButton.style.marginTop = '20px';
    gameContainer.appendChild(playAgainButton);
    
    playAgainButton.addEventListener('click', restartGame);
}

/**
 * Resets variables and starts the game over.
 */
function restartGame() {
    score = 0;
    problemCount = 0;
    
    // Remove the Play Again Button
    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
        playAgainButton.remove();
    }
    
    // Show hidden elements
    answerInput.classList.remove('hidden');
    questionCounter.classList.remove('hidden');
    
    // Reset UI and start the first problem
    feedback.className = 'feedback-message';
    answerInput.disabled = false;
    generateProblem();
}


// --- Event Listeners ---
checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', generateProblem);
hintButton.addEventListener('click', giveHint);

// Allow pressing Enter key to check answer
answerInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        if (!checkButton.classList.contains('hidden')) {
            checkAnswer();
        } else if (!nextButton.classList.contains('hidden')) {
            generateProblem();
        }
    }
});

// --- Start the Game ---
generateProblem();