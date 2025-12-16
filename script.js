// Benchmark fractions as decimals
const benchmarkFractions = [
    { label: "½", value: 0.5 },
    { label: "¼", value: 0.25 },
    { label: "¾", value: 0.75 },
    { label: "⅓", value: 1/3 },
    { label: "⅔", value: 2/3 },
    { label: "⅕", value: 0.2 }
];

// Powers of 10 (including decimals)
const powers = [
    { display: "10", value: 10, operation: "×" },
    { display: "100", value: 100, operation: "×" },
    { display: "1,000", value: 1000, operation: "×" },
    { display: "0.1", value: 0.1, operation: "×" },
    { display: "0.01", value: 0.01, operation: "×" },
    { display: "10", value: 10, operation: "÷" },
    { display: "100", value: 100, operation: "÷" },
    { display: "1,000", value: 1000, operation: "÷" },
    { display: "0.1", value: 0.1, operation: "÷" },
    { display: "0.01", value: 0.01, operation: "÷" }
];

// Number sources: decimals, whole numbers, fractions
function getRandomNumber() {
    const choice = Math.random();
    if (choice < 0.4) {
        // Decimal
        return {
            display: (Math.random() * 200).toFixed(3),
            value: parseFloat((Math.random() * 200).toFixed(3))
        };
    } else if (choice < 0.8) {
        // Whole number
        return {
            display: String(Math.floor(Math.random() * 500) + 1),
            value: Math.floor(Math.random() * 500) + 1
        };
    } else {
        // Benchmark fraction
        const frac = benchmarkFractions[Math.floor(Math.random() * benchmarkFractions.length)];
        return {
            display: frac.label,
            value: frac.value
        };
    }
}

// Format number for display (avoid long repeating decimals)
function formatAnswer(num) {
    if (Math.abs(num) > 1e6 || (Math.abs(num) < 1e-4 && num !== 0)) {
        return num.toExponential(4);
    }
    // Round to max 6 decimal places, remove trailing zeros
    return parseFloat(num.toFixed(6)).toString();
}

// Generate 10 questions
const questions = [];
for (let i = 0; i < 10; i++) {
    const numberObj = getRandomNumber();
    const powerObj = powers[Math.floor(Math.random() * powers.length)];
    
    let correct;
    if (powerObj.operation === "×") {
        correct = numberObj.value * powerObj.value;
    } else {
        correct = numberObj.value / powerObj.value;
    }

    const correctFormatted = formatAnswer(correct);
    
    // Generate distractors: common errors (e.g., shift wrong direction)
    const distractors = new Set();
    const attempts = 0;
    while (distractors.size < 3 && attempts < 20) {
        // Common mistake: reverse operation
        let wrong;
        if (powerObj.operation === "×") {
            wrong = numberObj.value / powerObj.value; // did ÷ instead
        } else {
            wrong = numberObj.value * powerObj.value; // did × instead
        }
        distractors.add(formatAnswer(wrong));
        
        // Add shifted versions
        const extraShifts = [10, 100];
        for (const shift of extraShifts) {
            if (distractors.size >= 3) break;
            if (powerObj.operation === "×") {
                distractors.add(formatAnswer(numberObj.value * (powerObj.value * shift)));
                distractors.add(formatAnswer(numberObj.value * (powerObj.value / shift)));
            } else {
                distractors.add(formatAnswer(numberObj.value / (powerObj.value * shift)));
                distractors.add(formatAnswer(numberObj.value / (powerObj.value / shift)));
            }
        }
    }

    const options = [correctFormatted, ...Array.from(distractors).slice(0, 3)];
    // Shuffle
    for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
    }

    questions.push({
        numberDisplay: numberObj.display,
        numberValue: numberObj.value,
        operation: powerObj.operation,
        powerDisplay: powerObj.display,
        powerValue: powerObj.value,
        correctAnswer: correctFormatted,
        options: options
    });
}

// Game state
let currentQuestionIndex = 0;
let score = 0;
let correctSound, wrongSound;

// Audio
function initAudio() {
    correctSound = new Audio('assets/brass-fanfare-reverberated-146263.mp3');
    wrongSound = new Audio('assets/cartoon-fail-trumpet-278822.mp3');
    correctSound.load();
    wrongSound.load();
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    switchScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        gameOver();
        return;
    }

    const q = questions[currentQuestionIndex];
    document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    
    // Display: "¼ × 100 = ?" or "45.67 ÷ 10 = ?"
    document.getElementById('problem-text').textContent = `${q.numberDisplay} ${q.operation} ${q.powerDisplay} = ?`;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    q.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-button');
        button.textContent = option;
        button.onclick = () => selectOption(button, option, q.correctAnswer);
        optionsContainer.appendChild(button);
    });
}

function selectOption(selectedButton, selectedAnswer, correctAnswer) {
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn === selectedButton) {
            btn.classList.add('incorrect');
        }
    });

    if (selectedAnswer === correctAnswer) {
        score++;
        correctSound.currentTime = 0;
        correctSound.play().catch(e => console.log("Correct sound:", e.message));
    } else {
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e => console.log("Wrong sound:", e.message));
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1300);
}

function gameOver() {
    document.getElementById('final-score').textContent = `You scored ${score} out of ${questions.length}!`;
    switchScreen('game-over-screen');
}

function restartGame() {
    switchScreen('start-screen');
}

document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    switchScreen('start-screen');
});