// ===============================
// ✅ CONFIGURACIÓN DEL BACKEND
// ===============================
// 👉 Cambia esta URL por la de tu backend en Render
window.API_BASE = "https://my-python-backend-7io5.onrender.com"; 

// ===============================
// ✅ MODAL FUNCTIONALITY
// ===============================
const speciesModal = document.getElementById("species-modal");
const closeBtns = document.getElementsByClassName("close");

// Add event listeners to all "Ver detalles" buttons
document.querySelectorAll(".species-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    const h3 = this.previousElementSibling;
    const text = h3.textContent;
    const parts = text.split(" — ");
    const scientificName = parts[0].trim();

    // Fetch data from backend (Render)
    fetch(`${window.API_BASE}/api/species/${scientificName}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert("Especie no encontrada");
          return;
        }
        // Populate modal
        document.getElementById("species-name").textContent = data.common_name;
        document.getElementById("scientific-name").textContent = data.scientific_name;
        document.getElementById("average-weight").textContent = data.average_weight;
        document.getElementById("average-size").textContent = data.average_size;
        document.getElementById("conservation").textContent = data.conservation || "No disponible";
        document.getElementById("description").textContent = data.description || "No disponible";

        // Show modal
        speciesModal.style.display = "block";
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        alert("Error al cargar los datos");
      });
  });
});

// Close modals when clicking the close button
for (let i = 0; i < closeBtns.length; i++) {
  closeBtns[i].onclick = function() {
    speciesModal.style.display = "none";
  }
}

// Close modals when clicking outside of them
window.onclick = function(event) {
  if (event.target == speciesModal) {
    speciesModal.style.display = "none";
  }
}

// ===============================
// ✅ MAP FUNCTIONALITY
// ===============================
let map;
let markers = [];
let markerGroup;

function initMap() {
  map = L.map('map').setView([9.5, -84.0], 7); // Costa Rica

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  markerGroup = L.layerGroup().addTo(map);
  loadMarkers();
}

function loadMarkers() {
  markerGroup.clearLayers();
  markers = [];

  const filters = {
    tortugas: document.getElementById('filter-tortugas').checked,
    tiburones: document.getElementById('filter-tiburones').checked,
    rayas: document.getElementById('filter-rayas').checked,
    peces: document.getElementById('filter-peces').checked
  };

  for (const [scientificName, data] of Object.entries(window.speciesData || {})) {
    if (!filters[data.group]) continue;

    const marker = L.marker(data.coordinates).addTo(markerGroup);
    const popupText = (data.group === "rayas" || data.group === "peces") ?
      `Especie vista por última vez en esta zona` :
      `Estado: ${data.conservation}`;
    marker.bindPopup(`<b>${data.common_name}</b><br>${data.scientific_name}<br>${popupText}`);
    markers.push(marker);
  }
}

// ===============================
// ✅ DARK MODE + MAP INITIALIZATION
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener('change', function() {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  if (document.getElementById('map')) {
    initMap();

    // Add event listeners to filters
    document.getElementById('filter-tortugas').addEventListener('change', loadMarkers);
    document.getElementById('filter-tiburones').addEventListener('change', loadMarkers);
    document.getElementById('filter-rayas').addEventListener('change', loadMarkers);
    document.getElementById('filter-peces').addEventListener('change', loadMarkers);
  }
});
