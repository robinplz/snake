import { formatTime } from "./util";

export class GameStates {
  private running_ = false;
  private bestScore_ = 0;
  private score_ = 0;
  private timeMS = 0;
  private timeString_ = '00:00';

  get running() {
    return this.running_;
  }
  set running(value) {
    if (value != this.running_) {
      this.running_ = value;
      this.onChanged.forEach(f => f('running'));
    }
  }

  get score() {
    return this.score_;
  }
  set score(value) {
    if (value != this.score_) {
      this.score_ = value;
      if (this.bestScore_ < value) {
        this.bestScore_ = value;
      }
      this.onChanged.forEach(f => f('score'));
    }
  }

  get bestScore() {
    return this.bestScore_;
  }

  get timeString() {
    return this.timeString_;
  }

  get time() {
    return this.timeMS;
  }
  set time(value: number) {
    this.timeMS = value;
    const valueString = formatTime(value);
    if (valueString != this.timeString_) {
      this.timeString_ = valueString;
      this.onChanged.forEach(f => f('timeString'));
    }
  }

  static instance = new GameStates();
  onChanged: ((property: String) => void)[] = [];
}