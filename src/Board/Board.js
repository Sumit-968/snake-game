import React, {useEffect, useState, useRef } from "react";
import {
  BsFillArrowLeftSquareFill,
  BsFillArrowRightSquareFill,
  BsFillArrowDownSquareFill,
  BsFillArrowUpSquareFill,
} from "react-icons/bs";
import {BiSpaceBar} from "react-icons/bi"
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  randomIntFromInterval,
  reverseLinkedList,
  useInterval,
} from "../lib/utils.js";
import "./Board.css";

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(value) {
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const Direction = {
  UP: "UP", 
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  LEFT: "LEFT",
};

const BOARD_SIZE = 20;
const PROBABILITY_OF_DIRECTION_REVERSAL_FOOD = 0.3;

const getStartingSnakeLLValue = (board) => {
  const rowSize = board.length;
  const colSize = board[0].length;
  const startingRow = Math.round(rowSize / 3);
  const startingCol = Math.round(colSize / 3);
  const startingCell = board[startingRow][startingCol];

  return {
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};
const Board = () => {
  const [highscore, setHighscore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createBoard(BOARD_SIZE));
  const [snake, setSnake] = useState(
    new LinkedList(getStartingSnakeLLValue(board))
  );
  const [snakeCells, _setSnakeCells] = useState(
    new Set([snake.head.value.cell])
  );
  const snakeCellsHookRef = useRef(snakeCells);
  const setSnakeCells = newSnakeCells => {
    snakeCellsHookRef.current = newSnakeCells;
    _setSnakeCells(newSnakeCells);
  }



  // Set the starting food cell 5 cells away from the starting snake cell.
  const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
  const [direction, _setDirection] = useState(Direction.RIGHT);
  const directionHookRef = useRef(direction);
  const setDirection = direction => {
    directionHookRef.current = direction;
    _setDirection(direction);
  }
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] =
    useState(false);
  
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      handleKeydown(e);
    });
  },[]);

  useEffect(() => {
    if(localStorage.getItem("highscore")){
      setHighscore(localStorage.getItem("highscore"));
    }
    else{
      setHighscore(0);
    }
  },[]);

  useEffect(()=>{
    document.body.onkeyup = (e)=>{
      if((e.keyCode == 32) && !isRunning){
        resetGame();
      }
    }
  },[])
  

  useInterval(() => {
    if (isRunning && !gameOver) {
      moveSnake();
    }
  }, 150);

  // Touch Key control for small devices
  const up = {
    key: "ArrowUp",
  };
  const down = {
    key: "ArrowDown",
  };
  const left = {
    key: "ArrowLeft",
  };
  const right = {
    key: "ArrowRight",
  };

  
 // handle key press 
  const handleKeydown = (e) => {
    const newDirection = getDirectionFromKey(e.key);
    const isValidDirection = newDirection !== "";
    if (!isValidDirection) return;
    if (isValidDirection) {
      setIsRunning(true);
    }
    const snakeWillRunIntoItself = 
    getOppositeDirection(newDirection) === directionHookRef.current && snakeCellsHookRef.current.size > 1;
    if(snakeWillRunIntoItself) return;
    setDirection(newDirection);
    // setRevDir(getOppositeDirection(newDirection));

  };

  //Handle movement of snake
  const moveSnake = () => {
    const currentHeadCoords = {
      row: snake.head.value.row,
      col: snake.head.value.col,
    };

    const nextHeadCoords = getCoordsInDirection(currentHeadCoords, direction);
    
    if (isOutOfBounds(nextHeadCoords, board)) {
      handleGameOver();
      return;
    }
    
    const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];

    if (snakeCells.has(nextHeadCell)) {
      handleGameOver();
      return;
    }

    const newHead = new LinkedListNode({
      row: nextHeadCoords.row,
      col: nextHeadCoords.col,
      cell: nextHeadCell,
    });
    const currentHead = snake.head;
    snake.head = newHead;
    currentHead.next = newHead;

    const newSnakeCells = new Set(snakeCells);
    newSnakeCells.delete(snake.tail.value.cell);
    newSnakeCells.add(nextHeadCell);

    snake.tail = snake.tail.next;
    if (snake.tail === null) snake.tail = snake.head;

    const foodConsumed = nextHeadCell === foodCell;
    if (foodConsumed) {
      // This function mutates newSnakeCells.
      growSnake(newSnakeCells);
      if (foodShouldReverseDirection) reverseSnake();

      handleFoodConsumption(newSnakeCells);
    }

    setSnakeCells(newSnakeCells);

    // setCurrCell(board[currentHeadCoords.row][currentHeadCoords.col]);
  };

  // This function mutates newSnakeCells.
  const growSnake = (newSnakeCells) => {
    const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
    if (isOutOfBounds(growthNodeCoords, board)) {
      // Snake is positioned such that it can't grow; don't do anything.
      return;
    }
    const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new LinkedListNode({
      row: growthNodeCoords.row,
      col: growthNodeCoords.col,
      cell: newTailCell,
    });
    const currentTail = snake.tail;
    snake.tail = newTail;
    snake.tail.next = currentTail;

    newSnakeCells.add(newTailCell);
  };

  // Handle reverse movement of snake
  const reverseSnake = () => {
    const tailNextNodeDirection = getNextNodeDirection(snake.tail, direction);
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirection(newDirection);
    // The tail of the snake is really the head of the linked list
    reverseLinkedList(snake.tail);
    const snakeHead = snake.head;
    snake.head = snake.tail;
    snake.tail = snakeHead;
  };

  //handle food consumption
  const handleFoodConsumption = (newSnakeCells) => {
    const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
    let nextFoodCell;

    while (true) {
      nextFoodCell = randomIntFromInterval(1, maxPossibleCellValue);
      if (newSnakeCells.has(nextFoodCell) || foodCell === nextFoodCell)
        continue;
      break;
    }

    const nextFoodShouldReverseDirection =
      Math.random() < PROBABILITY_OF_DIRECTION_REVERSAL_FOOD;

    setFoodCell(nextFoodCell);
    setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
    setScore(score + 1);
  };

  //handle Game Over
  const handleGameOver = () => {
    setIsRunning(false);
    if (highscore <= score) {
      setHighscore(score);
      localStorage.setItem("highscore", score);
    }
    setGameOver(true);
  };


  //reset the game
  const resetGame = () => {
    setScore(0);
    const snakeLLStartingValue = getStartingSnakeLLValue(board);
    setSnake(new LinkedList(snakeLLStartingValue));
    setFoodCell(snakeLLStartingValue.cell + 5);
    setSnakeCells(new Set([snakeLLStartingValue.cell]));
    setDirection(Direction.RIGHT);
    setGameOver(false);
  }


  return (
    <div class="flex flex-column items-center justify-center ">
    <div className="mb-3 text-white"><h4>SnakeGame-LinkedList</h4></div>
    <div class="flex flex-row items-center justify-center ">
    <h5 className="text-white px-5 bg-indigo-700 ">Score : {score}</h5>
    <h5 className="text-white px-5 bg-indigo-700"> HighScore : {highscore}</h5>
    </div>

    {gameOver && (    
<div class=" flex flex-column text-red-600 items-center justify-center" role="alert">
<p class="font-bold my-0">
    Game Over
</p>
<p>
    Press Space Key To Restart Game
</p>
</div>

    )}
    {(!isRunning && !gameOver)&&(
      <div class=" flex flex-column text-green-600 items-center justify-center" role="alert">
<p class="font-bold my-0">
    Start Game    
</p>
<p>
    Press Any Arrow Key To Start Game
</p>
</div>
    ) }
    {(isRunning && !gameOver)&&(
      <div class=" flex flex-column text-yellow-600 items-center justify-center" role="alert">
<p class="font-bold my-0">
    Note:
</p>
<p>
    Red food reverse snake direction
</p>
</div>
    ) }
    <div>
    {board.map((row, rowIdx) => (
    <div key={rowIdx} className="rowss">
      {row.map((cellValue, cellIdx) => {
        const className = getCellClassName(
          cellValue,
          foodCell,
          foodShouldReverseDirection,
          snakeCells
        );
        return <div key={cellIdx} className={className}></div>;
      })}
    </div>
  ))}

    </div>
    <div className="m-5 mobile">
    <span class="inline-grid grid-cols-3 gap-4">
  <span></span>
  <span><BsFillArrowUpSquareFill
  className="buttonss "
  onClick={() => handleKeydown(up)}
/></span>
  <span></span>
  <span><BsFillArrowLeftSquareFill
  className="buttonss "
  onClick={() => handleKeydown(left)}
/></span>
  <span>
  {gameOver && <BiSpaceBar
  className="buttonss buttonssx"
      onClick={() => resetGame()}
  />}
  </span>
  <span><BsFillArrowRightSquareFill
  className=" buttonss "
  onClick={() => handleKeydown(right)}
/></span>
  <span></span>
  <span><BsFillArrowDownSquareFill
  className="buttonss "
  onClick={() => handleKeydown(down)}
/></span>
  <span></span>
</span>
    </div>
    <div className="p-4
    inset-x-50
    bottom-0 text-indigo-700">Created By - Sumit</div>	
  </div>
  )

}

