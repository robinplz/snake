import { Application, Point } from "pixi.js";

export function centerOf(app: Application): Point {
  const canvasWidth = app.canvas.width / window.devicePixelRatio;
  const canvasHeight = app.canvas.height / window.devicePixelRatio;
  return new Point(canvasWidth / 2, canvasHeight / 2);
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
  }
  else {
    return `${pad(minutes)}:${pad(seconds % 60)}`;
  }
}