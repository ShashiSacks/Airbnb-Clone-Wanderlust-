// Leaflet Dynamic Map

window.addEventListener(
  "load",
  async () => {

    // Prevent errors

    if (
      typeof listing === "undefined" ||
      !document.getElementById("map")
    ) {
      return;
    }

    let latitude;
    let longitude;

    // Existing DB coordinates

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

    // Detect wrong default Kerala coords

    const wrongCoords =
      longitude === 76.6141 &&
      latitude === 8.8932;

    // Auto fetch correct coords

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

          // fallback

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

    /* =========================
       CREATE MAP
    ========================= */

    const map =
      L.map("map");

    /* India View First */

    map.fitBounds([
      [6.5, 68.0],
      [37.0, 97.5]
    ]);

    /* OpenStreetMap Tiles */

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; OpenStreetMap contributors",
      }
    ).addTo(map);

    /* Marker */

    const marker =
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(
          `
          <b>${listing.title}</b>
          <br>
          ${listing.location},
          ${listing.country}
          `
        );

    /* Smooth Zoom To Exact Location */

    setTimeout(() => {

      map.flyTo(
        [latitude, longitude],
        13,
        {
          animate: true,
          duration: 2.5
        }
      );

      marker.openPopup();

    }, 800);

    // Fix grey map issue

    setTimeout(() => {

      map.invalidateSize();

    }, 300);

  }
);


// Bootstrap Validation

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


// Open Image Popup

function openImage(src) {

  const modal =
    document.getElementById(
      "imageModal"
    );

  const popupImage =
    document.getElementById(
      "popupImage"
    );

  if (modal && popupImage) {

    modal.style.display =
      "flex";

    popupImage.src = src;

    document.body.style.overflow =
      "hidden";

  }

}


// Close Image Popup

function closeImage() {

  const modal =
    document.getElementById(
      "imageModal"
    );

  if (modal) {

    modal.style.display =
      "none";

    document.body.style.overflow =
      "auto";

  }

}


// Close Modal Outside Click

window.addEventListener(
  "click",
  function(event) {

    const modal =
      document.getElementById(
        "imageModal"
      );

    if (event.target === modal) {

      closeImage();

    }

  }
);


// ESC Close

document.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "Escape") {

      closeImage();

    }

  }
);


// Gallery Hover Effect

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


// Homepage Image Slider

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

  let currentIndex = 0;


  function showImage(index) {

    images.forEach((img) => {

      img.classList.remove(
        "active-slide"
      );

    });

    if (images[index]) {

      images[index].classList.add(
        "active-slide"
      );

    }

  }


  if (nextBtn) {

    nextBtn.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        event.stopPropagation();

        currentIndex++;

        if (
          currentIndex >= images.length
        ) {

          currentIndex = 0;

        }

        showImage(currentIndex);

      }
    );

  }


  if (prevBtn) {

    prevBtn.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        event.stopPropagation();

        currentIndex--;

        if (currentIndex < 0) {

          currentIndex =
            images.length - 1;

        }

        showImage(currentIndex);

      }
    );

  }


  if (images.length > 0) {

    showImage(currentIndex);

  }

});


// Wishlist Toast Popup

const wishlistForms =
  document.querySelectorAll(
    ".wishlist-form"
  );

wishlistForms.forEach((form) => {

  form.addEventListener(
    "submit",
    () => {

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