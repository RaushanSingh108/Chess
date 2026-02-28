document.getElementById("playBtn").onclick = function() {
    window.location.href = "game.html";
};

function goHome() {
    window.location.href = "index.html";
}

function playWithFriend() {
    window.location.href = "game.html";
}

function playWithComputer() {
    alert("Play with Computer mode coming soon!");
}

function playWithComputer() {
    window.location.href = "game.html?mode=computer";
}

function openSettings() {
    alert("Settings page coming soon!");
}

function toggleDifficulty() {
    const box = document.getElementById("difficultyOptions");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function startComputerGame(level) {
    window.location.href = `game.html?mode=computer&level=${level}`;
}

function openAbout() {
    document.getElementById("aboutModal").style.display = "flex";
}

function closeAbout() {
    document.getElementById("aboutModal").style.display = "none";
}

function openSettings() {
    document.getElementById("settingsModal").style.display = "flex";
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
    const theme = document.getElementById("themeSelect").value;
    localStorage.setItem("boardTheme", theme);

    localStorage.setItem("soundEnabled", soundEnabled);

    closeSettings();
    alert("Settings Saved!");
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById("soundToggleBtn").textContent = soundEnabled ? "ON" : "OFF";
}