
const particles = [];
const particleCount = 3000;
const threshold = 0.05;
const minMN = 1;
const maxMN = 6;
let m = 5;
let n = 4;
let margin = 50;
let w1, w2, h1, h2;

function setup() {
  const size = getCanvasSize();
  createCanvas(size, size).parent("sketch-container");
  updateParticleBounds();
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  updatePatternInfo();
}

function windowResized() {
  const previousWidth = width;
  const previousHeight = height;
  const size = getCanvasSize();
  resizeCanvas(size, size);

  for (const particle of particles) {
    particle.position.x *= width / previousWidth;
    particle.position.y *= height / previousHeight;
    particle.velocity.x *= width / previousWidth;
    particle.velocity.y *= height / previousHeight;
  }

  updateParticleBounds();
}

function getCanvasSize() {
  return Math.max(1, Math.min(700, windowWidth - 32, windowHeight - 120));
}

function updateParticleBounds() {
  margin = width * (50 / 700);
  w1 = margin;
  w2 = width - margin;
  h1 = margin;
  h2 = height - margin;
}

function draw() {
  background(0);

  for (const particle of particles) {
    particle.update();
    particle.display();
  }
}

function chladni(x, y) {
  return cos(n * PI * x) * cos(m * PI * y) -
    cos(m * PI * x) * cos(n * PI * y);
}

function randomPatterns() {
  const patterns = [];
  for (let first = minMN; first <= maxMN; first++) {
    for (let second = minMN; second < first; second++) {
      if (first !== m || second !== n) {
        patterns.push([first, second]);
      }
    }
  }

  const [nextM, nextN] = random(patterns);
  m = nextM;
  n = nextN;
  updatePatternInfo();

  for (const particle of particles) {
    particle.position.set(random(w1, w2), random(h1, h2));
    particle.velocity = p5.Vector.random2D().mult(random(2, 5));
    particle.stopped = false;
  }
}

function updatePatternInfo() {
  document.getElementById("pattern-info").textContent = `m = ${m}    n = ${n}`;
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    randomPatterns();
  }
}

class Particle {
  constructor() {
    this.position = createVector(random(w1, w2), random(h1, h2));
    this.velocity = p5.Vector.random2D().mult(random(1, 3));
    this.stopped = false;
  }

  update() {
    if (this.stopped) {
      return;
    }

    const nextPosition = this.position.copy().add(this.velocity);

    if (nextPosition.x < w1 || nextPosition.x > w2) {
      this.velocity.x *= -1;
      nextPosition.x = constrain(nextPosition.x, w1, w2);
    }
    if (nextPosition.y < h1 || nextPosition.y > h2) {
      this.velocity.y *= -1;
      nextPosition.y = constrain(nextPosition.y, h1, h2);
    }

    const currentValue = chladni(
      map(this.position.x, w1, w2, 0, 1),
      map(this.position.y, h1, h2, 0, 1)
    );
    const nextValue = chladni(
      map(nextPosition.x, w1, w2, 0, 1),
      map(nextPosition.y, h1, h2, 0, 1)
    );

    if (Math.abs(nextValue) < threshold || currentValue * nextValue < 0) {
      if (currentValue * nextValue < 0) {
        const fraction =
          Math.abs(currentValue) /
          (Math.abs(currentValue) + Math.abs(nextValue));
        this.position.lerp(nextPosition, fraction);
      } else {
        this.position = nextPosition;
      }
      this.velocity.set(0, 0);
      this.stopped = true;
      return;
    }

    this.position = nextPosition;
  }

  display() {
    noStroke();
    fill(255);
    circle(this.position.x, this.position.y, 2);
  }
}