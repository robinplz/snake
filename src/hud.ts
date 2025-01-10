import { Application, Container, Text, Graphics, BlurFilter } from "pixi.js";
import { GameStates } from "./game_states";
import { centerOf } from "./util";
import { Board } from "./board";

export class HUD {
  private container: Container;
  private scoreText: Text;
  private timeText: Text;
  private board: Container;
  private boardCover: Graphics;
  private startLabel: Text;

  constructor(app: Application, board: Container) {
    this.board = board;

    this.container = new Container();
    app.stage.addChild(this.container);

    // score text (top left)
    this.scoreText = new Text({text: "Score: 0", style: {fontSize: 24}});
    this.scoreText.position.set(10, 10);
    this.container.addChild(this.scoreText);

    // time text (top right)
    this.timeText = new Text({text: "Time: 00:00", style: {fontSize: 24}});
    this.timeText.position.set(app.screen.width - this.timeText.width - 10, 10);
    this.container.addChild(this.timeText);

    // board cover
    this.boardCover = new Graphics();
    this.boardCover.rect(0, 0, Board.boardSize, Board.boardSize);
    this.boardCover.fill({color: 'white', alpha: 0.6});
    this.board.addChild(this.boardCover);

    // start label
    this.startLabel = new Text({text: "Press SPACE to Start...", style: {fontSize: 20}});
    const screenCenter = centerOf(app);
    const labelCenter = { x: this.startLabel.width / 2, y: this.startLabel.height / 2 };
    this.startLabel.position.set(screenCenter.x - labelCenter.x, screenCenter.y - labelCenter.y);
    this.container.addChild(this.startLabel);

    GameStates.instance.onChanged.push(this.handleGameStatesChanged.bind(this));
    this.updateWidgets(GameStates.instance);

    // listen to space key
    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.start();
      }
    });
  }

  private handleGameStatesChanged(property: String) {
    this.updateWidgets(GameStates.instance);
  }

  private updateWidgets(gameStates: GameStates) {
    this.scoreText.text = `Score: ${gameStates.score}`;
    this.timeText.text = `Time: ${gameStates.timeString}`;
    
    if (gameStates.running) {
      // hide board cover, remove blur, and hide start label
      this.boardCover.visible = false;
      this.board.filters = [];
      this.startLabel.visible = false;
    }
    else {
      // display board cover, blur board out, and show start label
      this.boardCover.visible = true;
      this.board.filters = new BlurFilter({strength: 12});
      this.startLabel.visible = true;
    }
  }

  private start() {
    GameStates.instance.running = true;
  }
}