//Creation of board
const createBoard = (BOARD_SIZE) => {
  let counter = 1;
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      currentRow.push(counter++);
    }
    board.push(currentRow);
  }
  return board;
};

//Getting the next coordinates of in snake moving direction
const getCoordsInDirection = (coords, direction) => {
  if (direction === Direction.UP) {
    return {
      row: coords.row - 1,
      col: coords.col,
    };
  }
  if (direction === Direction.RIGHT) {
    return {
      row: coords.row,
      col: coords.col + 1,
    };
  }
  if (direction === Direction.DOWN) {
    return {
      row: coords.row + 1,
      col: coords.col,
    };
  }
  if (direction === Direction.LEFT) {
    return {
      row: coords.row,
      col: coords.col - 1,
    };
  }
};

//check if snake is moving outside the board
const isOutOfBounds = (coords, board) => {
  const { row, col } = coords;
  if (row < 0 || col < 0) return true;
  if (row >= board.length || col >= board[0].length) return true;
  return false;
};

//get directions from arrow keys
const getDirectionFromKey = (key) => {
  if (key === "ArrowUp") return Direction.UP;
  if (key === "ArrowRight") return Direction.RIGHT;
  if (key === "ArrowDown") return Direction.DOWN;
  if (key === "ArrowLeft") return Direction.LEFT;
  return "";
};

