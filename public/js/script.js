// Leaflet Dynamic Map
window.addEventListener("load", async () => {
  const mapElement = document.getElementById("map");

  // Safe Exit
  if (typeof listingData === "undefined" || !mapElement) {
    return;
  }

  let latitude = null;
  let longitude = null;

  // Existing Database Coordinates
  if (
    listingData.geometry &&
    listingData.geometry.coordinates &&
    listingData.geometry.coordinates.length === 2 &&
    listingData.geometry.coordinates[0] !== null &&
    listingData.geometry.coordinates[1] !== null
  ) {
    longitude = listingData.geometry.coordinates[0];
    latitude = listingData.geometry.coordinates[1];
  }

  // Auto Fetch Coordinates If Missing
  if (latitude === null || longitude === null) {
    try {
      const searchText = `${listingData.location}, ${listingData.country}`;

      console.log("Map Search:", searchText);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`,
        {
          signal: controller.signal,
          headers: { "User-Agent": "WanderLust-App" },
        }
      );

      clearTimeout(timeout);

      const data = await response.json();

      console.log("Map Geodata:", data);

      if (data && data.length > 0) {
        latitude = parseFloat(data[0].lat);
        longitude = parseFloat(data[0].lon);
      } else {
        console.log("No valid coordinates found.");
      }
    } catch (err) {
      console.log("Geocoding Error:", err);
    }
  }

  // Final Safety Check
  if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
    mapElement.innerHTML = `
      <div class="map-error-box">
        <i class="fa-solid fa-location-dot"></i>
        <p>Map will be available later.</p>
        <small>Please check again after some time.</small>
      </div>
    `;
    return;
  }

  // Create Map
  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: false,
  });

  // Openstreetmap Tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  // Marker
  const marker = L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(
      `
      <div class="map-popup">
        <b>${listingData.title}</b>
        <br>
        ${listingData.location}, ${listingData.country}
      </div>
      `
    );

  // Initial View
  map.setView([latitude, longitude], 5);

  // Smooth Fly Animation
  setTimeout(() => {
    map.flyTo([latitude, longitude], 13, {
      animate: true,
      duration: 2,
    });

    marker.openPopup();
  }, 500);

  // Fix Leaflet Render Bug
  setTimeout(() => {
    map.invalidateSize();
  }, 1000);
});


// Bootstrap Validation
(() => {
  "use strict";

  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();


// Image Popup
function openImage(src) {
  const modal = document.getElementById("imageModal");
  const popupImage = document.getElementById("popupImage");

  if (!modal || !popupImage) {
    return;
  }

  modal.style.display = "flex";
  popupImage.src = src;
  document.body.style.overflow = "hidden";
}


function closeImage() {
  const modal = document.getElementById("imageModal");

  if (!modal) {
    return;
  }

  modal.style.display = "none";
  document.body.style.overflow = "auto";
}


// Close Outside Click
window.addEventListener("click", (event) => {
  const modal = document.getElementById("imageModal");

  if (modal && event.target === modal) {
    closeImage();
  }
});


// Esc Close
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeImage();
  }
});


// Homepage Image Slider
const sliders = document.querySelectorAll(".listing-slider");

sliders.forEach((slider) => {
  const images = slider.querySelectorAll(".slider-image");
  const prevBtn = slider.querySelector(".prev-btn");
  const nextBtn = slider.querySelector(".next-btn");

  if (!images.length) {
    return;
  }

  let currentIndex = 0;

  function showImage(index) {
    images.forEach((img) => {
      img.classList.remove("active-slide");
    });

    images[index].classList.add("active-slide");
  }

  function nextImage(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  function prevImage(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", nextImage);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevImage);
  }

  // Touch Swipe Support
  let startX = 0;

  slider.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      const endX = event.changedTouches[0].clientX;
      const difference = startX - endX;

      if (difference > 50) {
        nextImage();
      }

      if (difference < -50) {
        prevImage();
      }
    },
    { passive: true }
  );

  // Initialize First Slide
  showImage(currentIndex);
});


// Flash Message Auto Close
document.addEventListener("DOMContentLoaded", () => {
  const flashAlerts = document.querySelectorAll(".custom-flash");

  if (!flashAlerts.length) return;

  flashAlerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.transition = "all 0.35s ease";
      alert.style.opacity = "0";
      alert.style.transform = "translateY(-10px)";

      setTimeout(() => {
        alert.remove();
      }, 350);
    }, 3200);
  });
});