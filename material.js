class Material {
  /**
   * 
   * @param {number} n The refractive index of the material
   * @param {p5.Color} c The color of the material
   */
  constructor(n, color) {
    this.n = n;
    this.color = color;
  }

  show(x, y) {
    fill(this.color);
    noStroke();
    rect(x, y, width, height / 2);
  }
}