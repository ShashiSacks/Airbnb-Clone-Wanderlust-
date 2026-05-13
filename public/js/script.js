// ========================================
// LEAFLET DYNAMIC MAP
// ========================================

window.addEventListener(
  "load",
  async () => {

    const mapElement =
      document.getElementById("map");

    if (
      typeof listing === "undefined" ||
      !mapElement
    ) {
      return;
    }

    let latitude;
    let longitude;

    // Existing DB Coordinates

    if (
      listing.geometry &&
      listing.geometry.coordinates &&
      listing.geometry.coordinates.length === 2
    ) {

      longitude =
        listing.geometry.coordinates[0];

      latitude =
        listing.geometry.coordinates[1];

    }

    // Detect Wrong Kerala Fallback

    const wrongCoords =
      longitude === 76.6141 &&
      latitude === 8.8932;

    // Auto Fetch Coordinates

    if (
      !latitude ||
      !longitude ||
      wrongCoords
    ) {

      try {

        const searchText =
          `${listing.location}, ${listing.country}`;

        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`
          );

        const data =
          await response.json();

        if (data.length > 0) {

          latitude =
            parseFloat(data[0].lat);

          longitude =
            parseFloat(data[0].lon);

        } else {

          // India Fallback

          latitude = 20.5937;
          longitude = 78.9629;

        }

      } catch (err) {

        console.log(
          "Geocoding Error:",
          err
        );

        latitude = 20.5937;
        longitude = 78.9629;

      }

    }

    // Create Map

    const map =
      L.map("map", {
        zoomControl: true,
        scrollWheelZoom: false,
      });

    // India View First

    map.fitBounds([
      [6.5, 68.0],
      [37.0, 97.5],
    ]);

    // OpenStreetMap Tiles

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }
    ).addTo(map);

    // Marker

    const marker =
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(
          `
          <div class="map-popup">
            <b>${listing.title}</b>
            <br>
            ${listing.location}, ${listing.country}
          </div>
          `
        );

    // Smooth Zoom

    setTimeout(() => {

      map.flyTo(
        [latitude, longitude],
        13,
        {
          animate: true,
          duration: 2.5,
        }
      );

      marker.openPopup();

    }, 800);

    // Fix Grey Map

    setTimeout(() => {

      map.invalidateSize();

    }, 300);

  }
);


// ========================================
// BOOTSTRAP VALIDATION
// ========================================

(() => {

  "use strict";

  const forms =
    document.querySelectorAll(
      ".needs-validation"
    );

  Array.from(forms).forEach((form) => {

    form.addEventListener(
      "submit",
      (event) => {

        if (!form.checkValidity()) {

          event.preventDefault();
          event.stopPropagation();

        }

        form.classList.add(
          "was-validated"
        );

      },
      false
    );

  });

})();


// ========================================
// IMAGE POPUP
// ========================================

function openImage(src) {

  const modal =
    document.getElementById(
      "imageModal"
    );

  const popupImage =
    document.getElementById(
      "popupImage"
    );

  if (!modal || !popupImage) {
    return;
  }

  modal.style.display =
    "flex";

  popupImage.src = src;

  document.body.style.overflow =
    "hidden";

}


function closeImage() {

  const modal =
    document.getElementById(
      "imageModal"
    );

  if (!modal) {
    return;
  }

  modal.style.display =
    "none";

  document.body.style.overflow =
    "auto";

}


// Close Outside Click

window.addEventListener(
  "click",
  (event) => {

    const modal =
      document.getElementById(
        "imageModal"
      );

    if (
      modal &&
      event.target === modal
    ) {

      closeImage();

    }

  }
);


// ESC Close

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {

      closeImage();

    }

  }
);


// ========================================
// GALLERY HOVER EFFECT
// ========================================

const galleryImages =
  document.querySelectorAll(
    ".gallery-img"
  );

galleryImages.forEach((img) => {

  img.addEventListener(
    "mouseenter",
    () => {

      img.style.transform =
        "scale(0.98)";

    }
  );

  img.addEventListener(
    "mouseleave",
    () => {

      img.style.transform =
        "scale(1)";

    }
  );

});


// ========================================
// HOMEPAGE IMAGE SLIDER
// ========================================

const sliders =
  document.querySelectorAll(
    ".listing-slider"
  );

sliders.forEach((slider) => {

  const images =
    slider.querySelectorAll(
      ".slider-image"
    );

  const prevBtn =
    slider.querySelector(
      ".prev-btn"
    );

  const nextBtn =
    slider.querySelector(
      ".next-btn"
    );

  if (!images.length) {
    return;
  }

  let currentIndex = 0;


  function showImage(index) {

    images.forEach((img) => {

      img.classList.remove(
        "active-slide"
      );

    });

    images[index].classList.add(
      "active-slide"
    );

  }


  function nextImage(event) {

    if (event) {

      event.preventDefault();
      event.stopPropagation();

    }

    currentIndex++;

    if (
      currentIndex >= images.length
    ) {

      currentIndex = 0;

    }

    showImage(currentIndex);

  }


  function prevImage(event) {

    if (event) {

      event.preventDefault();
      event.stopPropagation();

    }

    currentIndex--;

    if (currentIndex < 0) {

      currentIndex =
        images.length - 1;

    }

    showImage(currentIndex);

  }


  if (nextBtn) {

    nextBtn.addEventListener(
      "click",
      nextImage
    );

  }


  if (prevBtn) {

    prevBtn.addEventListener(
      "click",
      prevImage
    );

  }

  // Touch Swipe Support

  let startX = 0;

  slider.addEventListener(
    "touchstart",
    (event) => {

      startX =
        event.touches[0].clientX;

    },
    { passive: true }
  );


  slider.addEventListener(
    "touchend",
    (event) => {

      const endX =
        event.changedTouches[0].clientX;

      const difference =
        startX - endX;

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


// ========================================
// WISHLIST TOAST POPUP
// ========================================

const wishlistForms =
  document.querySelectorAll(
    ".wishlist-form"
  );

wishlistForms.forEach((form) => {

  form.addEventListener(
    "submit",
    () => {

      const oldToast =
        document.querySelector(
          ".wishlist-toast"
        );

      if (oldToast) {

        oldToast.remove();

      }

      const toast =
        document.createElement("div");

      toast.className =
        "wishlist-toast";

      toast.innerHTML =
        "❤️ Listing added to wishlist";

      document.body.appendChild(
        toast
      );

      setTimeout(() => {

        toast.classList.add(
          "show"
        );

      }, 50);


      setTimeout(() => {

        toast.classList.remove(
          "show"
        );

        setTimeout(() => {

          toast.remove();

        }, 300);

      }, 2200);

    }
  );

});


// ========================================
// FLASH MESSAGE AUTO CLOSE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const flashAlerts =
      document.querySelectorAll(
        ".custom-flash"
      );

    if (!flashAlerts.length) {
      return;
    }

    flashAlerts.forEach((alert) => {

      setTimeout(() => {

        alert.style.transition =
          "all 0.35s ease";

        alert.style.opacity =
          "0";

        alert.style.transform =
          "translateY(-10px)";

        setTimeout(() => {

          alert.remove();

        }, 350);

      }, 3200);

    });

  }
);