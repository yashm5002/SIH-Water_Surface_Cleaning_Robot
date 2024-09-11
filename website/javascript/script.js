document.addEventListener("DOMContentLoaded", async () => {
  const cameraFeed = document.getElementById("cameraFeed");
  const batteryLife = document.getElementById("batteryLife");
  const trashWeight = document.getElementById("trashWeight");
  const currentLocation = document.getElementById("currentLocation");
  const toggleVideoFeedButton = document.getElementById("toggleVideoFeed");
  const popupAlert = document.getElementById("popupAlert");
  const dismissPopup = document.getElementById("dismissPopup");

  let webcamStream = null;
  let isVideoPlaying = true;
  let isReturningToDock = false;


  const dockingStationCoords = [13.5014, 80.1236];

  
  const map = L.map("map").setView([13.5211, 80.124], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: "© OpenStreetMap contributors",}).addTo(map);

  const marker = L.marker([13.5211, 80.124]).addTo(map);

  let battery = 100;
  let weight = 0.0;

 
  const model = await cocoSsd.load();

  function fetchData() {
    if (battery > 0) battery -= Math.random() * 2;
    if (weight < 25) weight += Math.random() * 2.0;

    batteryLife.textContent = `${battery.toFixed(2)}%`;
    trashWeight.textContent = `${weight.toFixed(2)} kg`;

    if (battery <= 30 || weight >= 23.5) {
      isReturningToDock = true;
      showPopupAlert();
      clearInterval(fetchInterval);
      moveToDockingStation();
    }
  }

  function fetchGPS() {
    if (!isReturningToDock) {
      const lat = 13.5211 + Math.random() * 0.005;
      const lon = 80.124 + Math.random() * 0.005;

      currentLocation.textContent = `Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}`;

      marker.setLatLng([lat, lon]);
      map.setView([lat, lon], 13);
    }
  }

  function startWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          webcamStream = stream;
          cameraFeed.srcObject = stream;
          cameraFeed.play();
          setupDetection();
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    } else {
      alert("Webcam is not supported in this browser.");
    }
  }

  function stopWebcam() {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      cameraFeed.srcObject = null;
    }
  }

  function showPopupAlert() {
    popupAlert.style.display = "flex";
  }

  function hidePopupAlert() {
    popupAlert.style.display = "none";
  }

  
  function moveToDockingStation() {
    marker.setLatLng(dockingStationCoords);
    map.setView(dockingStationCoords, 15);
    currentLocation.textContent = `Docking at Latitude: ${dockingStationCoords[0].toFixed(
      5
    )}, Longitude: ${dockingStationCoords[1].toFixed(5)}`;
  }

  function setupDetection() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    document.body.appendChild(canvas);

    async function detectTrash() {
      const predictions = await model.detect(cameraFeed);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);

      predictions.forEach((prediction) => {
        if (
          ["plastic", "paper", "cardboard", "glass", "metal"].includes(
            prediction.class
          )
        ) {
          const [x, y, width, height] = prediction.bbox;
          context.beginPath();
          context.rect(x, y, width, height);
          context.lineWidth = 2;
          context.strokeStyle = "red";
          context.fillStyle = "red";
          context.stroke();
          context.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x,
            y > 10 ? y - 10 : 10
          );
        }
      });

      requestAnimationFrame(detectTrash);
    }

    detectTrash();
  }

  toggleVideoFeedButton.addEventListener("click", () => {
    if (isVideoPlaying) {
      stopWebcam();
      toggleVideoFeedButton.textContent = "Resume Video Feed";
    } else {
      startWebcam();
      toggleVideoFeedButton.textContent = "Pause Video Feed";
    }
    isVideoPlaying = !isVideoPlaying;
  });

  dismissPopup.addEventListener("click", () => {
    hidePopupAlert();
  });

  startWebcam();

  const fetchInterval = setInterval(() => {
    fetchData();
    fetchGPS();
  }, 1000);
});
