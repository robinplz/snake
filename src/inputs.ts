export class Inputs {
  private action: number = 0; // 0: no action, 1: turn left, 2: turn right

  public getAction(): number {
    return this.action;
  }

  public reset() {
    this.action = 0;
  }

  public turnLeft() {
    this.action = 1;
  }

  public turnRight() {
    this.action = 2;
  }
    
  static instance = new Inputs();
}