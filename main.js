const handlers = [];
const playerChoices = document.querySelectorAll('.board-control');
const playWithAi = document.querySelector('#playertwo');
const Undefeated = document.querySelector('#playeruai');
const win_Draw_Loose_Msg = document.querySelector('.win-draw-loose');

const playerOne = Player('Emman','x');
const playerAI = Player('AI','o');
const playerUAI = Player('UAI','o');
const secondPlayer = Player('vincent','o');
let playerTwo = opponent();
let currentPlayer = playerOne;

function opponent() {
    return Undefeated.checked ? playerUAI : playWithAi.checked ? playerAI : secondPlayer;
}

const GameBoard = (() => {
    let gameBoard = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ]

    const getBoard = () => {
        const boardArr = []
        for (let i = 0; i < 9; i++)
                boardArr.push(gameBoardSpot(i))
        return (boardArr)
    }

    const gameBoardSpot = (spot) => gameBoard[Math.floor(spot / 3)][spot % 3]

    const refresh = () => {
        for (let i = 0; i < 9; i++)
            gameBoard[Math.floor(i / 3)][i % 3] = null
    }

    const markPlacer = (pos, player) => {
        if(!gameBoardSpot(pos)) {
            gameBoard[Math.floor(pos / 3)][pos % 3] = player.getMark();
            winner_Draw(player)
            switchPlayer(player)
            if (currentPlayer.getName() === 'AI') {
                const aiPos = aiChoice()
                if(aiPos === undefined)
                    return
                markPlacer (aiPos, currentPlayer)
                updateUi(aiPos)
            }
            if (currentPlayer.getName() === 'UAI') {
                const uaiPos = uaiChoice(getBoard(), currentPlayer).index
                if(uaiPos === undefined)
                    return
                markPlacer (uaiPos, currentPlayer)
                updateUi(uaiPos)
            }
        }
    }

    const getvalue = (spot) => {
        return gameBoardSpot(spot);
    }

    const availableSpots = () => {
        const spots = [];
        for (let i = 0; i < 9; i++) {
            if (!gameBoardSpot(i))
                spots.push(i)
        }
        return (spots)
    }

    const checkWinner = (player) => {
        const rowWin = () => {
            for (let i = 0; i < 3; i++) {
                if (gameBoard[i].every(mark => mark === player.getMark()))
                    return true
            }
            return false
        }

        const colWin = () => {
            for (let i = 0; i < 3; i++) {
                if(gameBoard.every(row => row[i] === player.getMark()))
                    return true;
            }
            return false
        }
        const priDiaWin = gameBoard.every((row, index) => row[index] === player.getMark())
        const secDiaWin = gameBoard.every((row, index) => row[2 - index] === player.getMark())

        if(rowWin() || colWin() || priDiaWin || secDiaWin)
            return true
    }

    const checkDraw = () => {
        return gameBoard.every(row => row.every(item => item !== null))
    }

    const winner_Draw = (player) => {
        if(checkWinner(player)) {
            win_Draw_Loose_Msg.textContent = `${player.getName()} won the game`
            playerChoices.forEach(playerChoice => {
                handlers.forEach(handler => {
                    playerChoice.removeEventListener('click', handler);
                });
            });
            return (`${player.getName()} won the game`)
        }
        if(checkDraw()) {
            win_Draw_Loose_Msg.textContent = 'Oh no! its a draw 😏 😏'
            return ('Oh no! its a draw')
        }
        return false
    }
    return {
        availableSpots,
        markPlacer,
        winner_Draw,
        getBoard,
        getvalue,
        refresh
    };
})()

function Player (name = 'You', mark) {
    const getMark = () => mark;
    const getName = () => name
    return {getMark, getName}
}

playerChoices.forEach(playerChoice => {
    const playerChoicedata = playerChoice.dataset.pos;
    const handler = () => {players_Play(playerChoicedata)};
    handlers.push(handler);
    playerChoice.addEventListener('click', handler);
});

function players_Play(playerChoicedata) {
    GameBoard.markPlacer(playerChoicedata, currentPlayer)
    updateUi(playerChoicedata)
}

function switchPlayer (player) {
    if (player === playerOne)
        currentPlayer = playerTwo
    else
        currentPlayer = playerOne
}

function updateUi(spot) {
    const playersign = GameBoard.getvalue(spot);
    const uiSpot = document.querySelector(`[data-pos="${spot}"]`)
    uiSpot.textContent = playersign;
}

[playWithAi, Undefeated].forEach(ai => {
    ai.addEventListener('change', () => {
        playerTwo = opponent()
        currentPlayer = playerOne;
        GameBoard.refresh()
        playerChoices.forEach(playerChoice => {
            playerChoice.textContent = '';
        })
        playerChoices.forEach(playerChoice => {
            const playerChoicedata = playerChoice.dataset.pos;
            const handler = () => {players_Play(playerChoicedata)};
            handlers.push(handler);
            playerChoice.addEventListener('click', handler);
        });
    })
}); 

function aiChoice () {
    const availSpotsArr = GameBoard.availableSpots() 
    return (availSpotsArr[Math.floor(Math.random() * availSpotsArr.length)]);
}

const uaiChoice = (board, player) => {
    const winCombos = [  
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];

    const evaluateBoard = board => {
        for (let i = 0; i < winCombos.length; i++) {
          const [a, b, c] = winCombos[i];
          if (board[a] === board[b] && board[b] === board[c]) {
            return board[a];
          }
        }
        if (board.includes(null)) {
          return null;
        }
        return "draw";
      };

      const minimax = (board, player) => {
        let winner = evaluateBoard(board);
        if (winner !== null) {
          switch (winner) {
            case "x":
              return { score: -10 };
            case "o":
              return { score: 10 };
            case "draw":
              return { score: 0 };
          }
        }
        let moves = [];
        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = player.getMark();
            let result;
            if (player === playerTwo)
                result = minimax(board, playerOne);
            else    
                result = minimax(board, playerTwo);
            moves.push({ index: i, score: result.score });
            board[i] = null;
          }
        }
        let bestMove;
        if (player.getMark() === "o") {
          let bestScore = -Infinity;
          for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
              bestScore = moves[i].score;
              bestMove = i;
            }
          }
        } else {
          let bestScore = Infinity;
          for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
              bestScore = moves[i].score;
              bestMove = i;
            }
          }
        }
        return moves[bestMove];
      };
      return minimax(board, player);
};




