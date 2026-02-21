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