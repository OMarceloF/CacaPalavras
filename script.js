// script.js

// Configurações
const gridSize = 10;
const words = ['CIRIO', 'NAZARE', 'IGREJA', 'SANTO', 'PADROEIRA', 'MILAGRE'];
const foundLetters = new Set();
let totalLettersInWords = 0;
let timerInterval;
let foundWords = new Set();

// Função para criar uma grade inicial
function createGrid(size) {
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid[i] = [];
        for (let j = 0; j < size; j++) {
            grid[i][j] = '';
        }
    }
    return grid;
}

// Função para verificar se a palavra pode ser inserida na grade
function canPlaceWord(grid, word, row, col, direction) {
    const size = grid.length;
    for (let i = 0; i < word.length; i++) {
        if (direction === 0) { // Horizontal
            if (col + i >= size || grid[row][col + i] !== '') {
                return false;
            }
        } else { // Vertical
            if (row + i >= size || grid[row + i][col] !== '') {
                return false;
            }
        }
    }
    return true;
}

// Função para adicionar palavras na grade
function addWordToGrid(grid, word) {
    const size = grid.length;
    let placed = false;
    
    while (!placed) {
        const direction = Math.floor(Math.random() * 2); // 0: horizontal, 1: vertical
        let row, col;
        
        if (direction === 0) { // Horizontal
            row = Math.floor(Math.random() * size);
            col = Math.floor(Math.random() * (size - word.length));
        } else { // Vertical
            row = Math.floor(Math.random() * (size - word.length));
            col = Math.floor(Math.random() * size);
        }
        
        if (canPlaceWord(grid, word, row, col, direction)) {
            for (let i = 0; i < word.length; i++) {
                if (direction === 0) {
                    grid[row][col + i] = word[i];
                    foundLetters.add(`${row}-${col + i}`);
                } else {
                    grid[row + i][col] = word[i];
                    foundLetters.add(`${row + i}-${col}`);
                }
            }
            totalLettersInWords += word.length;
            placed = true;
        }
    }
}

// Função para preencher a grade com letras aleatórias
function fillGrid(grid) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

// Função para renderizar a grade no HTML
function renderGrid(grid) {
    const container = document.getElementById('word-search');
    container.innerHTML = '';
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = grid[i][j];
            cell.dataset.position = `${i}-${j}`;
            cell.addEventListener('click', handleCellClick);
            container.appendChild(cell);
        }
    }
}

// Função para mostrar a tela de conclusão
function showCompletionScreen() {
    const completionScreen = document.getElementById('completion-screen');
    const wordSearchContainer = document.getElementById('word-search-container');
    const timeTaken = document.getElementById('timer').textContent;
    const completionMessage = document.getElementById('completion-message');

    // Esconde a grade e a lista de palavras
    document.getElementById('word-search').style.display = 'none';
    document.getElementById('word-list').style.display = 'none';
    document.getElementById('start-button').style.display = 'none';

    // Exibe a tela de conclusão
    completionMessage.textContent = `Você concluiu o caça-palavras em ${timeTaken}`;
    completionScreen.style.display = 'flex';
    
    // Adiciona funcionalidade aos botões
    document.getElementById('restart-button').addEventListener('click', () => {
        location.reload();
    });

    document.getElementById('share-button').addEventListener('click', () => {
        const link = encodeURIComponent(window.location.href);
        const message = `Fiz o Caça Palavras em ${timeTaken}, venha jogar também! ${link}`;
        window.open(`https://wa.me/?text=${message}`, '_blank');
    });
}

// Função para lidar com o clique na célula
function handleCellClick(event) {
    const cell = event.target;
    const position = cell.dataset.position;

    if (foundLetters.has(position)) {
        cell.classList.add('highlight');
        foundLetters.delete(position);
        if (foundLetters.size === 0) {
            clearInterval(timerInterval);
            setTimeout(showCompletionScreen, 100); // Substitui o alert por showCompletionScreen
        }
    }

    // Verificar se uma palavra foi encontrada
    checkWordFound(position);
}

// Função para verificar se uma palavra foi encontrada
function checkWordFound(position) {
    const [row, col] = position.split('-').map(Number);

    words.forEach(word => {
        const directions = [
            { x: 1, y: 0 }, // Horizontal
            { x: 0, y: 1 }  // Vertical
        ];

        directions.forEach(direction => {
            let match = true;

            for (let i = 0; i < word.length; i++) {
                const currentRow = row + i * direction.y;
                const currentCol = col + i * direction.x;

                if (
                    currentRow >= gridSize ||
                    currentCol >= gridSize ||
                    document.querySelector(`[data-position="${currentRow}-${currentCol}"]`).textContent !== word[i]
                ) {
                    match = false;
                    break;
                }
            }

            if (match) {
                if (!foundWords.has(word)) {
                    foundWords.add(word);
                    const wordElements = document.querySelectorAll('#word-list div');
                    wordElements.forEach(wordElement => {
                        if (wordElement.textContent === word) {
                            setTimeout(() => {
                                wordElement.classList.add('cross-out');
                            }, 4500)
                            
                        }
                    });
                }
            }
        });
    });
}

// Função para iniciar o temporizador
function startTimer() {
    const timer = document.getElementById('timer');
    let seconds = 0;

    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timer.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }, 1000);
}

// Função para renderizar a lista de palavras
function renderWordList(words) {
    const wordListContainer = document.getElementById('word-list');
    wordListContainer.innerHTML = words.map(word => `<div>${word}</div>`).join('');
}

// Função principal para criar o caça-palavras
function createWordSearch(words, gridSize) {
    let grid = createGrid(gridSize);

    words.forEach(word => addWordToGrid(grid, word));

    fillGrid(grid);

    renderGrid(grid);
    renderWordList(words);
}

// Função para iniciar o jogo
function startGame() {
    createWordSearch(words, gridSize);
    startTimer();
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('word-search').style.display = 'grid';
    document.getElementById('word-list').style.display = 'flex';
}

// Adicionar evento ao botão "Começar"
document.getElementById('start-button').addEventListener('click', startGame);
