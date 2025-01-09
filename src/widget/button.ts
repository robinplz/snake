import { Container, Graphics, BlurFilter, Text } from "pixi.js";

type ButtonOptions = {
    title: string;
    x?: number; // default to 0
    y?: number; // default to 0
    width?: number; // default to 100
    height?: number; // default to 40
    onClick?: () => void;
};

export class Button {
  private title: string;
  private x: number;
    private y: number;
    private width: number;
    private height: number;
    private onClick: () => void;

    private container: Container;

  constructor(options: ButtonOptions) {
    this.title = options.title;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 100;
    this.height = options.height || 40;
    this.onClick = options.onClick || (() => {});

    this.container = new Container();
    this.container.position.set(this.x, this.y);
    
    // shadow shape
    const kShadowOffsetX = 0;
    const kShadowOffsetY = 4;
    const kShadowColor = 0x000000;
    const kShadowAlpha = 0.4;
    const kShadowBlur = 8;
    const shadow = new Graphics();
    shadow.position.set(kShadowOffsetX, kShadowOffsetY);
    shadow.roundRect(0, 0, this.width, this.height, this.height / 2);
    shadow.fill({color: kShadowColor, alpha: kShadowAlpha});
    shadow.filters = new BlurFilter({strength: kShadowBlur});
    this.container.addChild(shadow);

    // solid shape
    const kButtonBGColor = 0x02A25D;
    const solid = new Graphics();
    solid.roundRect(0, 0, this.width, this.height, this.height / 2);
    solid.fill(kButtonBGColor);
    solid.interactive = true;
    solid.on('mouseup', this.onClick);

    // text
    const kFontSize = 18;
    const kFontWeight = '500';
    const kTextColor = 'white';
    const text = new Text({text: this.title, style: {fontSize: kFontSize, fontWeight: kFontWeight, fill: kTextColor}});
    text.position.set(this.width / 2 - text.width / 2, this.height / 2 - text.height / 2);
    solid.addChild(text);

    this.container.addChild(solid);
  }

  addTo(parent: Container) {
    parent.addChild(this.container);
  }

  set visible(value: boolean) {
    this.container.visible = value;
  }
  get visible() {
    return this.container.visible;
  }
}