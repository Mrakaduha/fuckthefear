let path, length, ball;

let t = 0;
let direction = 1;
let state = "idle";

const journeyMinutes = 3;
const pauseSeconds = 5;

async function init() {

  // načti trajektorii
  const response = await fetch("centerline.svg");
  const svgText = await response.text();

  const hidden = document.createElement("div");
  hidden.style.display = "none";
  hidden.innerHTML = svgText;
  document.body.appendChild(hidden);

  path = document.getElementById("centerline");
  length = path.getTotalLength();

  // vytvoř kuličku
  const svg = document.getElementById("ballLayer");

  ball = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ball.setAttribute("r", "6");
  ball.setAttribute("fill", "#c49a3a");

  svg.appendChild(ball);

  const start = path.getPointAtLength(0);
  ball.setAttribute("cx", start.x);
  ball.setAttribute("cy", start.y);

  animate();
}

function animate() {

  if (state === "forward" || state === "backward") {

    const point = path.getPointAtLength(t);

    ball.setAttribute("cx", point.x);
    ball.setAttribute("cy", point.y);

    const journeyTime = journeyMinutes * 60 * 1000;
    const speed = length / (journeyTime / 16);

    t += speed * direction;

    if (t >= length) {
      t = length;
      state = "pause";

      setTimeout(() => {
        direction = -1;
        state = "backward";
      }, pauseSeconds * 1000);
    }

    if (t <= 0 && state === "backward") {
      t = 0;
      state = "idle";
    }
  }

  requestAnimationFrame(animate);
}

function startJourney() {
  direction = 1;
  t = 0;
  state = "forward";
}

// poslouchá homepage
window.addEventListener("message", (event) => {
  if (event.data === "start") {
    startJourney();
  }
});

init();