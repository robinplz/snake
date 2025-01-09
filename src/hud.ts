import { Application, Container, Text, Graphics } from "pixi.js";
import { GameStates } from "./game_states";
import { Button } from "./widget/button";
import { centerOf } from "./util";

export class HUD {
  private container: Container;
  private scoreText: Text;
  private timeText: Text;
  private startButton: Button;

  constructor(app: Application) {
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

    // start button (center)
    const center = centerOf(app);
    const kButtonWidth = 120;
    const kButtonHeight = 40;

    this.startButton = new Button({
      title: "Start",
      x: center.x - kButtonWidth / 2,
      y: center.y - kButtonHeight / 2 + 40,
      width: kButtonWidth,
      height: kButtonHeight,
      onClick: this.handleStartButtonClicked.bind(this),
    });
    this.startButton.addTo(this.container);

    GameStates.instance.onChanged.push(this.handleGameStatesChanged.bind(this));
    this.updateWidgets(GameStates.instance);
  }

  private handleGameStatesChanged(property: String) {
    this.updateWidgets(GameStates.instance);
  }

  private updateWidgets(gameStates: GameStates) {
    this.scoreText.text = `Score: ${gameStates.score}`;
    this.timeText.text = `Time: ${gameStates.timeString}`;
    this.startButton.visible = !gameStates.running;
  }

  private handleStartButtonClicked() {
    GameStates.instance.running = true;
  }
}