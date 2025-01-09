import { Container, Graphics } from 'pixi.js';
import { Board } from './board';
import { GameStates } from './game_states';

type CellIndex = {x: number, y: number};

class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static up = new Vector(0, -1);
  static down = new Vector(0, 1);
  static left = new Vector(-1, 0);
  static right = new Vector(1, 0);
}

export class Body {
  private container: Container;
  private snakeContainer: Container;
  private fruitContainer: Container;
  private body: CellIndex[] = [];
  private fruit?: CellIndex;
  private action: number = 0; // 0: no action, 1: turn left, 2: turn right
  private direction: Vector = Vector.up;
  private boardSize: number;

  constructor(parent: Container, boardSize: number) {
    this.container = new Container();
    parent.addChild(this.container);
    this.snakeContainer = new Container();
    this.container.addChild(this.snakeContainer);
    this.fruitContainer = new Container();
    this.container.addChild(this.fruitContainer);

    this.boardSize = boardSize;

    // keyboard input
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));

    this.reset();
  }

  update(): boolean {
    if (!this.move()) return false;

    this.redraw();
    return true;
  }

  reset() {
    const gridSize = Board.gridSize;
    this.body = [];
    this.body.push({x: gridSize / 2, y: gridSize - 4});
    this.body.push({x: gridSize / 2, y: gridSize - 3});
    this.body.push({x: gridSize / 2, y: gridSize - 2});
    this.body.push({x: gridSize / 2, y: gridSize - 1});

    this.spawnFruit();

    this.direction = Vector.up;
    this.action = 0;
  }

  private spawnFruit() {
    const forbiddenCells: CellIndex[] = [];
    forbiddenCells.push(...this.body); // avoid spawning fruit on the snake
    if (this.fruit) forbiddenCells.push(this.fruit); // avoid spawning fruit on the same cell

    const gridSize = Board.gridSize;
    let found = false;
    while(!found) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      this.fruit = {x, y};
      found = forbiddenCells.every((index: CellIndex) => index.x !== x || index.y !== y);
    }
  }

  private move(): boolean {
    this.direction = this.nextDirection();
    this.action = 0;

    const newBody: CellIndex[] = [];
    const newHead: CellIndex = {x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y};
    newBody.push(newHead);

    // check if the new head is on the fruit
    if (this.fruit && newHead.x === this.fruit.x && newHead.y === this.fruit.y) {
      newBody.push(...this.body);

      this.spawnFruit();

      // score +1
      GameStates.instance.score += 1;
    } else {
      for (let i = 1; i < this.body.length; i++) {
        newBody.push({x: this.body[i-1].x, y: this.body[i-1].y});
      }
    }

    this.body = newBody;

    return this.checkCollision();
  }

  private checkCollision(): boolean {
    const gridSize = Board.gridSize;
    const head = this.body[0];
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return false;
    }
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        return false;
      }
    }
    return true;
  }

  private nextDirection(): Vector {
    if (this.action === 1) {
      switch (this.direction) {
      case Vector.up: return Vector.left;
      case Vector.down: return Vector.right;
      case Vector.left: return Vector.down;
      case Vector.right: return Vector.up;
      }
    } else if (this.action === 2) {
      switch (this.direction) {
      case Vector.up: return Vector.right;
      case Vector.down: return Vector.left;
      case Vector.left: return Vector.up;
      case Vector.right: return Vector.down;
      }
    }
    return this.direction;
  }

  private handleKeyUp(event: KeyboardEvent) {
    console.log("key Up:", event.key);
    switch (event.key) {
    case "ArrowLeft":
      this.action = 1;
      break;
    case "ArrowRight":
      this.action = 2;
      break;
    }
  }

  private redraw() {
    // draw snake
    this.snakeContainer.removeChildren();

    const gridSize = Board.gridSize;
    const cellSize = this.boardSize / gridSize;
    const cellFillSize = cellSize - 4;

    const kSnakeCellColor = "#20A040";

    this.body.forEach((index: CellIndex) => {
      const cell = new Graphics({width: cellFillSize, height: cellFillSize});
      cell.position.set(index.x * cellSize + 2, index.y * cellSize + 2);
      cell.roundRect(0, 0, cellFillSize, cellFillSize, 2);
      cell.fill(kSnakeCellColor);
      this.snakeContainer.addChild(cell);
    });

    // draw fruit
    const kFruitCellColor = "#206040";
    this.fruitContainer.removeChildren();
    if (this.fruit) {
      const cell = new Graphics({width: cellFillSize, height: cellFillSize});
      cell.position.set(this.fruit.x * cellSize + 2, this.fruit.y * cellSize + 2);
      cell.roundRect(0, 0, cellFillSize, cellFillSize, 2);
      cell.fill(kFruitCellColor);
      this.fruitContainer.addChild(cell);
    }
  }
}