let cachedDonors = [];
let debounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  initData();

  const cityInput = document.getElementById("filterCity");
  const bloodSelect = document.getElementById("filterBlood");

  if (cityInput) {
    cityInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterDonors, 50);
    });
  }
  if (bloodSelect) {
    bloodSelect.addEventListener("change", filterDonors);
  }
});

function initData() {
  if (typeof getDonors === "function") {
    cachedDonors = getDonors();
  }
  filterDonors();
}

function checkEligibility(lastDonationDate) {
  if (!lastDonationDate) return { isEligible: true, daysRemaining: 0, statusText: "AVAILABLE" };
  const lastDate = new Date(lastDonationDate);
  const today = new Date();
  const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
  return diffDays >= 90
    ? { isEligible: true, daysRemaining: 0, statusText: "AVAILABLE" }
    : { isEligible: false, daysRemaining: 90 - diffDays, statusText: "REST PERIOD" };
}

function renderPatientDashboard() {
  document.getElementById("donorDashboardView").style.display = "none";
  document.getElementById("patientDashboardView").style.display = "block";
  initData();
}

function renderDonorDashboard(user) {
  document.getElementById("patientDashboardView").style.display = "none";
  document.getElementById("donorDashboardView").style.display = "block";

  document.getElementById("profileNameDisplay").innerText = user.name || "Donor";
  document.getElementById("profileLocationDisplay").innerText = `${user.city || "Salem"}, Tamil Nadu`;
  document.getElementById("profileBloodDisplay").innerText = user.blood || "O+";
  document.getElementById("profilePhoneDisplay").innerText = user.phone || "9876543210";
  document.getElementById("profileEmailDisplay").innerText = user.email || "donor@gmail.com";
  document.getElementById("profileLastDonationDate").innerText = user.lastDonation || "Never donated before";

  const el = checkEligibility(user.lastDonation);
  const statusBadge = document.getElementById("profileEligibilityBadge");
  if (el.isEligible) {
    statusBadge.className = "status-badge status-available";
    statusBadge.innerText = "AVAILABLE TO DONATE";
  } else {
    statusBadge.className = "status-badge status-cooldown";
    statusBadge.innerText = `COOLDOWN (${el.daysRemaining} DAYS REMAINING)`;
  }
}

function switchToPatientSearch() {
  renderPatientDashboard();
}

