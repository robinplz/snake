import { Application, Point, Ticker } from "pixi.js";
import { Board } from "./board";
import { Body } from "./body";
import { HUD } from "./hud";
import { GameStates } from "./game_states";
import { centerOf } from "./util";

(async () => {
  const app = new Application();
  await initialize(app);
})();

async function initialize(app: Application) {
  // Initialize the application
  const htmlContainerElement = document.getElementById("pixi-container")!;
  await app.init({ 
    background: "#E9E9E9", 
    resizeTo: htmlContainerElement,
    antialias: true,
    resolution: window.devicePixelRatio || 1, 
    autoDensity: true,
  });

  // Append the application canvas to target element
  htmlContainerElement.appendChild(app.canvas);

  console.log("canvas size:", app.canvas.width, app.canvas.height);

  // append board to stage
  const center = centerOf(app);
  const board = new Board(center);
  app.stage.addChild(board.container);

  // append body to stage
  const body = new Body(board.container, Board.boardSize);

  // HUD
  new HUD(app);

  // observe game states
  GameStates.instance.onChanged.push((property: String) => {
    if (property === "running" && GameStates.instance.running) {
      GameStates.instance.time = 0;
      GameStates.instance.score = 0;
      body.reset();
    }
  });

  // link to ticker

  app.ticker.add((ticker: Ticker) => {
    if (!GameStates.instance.running) return;

    updateBody(body, ticker);
    updateTimeText(ticker);
  });
}

const kBodyUpdateInterval = 10.0;
let elapsed = kBodyUpdateInterval;
function updateBody(body: Body, ticker: Ticker) {
  elapsed += ticker.deltaTime;
  
  // update game state at 1 FPS
  if (elapsed > kBodyUpdateInterval) {
    GameStates.instance.running = body.update();
    elapsed = 0;
  }
}

function updateTimeText(ticker: Ticker) {
  GameStates.instance.time += ticker.deltaMS;
}