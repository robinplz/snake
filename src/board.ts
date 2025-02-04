import { Container, Graphics, Point } from 'pixi.js';

export class Board {
  // data members
  static readonly gridSize = 16;
  static readonly boardSize = 16*24;
  container: Container;

  constructor(center: Point) {
    console.log("constructing Board:", center);

    const g = new Graphics({width: Board.boardSize, height: Board.boardSize});
    g.position.set(center.x - Board.boardSize / 2, center.y - Board.boardSize / 2);

    const gridColor = "#B0B0B0";
    
    // boundary lines
    g.roundRect(0, 0, Board.boardSize, Board.boardSize, 2);
    g.fill("#e0e8f0");
    g.stroke(gridColor);

    // 16*16 grid
    const cellSize = Board.boardSize / Board.gridSize;

    // grid lines
    for (let i = 1; i < Board.gridSize; i++) {
      g.moveTo(i * cellSize, 0);
      g.lineTo(i * cellSize, Board.boardSize);
    }
    for (let i = 1; i < Board.gridSize; i++) {
      g.moveTo(0, i * cellSize);
      g.lineTo(Board.boardSize, i * cellSize);
    }
    g.stroke(gridColor);

    this.container = g;
  }
}