function renderDonors(data) {
  const grid = document.getElementById("donorGrid");
  const countBadge = document.getElementById("donorCount");
  if (!grid || !countBadge) return;

  countBadge.innerText = `${data.length} donors found`;

  if (data.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--gray-600); padding: 2rem;">No donors found for this location or blood group.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  data.forEach((donor) => {
    const el = checkEligibility(donor.lastDonation);
    const card = document.createElement("div");
    card.className = "donor-card";
    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
          <span class="blood-badge">${donor.blood || 'O+'}</span>
          <span class="status-badge ${el.isEligible ? 'status-available' : 'status-cooldown'}">
            ${el.isEligible ? 'AVAILABLE' : `${el.daysRemaining} DAYS COOLDOWN`}
          </span>
        </div>
        <h4 style="margin-bottom:0.3rem;">${donor.name || 'Anonymous Donor'}</h4>
        <div style="font-size:0.9rem; color:var(--gray-600); margin-bottom:1rem;">
          <p><strong>District/City:</strong> ${donor.city || 'Tamil Nadu'}</p>
          <p><strong>Last Donated:</strong> ${donor.lastDonation || 'Never donated before'}</p>
          <p><strong>Phone:</strong> ${donor.phone || 'Available upon SOS'}</p>
        </div>
      </div>
      <button class="btn btn-primary" 
        style="width: 100%; ${!el.isEligible ? 'background: #cbd5e1; color: #475569;' : ''}" 
        onclick="alert('Emergency Alert dispatched directly to ${donor.name} (${donor.blood})!')">
        ${el.isEligible ? 'Request Blood' : 'In Cooldown (Notify)'}
      </button>
    `;
    fragment.appendChild(card);
  });

  grid.innerHTML = "";
  grid.appendChild(fragment);
}

function filterDonors() {
  const blood = document.getElementById("filterBlood") ? document.getElementById("filterBlood").value : "";
  const cityInput = document.getElementById("filterCity");
  const rawCity = (cityInput ? cityInput.value : "").toLowerCase().trim();

  let donorsList = cachedDonors.length > 0 ? cachedDonors : (typeof getDonors === "function" ? getDonors() : []);

  let filtered = donorsList.filter((d) => {
    const matchBlood = !blood || d.blood === blood;
    const matchCity = !rawCity || (d.city && d.city.toLowerCase().includes(rawCity));
    return matchBlood && matchCity;
  });

  if (rawCity) {
    filtered.sort((a, b) => {
      const aCity = (a.city || "").toLowerCase();
      const bCity = (b.city || "").toLowerCase();
      const aStarts = aCity.startsWith(rawCity);
      const bStarts = bCity.startsWith(rawCity);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aCity.localeCompare(bCity);
    });
  }

  renderDonors(filtered);
}

function handleLogDonationSubmit(e) {
  e.preventDefault();
  const newDate = document.getElementById("donationDateInput").value;
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  user.lastDonation = newDate;
  localStorage.setItem("currentUser", JSON.stringify(user));

  if (typeof updateDonorDonationDate === "function") {
    updateDonorDonationDate(user.email || user.name, newDate);
  }

  renderDonorDashboard(user);
  closeModal("updateDonationModal");
  alert("✅ Donation date recorded! 90-day cooldown tracker updated.");
  e.target.reset();
}

function handlePatientEmergencySubmit(e) {
  e.preventDefault();
  const alertData = {
    patient: document.getElementById("sosPatient").value.trim(),
    blood: document.getElementById("sosBlood").value,
    hospital: document.getElementById("sosHospital").value.trim(),
    phone: document.getElementById("sosPhone").value.trim(),
    units: document.getElementById("sosUnits").value,
    urgency: document.getElementById("sosUrgency").value
  };

  localStorage.setItem("active_sos_alert", JSON.stringify(alertData));
  displayEmergencyBanner(alertData);

  if (document.getElementById("patientDashboardView").style.display === "block") {
    document.getElementById("filterBlood").value = alertData.blood;
    filterDonors();
  }

  closeModal("sosModal");
  alert(`🚨 Emergency SOS broadcast active for ${alertData.blood} at ${alertData.hospital}!`);
  e.target.reset();
}

function displayEmergencyBanner(data) {
  const banner = document.getElementById("emergencyBanner");
  const content = document.getElementById("emergencyBannerContent");
  if (banner && content) {
    content.innerHTML = `🚨 <strong>CRITICAL SOS:</strong> <strong>${data.units} Units</strong> of <strong>${data.blood}</strong> needed for <strong>${data.patient}</strong> at <strong>${data.hospital}</strong>. Call Attender: <a href="tel:${data.phone}" style="color:#b91c1c; text-decoration:underline;">${data.phone}</a>`;
    banner.style.display = "flex";
  }
}

function checkActiveEmergency() {
  const saved = localStorage.getItem("active_sos_alert");
  if (saved) {
    displayEmergencyBanner(JSON.parse(saved));
  }
}

function dismissEmergencyAlert() {
  document.getElementById("emergencyBanner").style.display = "none";
}

function openModal(id) { document.getElementById(id).classList.add("active"); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }

function handleRegisterModalSubmit(e) {
  e.preventDefault();
  const newDonor = {
    id: Date.now(),
    name: document.getElementById("modalRegName").value.trim(),
    blood: document.getElementById("modalRegBlood").value,
    city: document.getElementById("modalRegCity").value.trim(),
    phone: document.getElementById("modalRegPhone").value.trim(),
    lastDonation: document.getElementById("modalRegDate").value || null
  };

  cachedDonors.unshift(newDonor);
  if (typeof saveDonor === "function") saveDonor(newDonor);

  filterDonors();
  closeModal("registerModal");
  alert("Donor registered successfully!");
  e.target.reset();
}