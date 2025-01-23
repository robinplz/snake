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
  private bestScoreText: Text;
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
    const containerCenter = centerOf(app);
    const startLabelCenter = { x: this.startLabel.width / 2, y: this.startLabel.height / 2 };
    this.startLabel.position.set(containerCenter.x - startLabelCenter.x, containerCenter.y - startLabelCenter.y);
    this.container.addChild(this.startLabel);

    // best score text (above start label)
    this.bestScoreText = new Text({text: "Best Score: 0", style: {fontSize: 20}});
    const bestScoreLabelCenter = { x: this.bestScoreText.width / 2, y: this.bestScoreText.height / 2 };
    this.bestScoreText.position.set(containerCenter.x - bestScoreLabelCenter.x, containerCenter.y - bestScoreLabelCenter.y - 32);
    this.container.addChild(this.bestScoreText);

    GameStates.instance.onChanged.push(this.handleGameStatesChanged.bind(this));
    this.updateWidgets(GameStates.instance);

    // listen to space key
    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.start();
      }
    });
  }

  private handleGameStatesChanged() {
    this.updateWidgets(GameStates.instance);
  }

  private updateWidgets(gameStates: GameStates) {
    this.scoreText.text = `Score: ${gameStates.score}`;
    this.timeText.text = `Time: ${gameStates.timeString}`;
    this.bestScoreText.text = `Best Score: ${gameStates.bestScore}`;
    
    if (gameStates.running) {
      // hide board cover, remove blur, and hide start label
      this.boardCover.visible = false;
      this.board.filters = [];
      this.startLabel.visible = false;
      this.bestScoreText.visible = false;
    }
    else {
      // display board cover, blur board out, and show start label
      this.boardCover.visible = true;
      this.board.filters = new BlurFilter({strength: 16, quality: 8});
      this.startLabel.visible = true;
      this.bestScoreText.visible = true;
    }
  }

  private start() {
    GameStates.instance.running = true;
  }
}