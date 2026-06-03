/* ==========================
   ELEMENT REFERENCES
========================== */

const selectionPage = document.getElementById("selectionPage");
const gamePage = document.getElementById("gamePage");

const chooseX = document.getElementById("chooseX");
const chooseO = document.getElementById("chooseO");

const backBtn = document.getElementById("backBtn");

const playerSymbolEl = document.getElementById("playerSymbol");
const computerSymbolEl = document.getElementById("computerSymbol");

const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");
const drawScoreEl = document.getElementById("drawScore");

const cells = document.querySelectorAll(".cell");

const resetBoardBtn = document.getElementById("resetBoardBtn");
const restartMatchBtn = document.getElementById("restartMatchBtn");
const changeSymbolBtn = document.getElementById("changeSymbolBtn");

const modal = document.getElementById("resultModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");

const playAgainBtn = document.getElementById("playAgainBtn");
const modalChangeSymbolBtn = document.getElementById("modalChangeSymbolBtn");

const confettiContainer = document.getElementById("confettiContainer");

/* ==========================
   GAME VARIABLES
========================== */

let player = "X";
let computer = "O";

let board = Array(9).fill("");

let gameActive = false;

/* ==========================
   SCORES
========================== */

let scores =
JSON.parse(localStorage.getItem("ticTacToeScores")) || {
    player: 0,
    computer: 0,
    draws: 0
};

updateScoreboard();

/* ==========================
   WIN PATTERNS
========================== */

const WINS = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
];

/* ==========================
   PAGE SWITCHING
========================== */

function showSelectionPage() {
    gamePage.classList.remove("active");
    selectionPage.classList.add("active");
}

function showGamePage() {
    selectionPage.classList.remove("active");
    gamePage.classList.add("active");
}

/* ==========================
   START GAME
========================== */

function startGame(symbol){

    player = symbol;
    computer = symbol === "X" ? "O" : "X";

    localStorage.setItem(
        "selectedSymbol",
        player
    );

    playerSymbolEl.textContent = player;
    computerSymbolEl.textContent = computer;

    resetBoard();

    showGamePage();

    gameActive = true;

    if(computer === "X"){
        setTimeout(computerMove,500);
    }
}

/* ==========================
   BUTTON EVENTS
========================== */

chooseX.addEventListener("click", () => {
    startGame("X");
});

chooseO.addEventListener("click", () => {
    startGame("O");
});

backBtn.addEventListener("click", () => {

    closeModal();

    showSelectionPage();

});

/* ==========================
   BOARD RESET
========================== */

function resetBoard(){

    board = Array(9).fill("");

    gameActive = true;

    cells.forEach(cell => {

        cell.textContent = "";

        cell.classList.remove(
            "filled",
            "win"
        );
    });
}

/* ==========================
   CELL CLICK
========================== */

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        if(!gameActive) return;

        const index =
        Number(cell.dataset.index);

        if(board[index] !== ""){
            return;
        }

        makeMove(
            index,
            player
        );

        if(checkGameEnd()){
            return;
        }

        setTimeout(() => {

            computerMove();

            checkGameEnd();

        },250);

    });

});

/* ==========================
   MAKE MOVE
========================== */

function makeMove(index,symbol){

    board[index] = symbol;

    cells[index].textContent =
    symbol;

    cells[index].classList.add(
        "filled"
    );
}

/* ==========================
   COMPUTER MOVE
========================== */

function computerMove(){

    if(!gameActive){
        return;
    }

    let bestScore = -Infinity;
    let bestMove = null;

    for(let i=0;i<9;i++){

        if(board[i] === ""){

            board[i] = computer;

            let score =
            minimax(
                board,
                0,
                false
            );

            board[i] = "";

            if(score > bestScore){

                bestScore = score;
                bestMove = i;
            }
        }
    }

    if(bestMove !== null){

        makeMove(
            bestMove,
            computer
        );
    }
}

/* ==========================
   MINIMAX
========================== */

