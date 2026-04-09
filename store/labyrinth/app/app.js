// ===== NASTAVENÍ =====

let journeyMinutes = 3;
let pauseSeconds = 5;

let ballColor = "#c49a3a";
let ballRadius = 8;

let backgroundColor = "#000000";
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      document.getElementById("getButton").style.display = "block";
      });

async function init() {

  const panel = document.getElementById("settingsPanel");
  const overlay = document.getElementById("overlay");

  document.getElementById("getButton").style.display = "none";

  const response = await fetch("centerline.svg");
  const svgText = await response.text();

  const hidden = document.createElement("div");
  hidden.style.display = "none";
  hidden.innerHTML = svgText;

  document.body.appendChild(hidden);

  const path = document.getElementById("centerline");
  const length = path.getTotalLength();
  
  console.log(path.getBBox());

  const svg = document.querySelector("svg");
  
  svg.setAttribute("width", "730");
  svg.setAttribute("height", "730");

  const ball = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ball.setAttribute("r", ballRadius);
  ball.setAttribute("fill", ballColor);

  svg.appendChild(ball);

  const start = path.getPointAtLength(0);
  ball.setAttribute("cx", start.x);
  ball.setAttribute("cy", start.y);

  document.body.style.background = backgroundColor;

  const saved = localStorage.getItem("labyrinthSettings");

  if (saved) {

    const s = JSON.parse(saved);

    journeyMinutes = s.journeyMinutes ?? journeyMinutes;
    pauseSeconds = s.pauseSeconds ?? pauseSeconds;
    ballColor = s.ballColor ?? ballColor;
    backgroundColor = s.backgroundColor ?? backgroundColor;

  }

  document.getElementById("journeyInput").value = journeyMinutes;
  document.getElementById("pauseInput").value = pauseSeconds;
  document.getElementById("ballColorInput").value = ballColor;
  document.getElementById("bgColorInput").value = backgroundColor;

  document.body.style.background = backgroundColor;
  ball.setAttribute("fill", ballColor);

  let t = 0;
  let direction = 1;
  let state = "idle";

  const journeyTime = journeyMinutes * 60 * 1000;
  let speed = length / (journeyTime / 16);

  function saveSettings() {

    const data = {
      journeyMinutes,
      pauseSeconds,
      ballColor,
      backgroundColor
    };

    localStorage.setItem("labyrinthSettings", JSON.stringify(data));

  }

  function animate() {

    if (state === "forward" || state === "backward") {

      const point = path.getPointAtLength(t);

      ball.setAttribute("cx", point.x);
      ball.setAttribute("cy", point.y);

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

        document.getElementById("startButton").style.display = "block";
        document.getElementById("settingsButton").style.display = "block";
      }

    }

    requestAnimationFrame(animate);

  }

  function startJourney() {

    if (state === "idle") {

      direction = 1;
      state = "forward";

      document.getElementById("startButton").style.display = "none";
      document.getElementById("settingsButton").style.display = "none";
      document.getElementById("settingsPanel").style.display = "none";
      document.getElementById("getButton").style.display = "none";

    }

  }

  animate();

  document.getElementById("startButton").addEventListener("click", startJourney);

  document.getElementById("settingsButton").addEventListener("click", () => {

    const isOpen = panel.style.display === "block";

    panel.style.display = isOpen ? "none" : "block";
    overlay.style.display = isOpen ? "none" : "block";

  });

  overlay.addEventListener("pointerdown", () => {
    panel.style.display = "none";
    overlay.style.display = "none";
  });

  document.getElementById("journeyInput").addEventListener("input", (e) => {

    journeyMinutes = Number(e.target.value);

    const journeyTime = journeyMinutes * 60 * 1000;
    speed = length / (journeyTime / 16);

    saveSettings();

  });

  document.getElementById("pauseInput").addEventListener("input", (e) => {

    pauseSeconds = Number(e.target.value);
    saveSettings();

  });

  document.getElementById("ballColorInput").addEventListener("input", (e) => {

    ballColor = e.target.value;
    ball.setAttribute("fill", ballColor);
    saveSettings();

  });

  document.getElementById("bgColorInput").addEventListener("input", (e) => {

    backgroundColor = e.target.value;
    document.body.style.background = backgroundColor;
    saveSettings();

  });

  document.getElementById("resetButton").addEventListener("click", () => {

    journeyMinutes = 3;
    pauseSeconds = 5;
    ballColor = "#c49a3a";
    backgroundColor = "#000000";

    document.getElementById("journeyInput").value = journeyMinutes;
    document.getElementById("pauseInput").value = pauseSeconds;
    document.getElementById("ballColorInput").value = ballColor;
    document.getElementById("bgColorInput").value = backgroundColor;

    document.body.style.background = backgroundColor;
    ball.setAttribute("fill", ballColor);

    saveSettings();

  });
  
    const getBtn = document.getElementById("getButton");

    getBtn.addEventListener("click", async () => {

      // okamžitá reakce
      getBtn.textContent = "Installing…";
      getBtn.disabled = true;

      if (deferredPrompt) {
        deferredPrompt.prompt();
        localStorage.setItem("installed", "true");
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      }
    });
    
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}

init();