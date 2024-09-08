document.addEventListener("DOMContentLoaded", () => {
  const cameraFeed = document.getElementById("cameraFeed");
  const batteryLife = document.getElementById("batteryLife");
  const trashWeight = document.getElementById("trashWeight");
  const waterCharacteristics = document.getElementById("waterCharacteristics");
  const currentLocation = document.getElementById("currentLocation");

  // Initialize the map with a default view
  const map = L.map("map").setView([0, 0], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  const marker = L.marker([0, 0]).addTo(map);

  function fetchData() {
    const cameraFeedUrl = "http://your-robot-ip/camera-feed";
    const batteryLifeUrl = "http://your-robot-ip/battery-life";
    const trashWeightUrl = "http://your-robot-ip/trash-weight";
    const waterCharacteristicsUrl =
      "http://your-robot-ip/water-characteristics";
    const gpsUrl = "http://your-robot-ip/gps-location";

    cameraFeed.src = cameraFeedUrl;

    fetch(batteryLifeUrl)
      .then((response) => response.json())
      .then((data) => {
        batteryLife.textContent = `${data.battery}%`;

        if (data.battery < 20) {
          alert(
            "Battery is below 20%. The robot is returning to the starting point."
          );
        }
      })
      .catch((error) => console.error("Error fetching battery life:", error));

    fetch(trashWeightUrl)
      .then((response) => response.json())
      .then((data) => {
        trashWeight.textContent = `${data.weight} kg`;

        if (data.weight >= 23) {
          alert(
            "Trash weight has reached 23 kg. The robot is returning to the starting point."
          );
        }
      })
      .catch((error) => console.error("Error fetching trash weight:", error));

    fetch(waterCharacteristicsUrl)
      .then((response) => response.json())
      .then((data) => {
        waterCharacteristics.textContent = `pH: ${data.ph}, Turbidity: ${data.turbidity}`;
      })
      .catch((error) =>
        console.error("Error fetching water characteristics:", error)
      );

    fetch(gpsUrl)
      .then((response) => response.json())
      .then((data) => {
        const lat = data.latitude;
        const lon = data.longitude;

        currentLocation.textContent = `Latitude: ${lat}, Longitude: ${lon}`;

        marker.setLatLng([lat, lon]);
        map.setView([lat, lon], 13);
      })
      .catch((error) => console.error("Error fetching GPS location:", error));
  }

  setInterval(fetchData, 5000);
});
