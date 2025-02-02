import { Application, Container, Text, Graphics, BlurFilter, Sprite, Assets } from "pixi.js";
import { GameStates } from "./game_states";
import { centerOf } from "./util";
import { Board } from "./board";
import { Inputs } from "./inputs";

export class HUD {
  private container: Container;
  private scoreText: Text;
  private timeText: Text;
  private board: Container;
  private boardCover: Graphics;
  private bestScoreText: Text;
  private startLabel: Text;
  private buttonsContainer: Container;

  constructor(app: Application, board: Container) {
    this.board = board;

    this.container = new Container();
    app.stage.addChild(this.container);

    const kTextColor = 'rgba(0, 0, 0, 0.87)';
    const kHeaderTextStyle = {fontSize: 15, fill: kTextColor};
    const kHeaderTextHMargin = 16;
    const kHeaderTextVMargin = 8;

    // score text (top left)
    this.scoreText = new Text({text: "Score: 0", style: kHeaderTextStyle});
    this.scoreText.position.set(kHeaderTextHMargin, kHeaderTextVMargin);
    this.container.addChild(this.scoreText);

    // time text (top right)
    this.timeText = new Text({text: "Time: 00:00", style: kHeaderTextStyle});
    this.timeText.position.set(app.screen.width - this.timeText.width - kHeaderTextHMargin, kHeaderTextVMargin);
    this.container.addChild(this.timeText);

    // board cover
    this.boardCover = new Graphics();
    this.boardCover.rect(0, 0, Board.boardSize, Board.boardSize);
    this.boardCover.fill({color: 'white', alpha: 0.6});
    this.board.addChild(this.boardCover);

    // start label
    const kStartLabelStyle = {fontSize: 20, fill: kTextColor};
    this.startLabel = new Text({text: "Press SPACE / Tap here to Start...", style: kStartLabelStyle});
    const containerCenter = centerOf(app);
    const startLabelCenter = { x: this.startLabel.width / 2, y: this.startLabel.height / 2 };
    this.startLabel.position.set(containerCenter.x - startLabelCenter.x, containerCenter.y - startLabelCenter.y);
    this.container.addChild(this.startLabel);

    // best score text (above start label)
    const kBestScoreTextStyle = {fontSize: 17, fill: kTextColor};
    this.bestScoreText = new Text({text: "Best Score: 0", style: kBestScoreTextStyle});
    const bestScoreLabelCenter = { x: this.bestScoreText.width / 2, y: this.bestScoreText.height / 2 };
    this.bestScoreText.position.set(containerCenter.x - bestScoreLabelCenter.x, containerCenter.y - bestScoreLabelCenter.y - 32);
    this.container.addChild(this.bestScoreText);

    // control buttons
    const kButtonHMargin = 15;
    this.buttonsContainer = new Container();
    this.buttonsContainer.position.set(containerCenter.x - Board.boardSize / 2, containerCenter.y + Board.boardSize / 2 + 16);
    this.container.addChild(this.buttonsContainer);
    const leftButton = Sprite.from("arrow-normal");
    leftButton.position.set(kButtonHMargin, 0);
    leftButton.interactive = true;
    leftButton.on("click", () => {
      Inputs.instance.turnLeft();
    });
    leftButton.on("pointerdown", () => this.handleButtonPointerDown(leftButton));
    leftButton.on("pointerup", () => this.handleButtonPointerUp(leftButton));
    this.buttonsContainer.addChild(leftButton);

    const rightButton = Sprite.from("arrow-normal");
    rightButton.scale.x = -1;
    rightButton.position.set(Board.boardSize - kButtonHMargin, 0);
    rightButton.interactive = true;
    rightButton.on("click", () => {
      Inputs.instance.turnRight();
    });
    rightButton.on("pointerdown", () => this.handleButtonPointerDown(rightButton));
    rightButton.on("pointerup", () => this.handleButtonPointerUp(rightButton));
    this.buttonsContainer.addChild(rightButton);

    GameStates.instance.onChanged.push(this.handleGameStatesChanged.bind(this));
    this.updateWidgets(GameStates.instance);

    // listen to space key
    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.start();
      }
    });

    // listen to click event
    this.boardCover.interactive = true;
    this.boardCover.on("click", () => {
      this.start();
    });
  }

  private handleGameStatesChanged() {
    this.updateWidgets(GameStates.instance);
  }

  private handleButtonPointerDown(button: Sprite) {
    button.texture = Assets.get("arrow-pressed");
  }

  private handleButtonPointerUp(button: Sprite) {
    button.texture = Assets.get("arrow-normal");
  }

  private updateWidgets(gameStates: GameStates) {
    this.scoreText.text = `Score: ${gameStates.score}`;
    this.timeText.text = `Time: ${gameStates.timeString}`;
    this.bestScoreText.text = `Best Score: ${gameStates.bestScore}`;
    
    if (gameStates.running) {
      // hide board cover, remove blur, and hide start label
      // show control buttons
      this.boardCover.visible = false;
      this.board.filters = [];
      this.startLabel.visible = false;
      this.bestScoreText.visible = false;
      this.buttonsContainer.visible = true;
    }
    else {
      // display board cover, blur board out, and show start label
      // hide control buttons
      this.boardCover.visible = true;
      this.board.filters = new BlurFilter({strength: 16, quality: 8});
      this.startLabel.visible = true;
      this.bestScoreText.visible = true;
      this.buttonsContainer.visible = false;
    }
  }

  private start() {
    GameStates.instance.running = true;
  }
}