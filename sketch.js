let mat1, mat2;
let lightSource;

let criticalAngle, isTotallyInternallyReflecting;
let angleOfIncidence;
let angleOfRefraction;
let angleToDraw;

let reflectionAngleColor, incidenceAngleColor, refractionAngleColor;
let lightSourceRayColor, refractedRayColor, reflectedRayColor;

let mat1Select, mat2Select;
let mat1ColorPicker, mat2ColorPicker;
let mat1Index, mat2Index;
const materials = ["Air", "Glass", "Water", "Diamond", "Custom"];

quadrants = Object.freeze({
  topRight: 1,
  topLeft: 2,
  bottomRight: 3,
  bottomLeft: 4
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  reflectionAngleColor = color("#11c6ae");
  incidenceAngleColor = color(0);
  refractionAngleColor = color(200);

  lightSourceRayColor = color(255, 0, 0);
  refractedRayColor = color(255, 100, 150);
  reflectedRayColor = color(0, 0, 255);

  mat1 = new Material(1, color(250));
  mat2 = new Material(1.52, color(61, 146, 216));
  // mat1 = new Material(1.52, color(61, 146, 216));
  // mat2 = new Material(1, color(250));

  lightSource = new LightSource(min(height / 2, width / 2) - 20, -160);

  // UI
  mat1Select = createSelect();
  mat2Select = createSelect();

  mat1Select.position(10, 10);
  mat2Select.position(10, height / 2 + 10);

  materials.forEach((material) => {
    mat1Select.option(material);
    mat2Select.option(material);
  });

  mat1Select.selected("Air");
  mat2Select.selected("Glass");

  mat1ColorPicker = createColorPicker(mat1.color);
  mat2ColorPicker = createColorPicker(mat2.color);
  mat1ColorPicker.position(10, 30);
  mat2ColorPicker.position(10, height / 2 + 30);
  mat1ColorPicker.hide();
  mat2ColorPicker.hide();

  mat1Index = createInput(`${mat1.n}`);
  mat2Index = createInput(`${mat2.n}`);
  mat1Index.size(40);
  mat2Index.size(40);
  mat1Index.position(10, 60);
  mat2Index.position(10, height / 2 + 60);
  mat1Index.hide();
  mat2Index.hide();
}

function draw() {
  background(0);
  textSize(15);

  // Materials
  mat1.show(0, 0);
  mat2.show(0, height / 2);

  // Center line
  strokeWeight(4);
  stroke(0);
  line(0, height / 2, width, height / 2);

  // Calculate critical angle
  if (mat1.n > mat2.n) {
    // Travelling from more optically dense to less optically dense
    // n1 * sin(C) = n2 * sin(90)
    // sin(C) = n2 / n1
    // C = asin(n2 / n1)
    criticalAngle = asin(mat2.n / mat1.n);
  } else if (mat2.n > mat1.n) {
    criticalAngle = asin(mat1.n / mat2.n);
  } else {
    // Two materials are identical
    criticalAngle = -Infinity;
  }


  // Light source
  lightSource.show();

  // Refracted / reflected ray
  push();
  translate(width / 2, height / 2);

  let r = max(width, height);
  let x = cos(angleToDraw) * r;
  let y = sin(angleToDraw) * r;

  let arrowR = min(width, height) / 4;
  let arrowX = cos(angleToDraw) * arrowR;
  let arrowY = sin(angleToDraw) * arrowR;

  if (isTotallyInternallyReflecting) {
    stroke(reflectedRayColor);
    fill(reflectedRayColor);
  } else {
    stroke(refractedRayColor);
    fill(refractedRayColor);
  }
  strokeWeight(5);
  line(x, y, 0, 0);

  push();
  translate(arrowX, arrowY);
  rotate(angleToDraw + 90);
  noStroke();
  triangle(0, -10, -10, 10, 10, 10);
  pop();

  // Center circle
  fill(0);
  noStroke();
  circle(0, 0, 10);

  pop();

  // Incident ray + angle markings
  strokeWeight(3);
  noFill();

  switch (getQuadrant()) {
    case quadrants.topRight:
      angleOfIncidence = 90 + lightSource.a;
      if (mat1.n > mat2.n && angleOfIncidence >= criticalAngle) {
        // TOTAL INTERNAL REFLECTION

        // Technically angleOfReflection, but that's too much trouble
        isTotallyInternallyReflecting = true;
        angleOfRefraction = angleOfIncidence;
        angleToDraw = -90 - angleOfRefraction;

        // Angle markings
        stroke(reflectionAngleColor);
        arc(width / 2, height / 2, 50, 50, angleToDraw, -90); // Reflection
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, -90, lightSource.a); // Incident

        // Angle text
        textIncidentAngle = lightSource.a - angleOfIncidence / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = -90 - angleOfRefraction / 2;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(LEFT, BOTTOM);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(RIGHT, BOTTOM);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      } else {
        // REFRACTION 

        // n1 * sin(a1) = n2 * sin(a2)
        // sin(a2) = (n1 * sin(a1)) / n2
        // a2 = asin((n1 * sin(a1)) / n2)
        isTotallyInternallyReflecting = false;
        angleOfRefraction = asin((mat1.n * sin(angleOfIncidence)) / mat2.n);
        angleToDraw = 90 + angleOfRefraction;

        // Angle markings
        stroke(refractionAngleColor);
        arc(width / 2, height / 2, 50, 50, 90, angleToDraw); // Refraction
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, -90, lightSource.a); // Incident

        // Angle text
        textIncidentAngle = lightSource.a - (90 + lightSource.a) / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = angleOfRefraction / 2 + 90;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(LEFT, BOTTOM);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(RIGHT, TOP);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      }
      break;

    case quadrants.topLeft:
      angleOfIncidence = -lightSource.a - 90;
      if (mat1.n > mat2.n && angleOfIncidence >= criticalAngle) {
        // TOTALLY INTERNALLY REFLECTION
        isTotallyInternallyReflecting = true;
        angleOfRefraction = angleOfIncidence;
        angleToDraw = -90 + angleOfRefraction;

        // Angle markings
        stroke(reflectionAngleColor);
        arc(width / 2, height / 2, 50, 50, -90, angleToDraw); // Refraction
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, lightSource.a, -90); // Incident

        // Angle text
        textIncidentAngle = lightSource.a + angleOfIncidence / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = -90 + angleOfRefraction / 2;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(RIGHT, BOTTOM);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(LEFT, BOTTOM);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      } else {
        // REFRACTION
        isTotallyInternallyReflecting = false;
        angleOfRefraction = asin((mat1.n * sin(angleOfIncidence)) / mat2.n);
        angleToDraw = 90 - angleOfRefraction;

        // Angle markings
        stroke(refractionAngleColor);
        arc(width / 2, height / 2, 50, 50, angleToDraw, 90); // Refraction
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, lightSource.a, -90); // Incident

        // Angle text
        textIncidentAngle = lightSource.a - (90 + lightSource.a) / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = 90 - angleOfRefraction / 2;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(RIGHT, BOTTOM);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(LEFT, TOP);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      }
      break;

    case quadrants.bottomLeft:
      angleOfIncidence = lightSource.a - 90;
      if (mat2.n > mat1.n && angleOfIncidence >= criticalAngle) {
        // TOTAL INTERNAL REFLECTION
        isTotallyInternallyReflecting = true;
        angleOfRefraction = angleOfIncidence;
        angleToDraw = 90 - angleOfRefraction;

        // Angle markings
        stroke(reflectionAngleColor);
        arc(width / 2, height / 2, 50, 50, angleToDraw, 90); // Refraction
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, 90, lightSource.a); // Incident

        // Angle text
        textIncidentAngle = lightSource.a - angleOfIncidence / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = 90 - angleOfRefraction / 2;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(RIGHT, TOP);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(LEFT, TOP);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      } else {
        // REFRACTION
        isTotallyInternallyReflecting = false;
        angleOfRefraction = asin((mat2.n * sin(angleOfIncidence)) / mat1.n);
        angleToDraw = angleOfRefraction - 90;

        // Angle markings
        stroke(refractionAngleColor);
        arc(width / 2, height / 2, 50, 50, -90, angleToDraw); // Refraction
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, 90, lightSource.a); // Incident

        // Angle text
        textIncidentAngle = lightSource.a - angleOfIncidence / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = -90 + angleOfRefraction / 2;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(LEFT, TOP);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(LEFT, BOTTOM);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      }
      break;

    case quadrants.bottomRight:
      angleOfIncidence = 90 - lightSource.a;
      if (mat2.n > mat1.n && angleOfIncidence >= criticalAngle) {
        // TOTAL INTERNAL REFLECTION
        isTotallyInternallyReflecting = true;
        angleOfRefraction = angleOfIncidence;
        angleToDraw = 90 + angleOfRefraction;

        // Angle markings
        stroke(reflectionAngleColor);
        arc(width / 2, height / 2, 50, 50, 90, angleToDraw); // Refraction
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, lightSource.a, 90); // Incident

        // Angle text
        textIncidentAngle = lightSource.a + angleOfIncidence / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = 90 + angleOfRefraction / 2;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(LEFT, TOP);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(RIGHT, TOP);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      } else {
        // REFRACTION
        isTotallyInternallyReflecting = false;
        angleOfRefraction = asin((mat2.n * sin(angleOfIncidence)) / mat1.n);
        angleToDraw = -90 - angleOfRefraction;

        // Angle markings
        stroke(refractionAngleColor);
        arc(width / 2, height / 2, 50, 50, angleToDraw, -90); // Refraction
        stroke(incidenceAngleColor);
        arc(width / 2, height / 2, 50, 50, lightSource.a, 90); // Incident

        // Angle text
        textIncidentAngle = lightSource.a + angleOfIncidence / 2;
        textIncidentPos = createVector(cos(textIncidentAngle) * 30 + width / 2, sin(textIncidentAngle) * 30 + height / 2);
        textRefractionAngle = -90 - angleOfRefraction / 2;
        textRefractionPos = createVector(cos(textRefractionAngle) * 30 + width / 2, sin(textRefractionAngle) * 30 + height / 2);

        strokeWeight(0.5);
        fill(0);
        stroke(0);
        textAlign(LEFT, TOP);
        text(`i = ${nf(angleOfIncidence, 2, 1)}°`, textIncidentPos.x, textIncidentPos.y);
        textAlign(LEFT, BOTTOM);
        text(`r = ${nf(angleOfRefraction, 2, 1)}°`, textRefractionPos.x, textRefractionPos.y);
      }
      break;

    default:
      break;
  }


  // TODO: Add UI for user to change materials
  // MAYBE: Support multiple layers (requires major refactoring lol)

  // Normal
  strokeWeight(2);
  for (let i = 0; i < height; i += 20) {
    line(width / 2, i, width / 2, i + 10);
  }

  // Update materials based on UI
  switch (mat1Select.value()) {
    case "Air":
      mat1 = new Material(1, color(255));
      break;
    case "Water":
      mat1 = new Material(1.33, color("#0ef7b5"));
      break;
    case "Glass":
      mat1 = new Material(1.52, color(61, 146, 216));
      break;
    case "Diamond":
      mat1 = new Material(2.41, color(54, 249, 246));
      break;
    case "Custom":
      mat1 = new Material(mat1Index.value(), mat1ColorPicker.color());
      break;
    default:
      break;
  }
  switch (mat2Select.value()) {
    case "Air":
      mat2 = new Material(1, color(255));
      break;
    case "Water":
      mat2 = new Material(1.33, color("#0ef7b5"));
      break;
    case "Glass":
      mat2 = new Material(1.52, color(61, 146, 216));
      break;
    case "Diamond":
      mat2 = new Material(2.41, color(54, 249, 246));
      break;
    case "Custom":
      mat2 = new Material(mat2Index.value(), mat2ColorPicker.color());
      break;
    default:
      break;
  }

  if (mat1Select.value() === "Custom") {
    mat1ColorPicker.show();
    mat1Index.show();
  } else {
    mat1ColorPicker.hide();
    mat1Index.hide();
  }
  if (mat2Select.value() === "Custom") {
    mat2ColorPicker.show();
    mat2Index.show();
  } else {
    mat2ColorPicker.hide();
    mat2Index.hide();
  }
}


function mouseDragged() {
  lightSource.a = atan2(mouseY - height / 2, mouseX - width / 2);
}

function getQuadrant() {
  if (lightSource.a >= 0 && lightSource.a <= 90) {
    return quadrants.bottomRight;
  } else if (lightSource.a >= 90 && lightSource.a <= 180) {
    return quadrants.bottomLeft;
  } else if (lightSource.a <= 0 && lightSource.a >= -90) {
    return quadrants.topRight;
  } else {
    return quadrants.topLeft;
  }
}