import { Container, Graphics, Text } from 'pixi.js';
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
  private goldenFruitContainer: Container;
  private body: CellIndex[] = [];
  private fruit?: CellIndex;
  private goldenFruit?: CellIndex;
  private action: number = 0; // 0: no action, 1: turn left, 2: turn right
  private direction: Vector = Vector.up;
  private boardSize: number;
  private fruitConsumed: number = 0;
  private goldenFruitConsumed: number = 0;
  private goldenFruitLife?: number;

  constructor(parent: Container, boardSize: number) {
    this.container = new Container();
    parent.addChild(this.container);
    this.snakeContainer = new Container();
    this.container.addChild(this.snakeContainer);
    this.fruitContainer = new Container();
    this.container.addChild(this.fruitContainer);
    this.goldenFruitContainer = new Container();
    this.container.addChild(this.goldenFruitContainer);

    this.boardSize = boardSize;

    // keyboard input
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));

    this.reset();
  }

  update(): boolean {
    this.growGoldenFruit();

    if (!this.move()) return false;

    this.redraw();
    return true;
  }

  reset() {
    this.fruitConsumed = 0;
    this.goldenFruitConsumed = 0;
    this.retireFruit();
    this.retireGoldenFruit();

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
    if (this.fruit) return; // already spawned

    const forbiddenCells: CellIndex[] = [];
    forbiddenCells.push(...this.body); // avoid spawning fruit on the snake
    if (this.goldenFruit) forbiddenCells.push(this.goldenFruit); // avoid spawning on golden fruit cell

    const gridSize = Board.gridSize;
    let found = false;
    while(!found) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      this.fruit = {x, y};
      found = forbiddenCells.every((index: CellIndex) => index.x !== x || index.y !== y);
    }

    this.spawnGoldenFruit();
  }

  private spawnGoldenFruit() {
    if (this.goldenFruit) return; // already spawned

    // golden fruit spawns on every 5th fruit consumed
    const kGoldenFruitSpawnRate = 5;
    if (this.fruitConsumed > 0 && this.fruitConsumed % kGoldenFruitSpawnRate === 0) {
      const forbiddenCells: CellIndex[] = [];
      forbiddenCells.push(...this.body); // avoid spawning fruit on the snake
      if (this.fruit) forbiddenCells.push(this.fruit); // avoid spawning on fruit cell

      const gridSize = Board.gridSize;
      let found = false;
      while(!found) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        this.goldenFruit = {x, y};
        found = forbiddenCells.every((index: CellIndex) => index.x !== x || index.y !== y);
      }
      this.goldenFruitLife = 20;
    }
  }

  private growGoldenFruit() {
    if (this.goldenFruitLife) {
      this.goldenFruitLife -= 1;
      if (this.goldenFruitLife <= 0) {
        this.retireGoldenFruit();
      }
    }
  }

  private consumeFruit() {
    this.fruitConsumed += 1;
    this.retireFruit();
    this.spawnFruit();

    // score +1
    GameStates.instance.score += 1;
  }

  private consumeGoldenFruit() {
    this.goldenFruitConsumed += 1;
    this.retireGoldenFruit();

    // score +10
    GameStates.instance.score += 10;
  }

  private retireFruit() {
    this.fruit = undefined;
    this.fruitContainer.removeChildren();
  }

  private retireGoldenFruit() {
    this.goldenFruit = undefined;
    this.goldenFruitLife = undefined;
    this.goldenFruitContainer.removeChildren();
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
      this.consumeFruit();
    }
    else if (this.goldenFruit && newHead.x === this.goldenFruit.x && newHead.y === this.goldenFruit.y) {
      newBody.push(...this.body);
      this.consumeGoldenFruit();
    }
    else {
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
    if (this.fruit && this.fruitContainer.children.length === 0) {
      const cell = new Graphics({width: cellFillSize, height: cellFillSize});
      cell.position.set(this.fruit.x * cellSize + 2, this.fruit.y * cellSize + 2);
      cell.roundRect(0, 0, cellFillSize, cellFillSize, 2);
      cell.fill(kFruitCellColor);
      this.fruitContainer.addChild(cell);
    }

    // draw golden fruit
    const kGoldenFruitCellColor = "#EEC800";
    if (this.goldenFruit) {
      if (this.goldenFruitContainer.children.length === 0) {
        // create the golden fruit cell
        const cell = new Graphics({width: cellFillSize, height: cellFillSize});
        const cellOrigin = {x: this.goldenFruit.x * cellSize + 2, y: this.goldenFruit.y * cellSize + 2};
        cell.position.set(cellOrigin.x, cellOrigin.y);
        cell.roundRect(0, 0, cellFillSize, cellFillSize, 2);
        cell.fill(kGoldenFruitCellColor);
        this.goldenFruitContainer.addChild(cell);
        
        // create the life label
        const lifeText = new Text({text: `${this.goldenFruitLife}`, style: {fontSize: 11, fill: 'white'}});
        lifeText.position.set(cellOrigin.x + 1, cellOrigin.y);
        this.goldenFruitContainer.addChild(lifeText);
      }

      // update the life label
      const lifeText = this.goldenFruitContainer.children[1] as Text;
      lifeText.text = `${this.goldenFruitLife}`;
    }
  }
}