function minimax(
    tempBoard,
    depth,
    isMaximizing
){

    let result =
    evaluate(tempBoard,depth);

    if(result !== null){
        return result;
    }

    if(isMaximizing){

        let bestScore =
        -Infinity;

        for(let i=0;i<9;i++){

            if(tempBoard[i] === ""){

                tempBoard[i] =
                computer;

                let score =
                minimax(
                    tempBoard,
                    depth+1,
                    false
                );

                tempBoard[i] = "";

                bestScore =
                Math.max(
                    bestScore,
                    score
                );
            }
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for(let i=0;i<9;i++){

        if(tempBoard[i] === ""){

            tempBoard[i] =
            player;

            let score =
            minimax(
                tempBoard,
                depth+1,
                true
            );

            tempBoard[i] = "";

            bestScore =
            Math.min(
                bestScore,
                score
            );
        }
    }

    return bestScore;
}

/* ==========================
   EVALUATION
========================== */

function evaluate(
    currentBoard,
    depth
){

    for(let combo of WINS){

        const [a,b,c] = combo;

        if(
            currentBoard[a] &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[a] === currentBoard[c]
        ){

            if(
                currentBoard[a] === computer
            ){
                return 10 - depth;
            }

            if(
                currentBoard[a] === player
            ){
                return depth - 10;
            }
        }
    }

    if(
        !currentBoard.includes("")
    ){
        return 0;
    }

    return null;
}

/* ==========================
   CHECK WINNER
========================== */

function checkGameEnd(){

    for(let combo of WINS){

        const [a,b,c] = combo;

        if(
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ){

            gameActive = false;

            cells[a].classList.add("win");
            cells[b].classList.add("win");
            cells[c].classList.add("win");

            if(board[a] === player){

                scores.player++;

                saveScores();

                showModal(
                    "🏆 YOU WON!",
                    "Congratulations Champion!"
                );

                createConfetti();

            }else{

                scores.computer++;

                saveScores();

                showModal(
                    "💀 YOU LOSE",
                    "Computer Wins!"
                );
            }

            return true;
        }
    }

    if(
        !board.includes("")
    ){

        gameActive = false;

        scores.draws++;

        saveScores();

        showModal(
            "🤝 TIE MATCH",
            "Great Game!"
        );

        return true;
    }

    return false;
}

/* ==========================
   MODAL
========================== */

function showModal(
    title,
    message
){

    modalTitle.textContent =
    title;

    modalMessage.textContent =
    message;

    modal.classList.add(
        "show"
    );
}

function closeModal(){

    modal.classList.remove(
        "show"
    );
}

playAgainBtn.addEventListener(
    "click",
    () => {

        closeModal();

        resetBoard();

        if(computer === "X"){
            setTimeout(
                computerMove,
                500
            );
        }
    }
);

modalChangeSymbolBtn.addEventListener(
    "click",
    () => {

        closeModal();

        showSelectionPage();
    }
);

/* ==========================
   CONTROL BUTTONS
========================== */

resetBoardBtn.addEventListener(
    "click",
    () => {

        resetBoard();

        if(computer === "X"){
            setTimeout(
                computerMove,
                500
            );
        }
    }
);

restartMatchBtn.addEventListener(
    "click",
    () => {

        scores = {
            player:0,
            computer:0,
            draws:0
        };

        saveScores();

        resetBoard();
    }
);

changeSymbolBtn.addEventListener(
    "click",
    () => {

        showSelectionPage();
    }
);

/* ==========================
   SCOREBOARD
========================== */

function saveScores(){

    localStorage.setItem(
        "ticTacToeScores",
        JSON.stringify(scores)
    );

    updateScoreboard();
}

function updateScoreboard(){

    playerScoreEl.textContent =
    scores.player;

    computerScoreEl.textContent =
    scores.computer;

    drawScoreEl.textContent =
    scores.draws;
}

/* ==========================
   CONFETTI
========================== */

function createConfetti(){

    confettiContainer.innerHTML =
    "";

    for(let i=0;i<80;i++){

        const confetti =
        document.createElement("div");

        confetti.classList.add(
            "confetti"
        );

        confetti.style.left =
        Math.random()*100 + "%";

        confetti.style.top =
        "-10px";

        confetti.style.background =
        [
            "#FF69B4",
            "#8A2BE2",
            "#E6E6FA",
            "#FFFFFF"
        ][
            Math.floor(
                Math.random()*4
            )
        ];

        confetti.style.animation =
        `fall ${
            Math.random()*2+2
        }s linear forwards`;

        confettiContainer.appendChild(
            confetti
        );
    }
}

/* ==========================
   INITIAL PAGE
========================== */

showSelectionPage();
