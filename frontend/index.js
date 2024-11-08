import { backend } from "declarations/backend";

class TreasureHuntGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.startButton = document.getElementById('start-button');
        this.currentScoreElement = document.getElementById('current-score');
        this.highScoreElement = document.getElementById('high-score');
        this.timerElement = document.getElementById('timer');
        
        this.gridSize = 10;
        this.gameActive = false;
        this.timeRemaining = 60;
        this.timerInterval = null;
        
        this.initializeBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        this.gameBoard.innerHTML = '';
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.gameBoard.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.gameBoard.addEventListener('click', (e) => this.handleCellClick(e));
    }

    async startGame() {
        this.gameActive = true;
        this.startButton.disabled = true;
        this.timeRemaining = 60;
        this.clearBoard();
        
        await backend.startGame();
        this.startGameLoop();
        this.startTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.timerElement.textContent = this.timeRemaining;
            
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    async endGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        this.startButton.disabled = false;
        await backend.endGame();
    }

    clearBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
            cell.textContent = '';
        });
    }

    async handleCellClick(e) {
        if (!this.gameActive) return;
        
        const cell = e.target;
        if (!cell.classList.contains('cell') || !cell.classList.contains('treasure')) return;
        
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        
        const result = await backend.collectTreasure(x, y);
        if (result !== null) {
            cell.classList.remove('treasure');
            this.showCollectAnimation(cell, result);
        }
    }

    showCollectAnimation(cell, value) {
        const animation = document.createElement('div');
        animation.className = 'collect-animation';
        animation.textContent = `+${value}`;
        cell.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 1000);
    }

    async updateBoard(treasures) {
        this.clearBoard();
        treasures.forEach(treasure => {
            const cell = this.gameBoard.children[treasure.y * this.gridSize + treasure.x];
            cell.classList.add('treasure');
            cell.textContent = treasure.value;
        });
    }

    async startGameLoop() {
        const updateGame = async () => {
            if (!this.gameActive) return;
            
            const state = await backend.getGameState();
            this.updateBoard(state.treasures);
            this.currentScoreElement.textContent = state.score;
            this.highScoreElement.textContent = state.highScore;
            
            if (state.active) {
                requestAnimationFrame(updateGame);
            }
        };
        
        requestAnimationFrame(updateGame);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new TreasureHuntGame();
});
