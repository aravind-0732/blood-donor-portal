let selectedRole = "donor"; // 'donor' or 'patient'

function selectRole(role) {
  selectedRole = role;
  document.getElementById("landingScreen").style.display = "none";
  document.getElementById("authScreen").style.display = "flex";

  const authLabel = document.getElementById("authRoleLabel");
  const bloodInputGroup = document.getElementById("regBloodGroupGroup");

  if (role === "donor") {
    authLabel.innerText = "Donor Portal Access";
    bloodInputGroup.style.display = "flex";
  } else {
    authLabel.innerText = "Patient & Requester Portal Access";
    bloodInputGroup.style.display = "none";
  }
}

function returnToLanding() {
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("landingScreen").style.display = "flex";
}

function switchAuthTab(type) {
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  const tabSignInBtn = document.getElementById("tabSignInBtn");
  const tabSignUpBtn = document.getElementById("tabSignUpBtn");

  if (type === "signin") {
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
    tabSignInBtn.classList.add("active");
    tabSignUpBtn.classList.remove("active");
  } else {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
    tabSignUpBtn.classList.add("active");
    tabSignInBtn.classList.remove("active");
  }
}

function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const users = JSON.parse(localStorage.getItem("app_registered_users") || "[]");
  let user = users.find((u) => u.email === email);

  if (!user) {
    user = {
      name: email.split("@")[0],
      email: email,
      role: selectedRole,
      blood: selectedRole === "donor" ? "O+" : "N/A",
      city: "Salem",
      phone: "9876543210",
      lastDonation: null
    };
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  launchApplication(user);
}

function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const city = document.getElementById("regCity").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const blood = selectedRole === "donor" ? document.getElementById("regBlood").value : "N/A";

  const newUser = { id: Date.now(), name, email, blood, city, phone, role: selectedRole, lastDonation: null };

  const users = JSON.parse(localStorage.getItem("app_registered_users") || "[]");
  users.push(newUser);
  localStorage.setItem("app_registered_users", JSON.stringify(users));

  if (selectedRole === "donor" && typeof saveDonor === "function") {
    saveDonor({ name, blood, city, phone, email, lastDonation: null });
  }

  alert(`Account created successfully for ${name}! Please Sign In.`);
  switchAuthTab("signin");
  document.getElementById("loginEmail").value = email;
}

function launchApplication(user) {
  document.getElementById("landingScreen").style.display = "none";
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";

  const navBadge = document.getElementById("userDisplayName");
  const navAction = document.getElementById("navActionBtn");

  if (user.role === "donor") {
    navBadge.innerText = `${user.name} [Donor - ${user.blood}]`;
    navAction.innerText = "Donor Profile";
    renderDonorDashboard(user);
  } else {
    navBadge.innerText = `${user.name} [Patient / Requester]`;
    navAction.innerText = "+ Register as Donor";
    renderPatientDashboard();
  }

  if (typeof checkActiveEmergency === "function") checkActiveEmergency();
}

function handleNavAction() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (user.role === "donor") {
    const isProfileVisible = document.getElementById("donorDashboardView").style.display === "block";
    if (isProfileVisible) {
      renderPatientDashboard();
    } else {
      renderDonorDashboard(user);
    }
  } else {
    openModal("registerModal");
  }
}

function handleLogout() {
  localStorage.removeItem("currentUser");
  document.getElementById("appScreen").style.display = "none";
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("landingScreen").style.display = "flex";
}

document.addEventListener("DOMContentLoaded", () => {
  const sessionUser = localStorage.getItem("currentUser");
  if (sessionUser) {
    launchApplication(JSON.parse(sessionUser));
  }
});