//get direction of each node of snake
const getNextNodeDirection = (node, currentDirection) => {
  if (node.next === null) return currentDirection;
  const { row: currentRow, col: currentCol } = node.value;
  const { row: nextRow, col: nextCol } = node.next.value;
  if (nextRow === currentRow && nextCol === currentCol + 1) {
    return Direction.RIGHT;
  }
  if (nextRow === currentRow && nextCol === currentCol - 1) {
    return Direction.LEFT;
  }
  if (nextCol === currentCol && nextRow === currentRow + 1) {
    return Direction.DOWN;
  }
  if (nextCol === currentCol && nextRow === currentRow - 1) {
    return Direction.UP;
  }
  return "";
};

//get coordinates of cell that is mutating in snake
const getGrowthNodeCoords = (snakeTail, currentDirection) => {
  const tailNextNodeDirection = getNextNodeDirection(
    snakeTail,
    currentDirection
  );
  const growthDirection = getOppositeDirection(tailNextNodeDirection);
  const currentTailCoords = {
    row: snakeTail.value.row,
    col: snakeTail.value.col,
  };
  const growthNodeCoords = getCoordsInDirection(
    currentTailCoords,
    growthDirection
  );
  return growthNodeCoords;
};

//get direction when snake reverse the diretion
const getOppositeDirection = (direction) => {
  if (direction === Direction.UP) return Direction.DOWN;
  if (direction === Direction.RIGHT) return Direction.LEFT;
  if (direction === Direction.DOWN) return Direction.UP;
  if (direction === Direction.LEFT) return Direction.RIGHT;
};

//get classname for food-cell,snake-cell,poison-food-cell
const getCellClassName = (
  cellValue,
  foodCell,
  foodShouldReverseDirection,
  snakeCells
) => {
  let className = "cellss";
  if (cellValue === foodCell) {
    if (foodShouldReverseDirection) {
      className = "cellss cell-purple";
    } else {
      className = "cellss cell-red";
    }
  }
  if (snakeCells.has(cellValue)) className = "cellss cell-green";

  return className;
};

export default Board;
