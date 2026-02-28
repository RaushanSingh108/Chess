const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");

/* ======================
   GAME MODE (friend / computer)
====================== */
const params = new URLSearchParams(window.location.search);
const gameMode = params.get("mode") || "friend";

/* ======================
   SOUND SETTINGS
====================== */
let soundEnabled = true;
const savedSound = localStorage.getItem("soundEnabled");
if (savedSound !== null) soundEnabled = savedSound === "true";

/* ======================
   SOUND SYSTEM
====================== */
const sounds = {
    move: new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3"),
    capture: new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3"),
    check: new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3"),
    gameOver: new Audio("https://www.soundjay.com/buttons/sounds/button-4.mp3")
};

function playSound(type) {
    if (!soundEnabled || !sounds[type]) return;
    sounds[type].currentTime = 0;
    sounds[type].play();
}

/* ======================
   GAME STATE
====================== */
let board = [];
let currentPlayer = "white";
let selectedPiece = null;
let gameOver = false;

const pieces = {
    white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
    black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" }
};

/* ======================
   INIT BOARD
====================== */
function initBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    const back = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

    for (let i = 0; i < 8; i++) {
        board[0][i] = { type: back[i], color: "black", moved: false };
        board[1][i] = { type: "pawn", color: "black", moved: false };
        board[6][i] = { type: "pawn", color: "white", moved: false };
        board[7][i] = { type: back[i], color: "white", moved: false };
    }
}

/* ======================
   RENDER BOARD
====================== */
function renderBoard() {
    boardElement.innerHTML = "";
    const checkPos = getKingInCheck(currentPlayer);

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement("div");
            sq.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");
            sq.dataset.row = r;
            sq.dataset.col = c;

            if (board[r][c]) {
                sq.textContent = pieces[board[r][c].color][board[r][c].type];
            }

            if (checkPos && checkPos.r === r && checkPos.c === c) {
                sq.classList.add("check-king");
            }

            sq.onclick = () => handleClick(r, c);
            boardElement.appendChild(sq);
        }
    }
}

/* ======================
   HANDLE CLICK
====================== */
function handleClick(r, c) {
    if (gameOver) return;
    if (gameMode === "computer" && currentPlayer === "black") return;

    const piece = board[r][c];

    if (selectedPiece) {
        if (isLegalAfterCheck(selectedPiece.r, selectedPiece.c, r, c)) {
            movePiece(selectedPiece.r, selectedPiece.c, r, c);
        }
        selectedPiece = null;
        renderBoard();
        return;
    }

    if (piece && piece.color === currentPlayer) {
        selectedPiece = { r, c };
        highlightMoves(r, c);
    }
}

/* ======================
   HIGHLIGHT MOVES
====================== */
function highlightMoves(sr, sc) {
    renderBoard();
    document.querySelectorAll(".square").forEach(sq => {
        const r = +sq.dataset.row;
        const c = +sq.dataset.col;
        if (isLegalAfterCheck(sr, sc, r, c)) sq.classList.add("move");
        if (r === sr && c === sc) sq.classList.add("selected");
    });
}

/* ======================
   MOVE PIECE
====================== */
function movePiece(sr, sc, dr, dc) {
    const piece = board[sr][sc];
    const capturedPiece = board[dr][dc];

    // 🔊 SOUND
    if (capturedPiece) {
        playSound("capture");
    } else {
        playSound("move");
    }

    board[dr][dc] = piece;
    board[sr][sc] = null;
    piece.moved = true;

    // Pawn promotion
    if (piece.type === "pawn" && (dr === 0 || dr === 7)) {
        const p = prompt("Promote to (queen, rook, bishop, knight):").toLowerCase();
        piece.type = ["queen", "rook", "bishop", "knight"].includes(p) ? p : "queen";
    }

    currentPlayer = currentPlayer === "white" ? "black" : "white";

    evaluateGameState();
    renderBoard();

    // 🤖 AI TRIGGER
    if (!gameOver && gameMode === "computer" && currentPlayer === "black") {
        setTimeout(computerMove, 500);
    }
}

/* ======================
   GAME STATE EVALUATION
====================== */
function evaluateGameState() {
    const inCheck = getKingInCheck(currentPlayer);
    const hasMoves = hasAnyLegalMove(currentPlayer);

    if (inCheck && !hasMoves) {
        gameOver = true;
        statusText.textContent =
            `CHECKMATE – ${capitalize(currentPlayer === "white" ? "black" : "white")} Wins`;
        showGameOverMenu(statusText.textContent);
    } else if (!inCheck && !hasMoves) {
        gameOver = true;
        statusText.textContent = "STALEMATE – Draw";
        showGameOverMenu(statusText.textContent);
    } else if (inCheck) {
        statusText.textContent =
            `CHECK – ${capitalize(currentPlayer)} King in danger`;
        playSound("check");
    } else {
        statusText.textContent = `${capitalize(currentPlayer)}'s Turn`;
    }
}

