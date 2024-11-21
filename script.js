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
const infoSection = document.getElementById("info-section");
const nextBtn = document.getElementById("next-btn");
const startBtn = document.getElementById("start-btn");
const imageContainer = document.createElement("div");
imageContainer.id = "image-container";
infoSection.insertBefore(imageContainer, nextBtn);

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

    imageContainer.innerHTML = "";
    if (scenarioObj.images && scenarioObj.images.length > 0) {
        scenarioObj.images.forEach((imgSrc) => {
            const imgElement = document.createElement("img");
            imgElement.src = imgSrc;
            imgElement.alt = "Scenario Image";
            imgElement.style.maxWidth = "150px";
            imgElement.style.margin = "10px";
            imgElement.style.borderRadius = "5px";
            imgElement.style.cursor = "pointer";
            imgElement.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.15)";
            imgElement.addEventListener("click", () => showImageInPopup(imgSrc));
            imageContainer.appendChild(imgElement);
        });
    }

    scenarioObj.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.innerText = choice.text;
        button.classList.add("btn");
        button.addEventListener("click", () => handleChoice(choice));
        choiceButtons.appendChild(button);
    });
}

function showImageInPopup(src) {
    const overlay = document.createElement("div");
    overlay.id = "image-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    overlay.style.zIndex = "1000";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";

    const zoomedImage = document.createElement("img");
    zoomedImage.src = src;
    zoomedImage.alt = "Zoomed Image";
    zoomedImage.style.maxWidth = "90%";
    zoomedImage.style.maxHeight = "90%";
    zoomedImage.style.borderRadius = "10px";
    zoomedImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.9)";
    zoomedImage.style.cursor = "zoom-in";
    zoomedImage.style.transition = "transform 0.3s ease-in-out";

    let scale = 1;
    let isZoomedIn = false;
    zoomedImage.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!isZoomedIn) {
            scale = 2;
            zoomedImage.style.transform = `scale(${scale})`;
            zoomedImage.style.cursor = "zoom-out";
            isZoomedIn = true;
        } else {
            scale = 1;
            zoomedImage.style.transform = `scale(${scale})`;
            zoomedImage.style.cursor = "zoom-in";
            isZoomedIn = false;
        }
    });

    zoomedImage.addEventListener("wheel", (event) => {
        event.preventDefault();
        scale += event.deltaY * -0.01;
        scale = Math.min(Math.max(0.5, scale), 3);
        zoomedImage.style.transform = `scale(${scale})`;
        isZoomedIn = scale > 1;
        zoomedImage.style.cursor = isZoomedIn ? "zoom-out" : "zoom-in";
    });

    overlay.addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    overlay.appendChild(zoomedImage);
    document.body.appendChild(overlay);
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
    imageContainer.innerHTML = "";
}
