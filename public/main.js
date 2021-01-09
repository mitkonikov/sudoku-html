const UNSELECTED = "#0d88ad";
const SELECTED = "#09646e";
const PUZZLE_COLOR = "#008042";

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

    document.getElementById('container').appendChild(table);
}

document.addEventListener('keypress', (e) => {
    let x = selectedCell.parentNode.rowIndex;
    let y = selectedCell.cellIndex;
    let number = e.keyCode - 48;
    if (possible(x, y, number)) {
        grid[x][y] = e.keyCode - 48;
        selectedCell.innerHTML = e.keyCode - 48;
    }
});

/**
 * Updates the UI with the grid data
 */
let draw = () => {
    let table = document.getElementById('main-table');
    let x = 0, y = 0;
    for (let row of table.children) {
        for (let cell of row.children) {
            if (grid[x][y] != 0) {
                cell.innerHTML = grid[x][y];
                cell.style.backgroundColor = PUZZLE_COLOR;
            } else {
                cell.innerHTML = "";
                cell.style.backgroundColor = UNSELECTED;
            }
            y++;
        }
        y = 0;
        x++;
    }
}

/// =================================================
/// THIS IS WHERE THE SUDOKU SOLVING ALGORITHM STARTS
/// =================================================

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
    // With this formula we find which are the
    // starting coordinates of the subgrid that contains the point(x, y)
    let subGridX = Math.floor(x / 3) * 3;
    let subGridY = Math.floor(y / 3) * 3;
    // Then, we go through the subgrid and check if there's already that number
    // If we find the same number, it means that it's not possible to put the number
    // in the given subgrid, thus returning false
    for (let i = subGridX; i < subGridX + 3; i++) {
        for (let k = subGridY; k < subGridY + 3; k++) {
            if (grid[i][k] == n) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Is it possible to put there a number 'n'?
 * @param {Number} x X coordinate
 * @param {Number} y Y coordinate
 * @param {Number} n Number to put there
 */
let possible = (x, y, n) => {
    return checkRow(x, n) && checkCol(y, n) && checkSubGrid(x, y, n);
}

/**
 * Tests if the algorithm is finished
 * @param {Number} x 
 * @param {Number} y 
 */
let isFinished = (x, y) => {
    if (x == 8 && y == 9) {
        return true; // It's solved, we are at the end
    }

    return false;
}

// The empty squares are 0s
let solve = (x, y) => {
    if (isFinished(x, y)) return true;

    // If y is 9, go to the next row
    if (y == 9) {
        x++;
        y = 0;
    }

    // If there's already a number there, just skip it
    if (grid[x][y] > 0) return solve(x, y + 1);
    
    // If it's free, we go through each possible number
    for (let n = 1; n <= 9; n++) {
        if (possible(x, y, n)) {
            // If it's possible to put there the number,
            // put it, and try to solve for the next square
            // if the solve hits a dead-end it will return false
            // and we are going to know that the solution cannot
            // be with this number.

            grid[x][y] = n;
            if (solve(x, y + 1)) return true;
            grid[x][y] = 0;
        }
    }

    return false;
}

/**
 * Reset the grid, lockedCells and the UI all to 0s
 */
let emptyPuzzle = () => {
    for (let i = 0; i < 9; i++) {
        for (let k = 0; k < 9; k++) {
            lockedCells[i][k] = false;
            grid[i][k] = 0;
        }
    }

    draw();
}

// We create a board and fetch a puzzle from the API
createBoard(9, 9);
fetchSudokuPuzzle().then(() => {
    draw();
});