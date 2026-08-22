const STORAGE_KEY = "blood_portal_donors";

const defaultDonors = [
  { id: 1, name: "Karthik Sharma", blood: "O+", city: "Salem", lastDonation: "2026-03-10", phone: "9876543210" },
  { id: 2, name: "Suresh Kumar", blood: "A+", city: "Chennai", lastDonation: "2026-07-25", phone: "9876543211" },
  { id: 3, name: "Vinod Verma", blood: "B+", city: "Coimbatore", lastDonation: "2026-01-15", phone: "9876543212" },
  { id: 4, name: "Manoj Singh", blood: "O-", city: "Salem", lastDonation: "2025-11-20", phone: "9876543213" },
  { id: 5, name: "Prakash Joshi", blood: "AB+", city: "Madurai", lastDonation: "2026-08-01", phone: "9876543214" },
  { id: 6, name: "Dinesh Babu", blood: "A-", city: "Erode", lastDonation: null, phone: "9876543215" },
  { id: 7, name: "Ananya R", blood: "B-", city: "Trichy", lastDonation: "2026-04-12", phone: "9876543216" },
  { id: 8, name: "Pooja Sundaram", blood: "AB-", city: "Salem", lastDonation: "2026-02-18", phone: "9876543217" }
];

function getDonors() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDonors));
    return defaultDonors;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultDonors;
  }
}

function saveDonor(donor) {
  const donors = getDonors();
  donor.id = Date.now();
  donors.unshift(donor);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(donors));
  return donors;
}

function updateDonorDonationDate(donorEmail, newDate) {
  const donors = getDonors();
  const updated = donors.map((d) => {
    if (d.email === donorEmail || d.name === donorEmail) {
      return { ...d, lastDonation: newDate };
    }
    return d;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}