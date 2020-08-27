class LightSource {
  constructor(d, a) {
    this.d = d;
    this.a = a;
  }

  show() {
    let x = cos(this.a) * this.d;
    let y = sin(this.a) * this.d;

    push();
    translate(width / 2, height / 2);

    stroke(lightSourceRayColor);
    strokeWeight(5);
    line(x, y, 0, 0);

    fill(0);
    noStroke();
    circle(x, y, 10);
    circle(0, 0, 10);

    pop();
  }
}