/* ======================
   LEGAL MOVE CHECK
====================== */
function isLegalAfterCheck(sr, sc, dr, dc) {
    if (!isValidMove(sr, sc, dr, dc)) return false;

    const backupFrom = board[sr][sc];
    const backupTo = board[dr][dc];

    board[dr][dc] = backupFrom;
    board[sr][sc] = null;

    const stillInCheck = getKingInCheck(currentPlayer);

    board[sr][sc] = backupFrom;
    board[dr][dc] = backupTo;

    return !stillInCheck;
}

function hasAnyLegalMove(color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === color) {
                for (let rr = 0; rr < 8; rr++) {
                    for (let cc = 0; cc < 8; cc++) {
                        if (isLegalAfterCheck(r, c, rr, cc)) return true;
                    }
                }
            }
        }
    }
    return false;
}

/* ======================
   CHECK DETECTION
====================== */
function getKingInCheck(color) {
    let kr, kc;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === "king" && p.color === color) {
                kr = r;
                kc = c;
            }
        }
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color !== color) {
                if (isValidMove(r, c, kr, kc)) return { r: kr, c: kc };
            }
        }
    }
    return null;
}

/* ======================
   MOVE RULES
====================== */
function isValidMove(sr, sc, dr, dc) {
    const p = board[sr][sc];
    if (!p) return false;
    if (board[dr][dc] && board[dr][dc].color === p.color) return false;

    const dx = dc - sc;
    const dy = dr - sr;

    switch (p.type) {
        case "pawn":
            return pawnMove(p, sr, sc, dr, dc, dx, dy);
        case "rook":
            return (sr === dr || sc === dc) && clearPath(sr, sc, dr, dc);
        case "bishop":
            return Math.abs(dx) === Math.abs(dy) && clearPath(sr, sc, dr, dc);
        case "queen":
            return (sr === dr || sc === dc || Math.abs(dx) === Math.abs(dy)) && clearPath(sr, sc, dr, dc);
        case "king":
            return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
        case "knight":
            return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
    }
    return false;
}

function pawnMove(p, sr, sc, dr, dc, dx, dy) {
    const dir = p.color === "white" ? -1 : 1;
    if (dx === 0 && dy === dir && !board[dr][dc]) return true;
    if (dx === 0 && dy === 2 * dir && !p.moved && !board[dr][dc] && !board[sr + dir][sc]) return true;
    if (Math.abs(dx) === 1 && dy === dir && board[dr][dc] && board[dr][dc].color !== p.color) return true;
    return false;
}

function clearPath(sr, sc, dr, dc) {
    const rStep = Math.sign(dr - sr);
    const cStep = Math.sign(dc - sc);
    let r = sr + rStep,
        c = sc + cStep;
    while (r !== dr || c !== dc) {
        if (board[r][c]) return false;
        r += rStep;
        c += cStep;
    }
    return true;
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ======================
   GAME OVER MENU
====================== */
function showGameOverMenu(text) {
    playSound("gameOver");
    document.getElementById("gameOverText").textContent = text;
    document.getElementById("gameOverMenu").style.display = "flex";
}

function hideGameOverMenu() {
    document.getElementById("gameOverMenu").style.display = "none";
}

/* ======================
   RESTART
====================== */
function restartGame() {
    hideGameOverMenu();
    gameOver = false;
    currentPlayer = "white";
    selectedPiece = null;
    statusText.textContent = "White's Turn";
    initBoard();
    renderBoard();
}

/* ======================
   AI MOVE (BLACK)
====================== */
function computerMove() {
    if (gameOver) return;

    let moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === "black") {
                for (let rr = 0; rr < 8; rr++) {
                    for (let cc = 0; cc < 8; cc++) {
                        if (isLegalAfterCheck(r, c, rr, cc)) {
                            moves.push({ sr: r, sc: c, dr: rr, dc: cc });
                        }
                    }
                }
            }
        }
    }

    if (moves.length === 0) return;

    const m = moves[Math.floor(Math.random() * moves.length)];
    movePiece(m.sr, m.sc, m.dr, m.dc);
}

/* ======================
   START
====================== */
initBoard();
renderBoard();
statusText.textContent = "White's Turn";