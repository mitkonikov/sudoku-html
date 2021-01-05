const UNSELECTED = "#29cafb";
const SELECTED = "#048bb4";
const PUZZLE_COLOR = "#29fb88";

let grid = [];
let lockedCells;

let fetchSudokuPuzzle = () => {
    return fetch('https://sugoku.herokuapp.com/board?difficulty=easy', {
        method: 'GET'
    })
    .then(response => response.json())
    .then((res) => {
        grid = res.board;
        lockedCells = grid.map((x) => x.map((y) => (y > 0)));
    });
}

let selectedCell;

/**
 * Function to handle the onclick event in every cell
 * @param {*} e Event Callback Param
 */
let selectCell = (e) => {
    let x = e.target.parentNode.rowIndex;
    let y = e.target.cellIndex;
    if (lockedCells[x][y]) return;

    if (typeof selectedCell != "undefined") {
        selectedCell.style.backgroundColor = UNSELECTED;
    }
    
    selectedCell = e.target;
    selectedCell.style.backgroundColor = SELECTED;
}

let createBoard = (w, h) => {
    let table = document.createElement('table');
    table.id = 'main-table';
    for (let i = 0; i < h; i++) {
        let row = document.createElement('tr');
        for (let k = 0; k < w; k++) {
            let cell = document.createElement('td');
            cell.addEventListener("click", selectCell);
            row.appendChild(cell);
        }

        table.appendChild(row);
    }

    document.body.appendChild(table);
}

document.addEventListener('keypress', (e) => {
    let x = selectedCell.parentNode.rowIndex;
    let y = selectedCell.cellIndex;
    grid[x][y] = e.keyCode - 48;
    selectedCell.innerHTML = e.keyCode - 48;
});

let draw = () => {
    let table = document.getElementById('main-table');
    let x = 0, y = 0;
    for (let row of table.children) {
        for (let cell of row.children) {
            if (grid[x][y] != 0) {
                cell.innerHTML = grid[x][y];
                cell.style.backgroundColor = PUZZLE_COLOR;
            }
            y++;
        }
        y = 0;
        x++;
    }
}

/**
 * Go through the row and check if the row has that number
 * It returns is it possible to put the new number in the square
 * @param {Number} x The row coordinate of the new element
 * @param {Number} n The number we want to put in there
 */
let checkRow = (x, n) => {
    for (let i = 0; i < 9; i++) {
        if (grid[x][i] == n) {
            return false;
        }
    }

    return true;
}

/**
 * Go through the column and check if the column has that number
 * It returns is it possible to put the new number in the square
 * @param {Number} y The column coordinate of the new element
 * @param {Number} n The number we want to put in there
 */
let checkCol = (y, n) => {
    for (let i = 0; i < 9; i++) {
        if (grid[i][y] == n) {
            return false;
        }
    }
    
    return true;
}

/**
 * Check the subgrid, if it's possible to put this number
 * in the specific subgrid
 * @param {Number} x the X coordinate of the cell
 * @param {Number} y the Y coordinate of the cell
 * @param {Number} n the number to put in the cell
 */
let checkSubGrid = (x, y, n) => {
    let subGridX = Math.floor(x / 3) * 3;
    let subGridY = Math.floor(y / 3) * 3;
    for (let i = subGridX; i < subGridX + 3; i++) {
        for (let k = subGridY; k < subGridY + 3; k++) {
            if (grid[i][k] == n) {
                return false;
            }
        }
    }

    return true;
}

let possible = (x, y, n) => {
    return checkRow(x, n) && checkCol(y, n) && checkSubGrid(x, y, n);
}

let isSolved = () => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] == 0) return false;
        }
    }

    return true;
}

let solve = (x, y) => {
    if (x == 8 && y == 9) {
        return true; // It's solved, we are at the end
    }

    // If y is 9, go to the next row
    if (y == 9) {
        x++;
        y = 0;
    }

    if (grid[x][y] > 0) return solve(x, y + 1);
    for (let n = 1; n <= 9; n++) {
        if (possible(x, y, n)) {
            grid[x][y] = n;
            if (solve(x, y + 1)) return true;
            grid[x][y] = 0;
        }
    }

    return false;
}

createBoard(9, 9);
fetchSudokuPuzzle().then(() => {
    draw();
});