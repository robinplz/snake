import { Application, Ticker, Assets } from "pixi.js";
import { Board } from "./board";
import { Body } from "./body";
import { HUD } from "./hud";
import { GameStates } from "./game_states";
import { Inputs } from "./inputs";
import { centerOf } from "./util";

// update version number
const versionElement = document.getElementById('version');
if (versionElement) {
  versionElement.textContent = __APP_VERSION__;
}

// pixi app code
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

  // Load assets
  await loadAssets();

  // append board to stage
  const center = centerOf(app);
  const board = new Board(center);
  app.stage.addChild(board.container);

  // append body to stage
  const body = new Body(board.container, Board.boardSize);

  // HUD
  new HUD(app, board.container);

  // observe game states and reset game states when game starts running
  GameStates.instance.onChanged.push((property: String) => {
    if (property === "running" && GameStates.instance.running) {
      GameStates.instance.time = 0;
      GameStates.instance.score = 0;
      body.reset();
      Inputs.instance.reset();
    }
  });

  // listen to keyboard input
  window.addEventListener("keyup", handleKeyUp);

  // link to ticker
  app.ticker.add((ticker: Ticker) => {
    if (!GameStates.instance.running) return;

    updateBody(body, ticker);
    updateTimeText(ticker);
  });
}

function handleKeyUp(event: KeyboardEvent) {
  console.log("key Up:", event.key);
  switch (event.key) {
  case "ArrowLeft":
    Inputs.instance.turnLeft();
    break;
  case "ArrowRight":
    Inputs.instance.turnRight();
    break;
  }
}

const kBodyUpdateInterval = 10.0;
const speedFactor = 0.75;
let elapsed = kBodyUpdateInterval;
function updateBody(body: Body, ticker: Ticker) {
  elapsed += ticker.deltaTime;
  
  // update game state at 1 FPS
  const interval = kBodyUpdateInterval / speedFactor;
  if (elapsed > interval) {
    GameStates.instance.running = body.update(Inputs.instance.getAction());
    Inputs.instance.reset();
    elapsed = 0;
  }
}

function updateTimeText(ticker: Ticker) {
  GameStates.instance.time += ticker.deltaMS;
}

async function loadAssets() {
  const resources = [
    {alias: "arrow-normal", src: "assets/arrow-normal.png"},
    {alias: "arrow-pressed", src: "assets/arrow-pressed.png"},
  ];
  await Assets.load(resources);
}