let stats = {
    population: 100,
    food: 50,
    economy: 50,
    relations: 50,
    morale: 100,
    defense: 50,
};

let scenarios = [];
let scenariosLoaded = false;
let gameEnded = false;

fetch('scenarios.json')
    .then(response => response.json())
    .then(data => {
        scenarios = data;
        scenariosLoaded = true;
    })
    .catch(error => console.error("Error loading scenarios:", error));

const scenarioText = document.getElementById("scenario-text");
const choiceButtons = document.getElementById("choice-buttons");
const historicalNote = document.getElementById("historical-note");
const additionalInfo = document.getElementById("additional-info");
const imageElement = document.getElementById("scenario-image");
const infoSection = document.getElementById("info-section");
const nextBtn = document.getElementById("next-btn");
const startBtn = document.getElementById("start-btn");

const populationEl = document.getElementById("population");
const foodEl = document.getElementById("food");
const economyEl = document.getElementById("economy");
const relationsEl = document.getElementById("relations");
const moraleEl = document.getElementById("morale");
const defenseEl = document.getElementById("defense");

let currentScenarioIndex = 0;

startBtn.addEventListener("click", () => {
    if (scenariosLoaded) {
        startGame();
    } else {
        alert("Game data is still loading. Please wait.");
    }
});

nextBtn.addEventListener("click", proceedToNextScenario);

function startGame() {
    startBtn.style.display = "none";
    startBtn.innerText = "Start Game";
    resetStats();
    updateStatsDisplay();
    currentScenarioIndex = 0;
    gameEnded = false;
    clearInfoSections();
    displayScenario();
}

function resetStats() {
    stats = {
        population: 100,
        food: 50,
        economy: 50,
        relations: 50,
        morale: 100,
        defense: 50,
    };
}

function updateStatsDisplay() {
    updateStatElement(populationEl, stats.population);
    updateStatElement(foodEl, stats.food);
    updateStatElement(economyEl, stats.economy);
    updateStatElement(relationsEl, stats.relations);
    updateStatElement(moraleEl, stats.morale);
    updateStatElement(defenseEl, stats.defense);
}

function updateStatElement(element, value) {
    element.innerText = value + "%";
    element.classList.remove("stat-green", "stat-yellow", "stat-red");

    if (value > 75) {
        element.classList.add("stat-green");
    } else if (value >= 50) {
        element.classList.add("stat-yellow");
    } else {
        element.classList.add("stat-red");
    }
}

function displayScenario() {
    if (gameEnded) return;

    clearButtons();
    clearInfoSections();

    if (currentScenarioIndex >= scenarios.length) {
        endGame("Congratulations! You have completed the game.");
        return;
    }

    const scenarioObj = scenarios[currentScenarioIndex];

    if (scenarioObj.preEffect) {
        applyEffects(scenarioObj.preEffect, true);
        updateStatsDisplay();
    }

    choiceButtons.style.display = "block";
    infoSection.style.display = "none";
    nextBtn.style.display = "none";

    scenarioText.innerText = scenarioObj.scenario;
    scenarioObj.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.innerText = choice.text;
        button.classList.add("btn");
        button.addEventListener("click", () => handleChoice(choice));
        choiceButtons.appendChild(button);
    });
}

function handleChoice(choice) {
    applyEffects(choice.effects);
    showInfoSections(choice);

    choiceButtons.style.display = "none";
    infoSection.style.display = "block";
    nextBtn.style.display = "block";
}

function applyEffects(effects, isPreEffect = false) {
    for (let stat in effects) {
        stats[stat] += effects[stat];
        stats[stat] = Math.min(Math.max(stats[stat], 0), 100);
    }
    if (!isPreEffect) updateStatsDisplay();
}

function showInfoSections(choice) {
    historicalNote.innerText = "Historical Note: " + choice.note;
    additionalInfo.innerText = choice.additionalInfo || "";
    imageElement.src = choice.image || "";
    imageElement.style.display = choice.image ? "block" : "none";
}

function proceedToNextScenario() {
    if (gameEnded) return;

    currentScenarioIndex++;
    clearInfoSections();
    checkGameOver();
}

function checkGameOver() {
    if (Object.values(stats).some(value => value <= 0)) {
        endGame("Your colony has failed due to poor management.");
    } else {
        displayScenario();
    }
}

function endGame(message) {
    gameEnded = true;
    clearButtons();
    clearInfoSections();
    scenarioText.innerText = message;
    startBtn.innerText = "Restart Game";
    startBtn.style.display = "block";
    nextBtn.style.display = "none";
}

function clearButtons() {
    choiceButtons.innerHTML = '';
}

function clearInfoSections() {
    historicalNote.innerText = "";
    additionalInfo.innerText = "";
    imageElement.style.display = "none";
}
