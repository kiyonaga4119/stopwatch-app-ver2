const socket = io();
let elapsedTime = 0;
let running = false;

function formatTime(ms) {
    let date = new Date(ms);
    let minutes = String(date.getUTCMinutes()).padStart(2, "0");
    let seconds = String(date.getUTCSeconds()).padStart(2, "0");
    let centiseconds = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, "0");
    return `${minutes}:${seconds}.${centiseconds}`;
}

function updateDisplay() {
    document.getElementById("time").textContent = formatTime(elapsedTime);
}

// サーバーから現在のタイムを受け取る
socket.on("updateTime", (data) => {
    elapsedTime = data.elapsedTime;
    running = data.running;
    updateDisplay();
    updateButtonState();
});

// サーバーからラップタイムのリストを受信
socket.on("updateLaps", (laps) => {
    updateLapsDisplay(laps);
});

function updateButtonState() {
    const toggleButton = document.getElementById("toggle");
    const actionButton = document.getElementById("action");

    if (running) {
        toggleButton.textContent = "Stop";
        toggleButton.style.backgroundColor = "#dc3545";
        toggleButton.style.boxShadow = "0 0 10px rgba(220, 53, 69, 0.7)";
        actionButton.textContent = "Lap";
        actionButton.style.backgroundColor = "#ffc107";
        actionButton.style.boxShadow = "0 0 10px rgba(255, 193, 7, 0.7)";
    } else {
        toggleButton.textContent = "Start";
        toggleButton.style.backgroundColor = "#007bff";
        toggleButton.style.boxShadow = "0 0 10px rgba(0, 123, 255, 0.7)";
        actionButton.textContent = "Reset";
        actionButton.style.backgroundColor = "#28a745";
        actionButton.style.boxShadow = "0 0 10px rgba(40, 167, 69, 0.7)";
    }
}

document.getElementById("toggle").addEventListener("mousedown", () => {
    if (running) {
        socket.emit("stop");
    } else {
        socket.emit("start");
    }
});

document.getElementById("action").addEventListener("mousedown", () => {
    if (running) {
        const lapTime = formatTime(elapsedTime);
        socket.emit("lap", lapTime);
    } else {
        socket.emit("reset");
    }
});

function formatTimeFromMs(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(5, "0")}`;
}

function updateLapsDisplay(laps) {
    const lapsContainer = document.getElementById("laps");
    lapsContainer.innerHTML = "";
    laps.reverse().forEach((lapData, index) => {
      const lapElement = document.createElement("div");
      lapElement.className = "lap";
      let lapN = String(laps.length - index).padStart(2, "0");
      lapElement.textContent = `${lapN}: ${formatTimeFromMs(lapData.lap)} | ${formatTimeFromMs(lapData.split)}`;
      if (index % 2 === 0) {
          lapElement.style.backgroundColor = "#1f1f1f";
      } else {
          lapElement.style.backgroundColor = "#000";
      }
      lapsContainer.appendChild(lapElement);
    });
}
