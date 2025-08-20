// --- Firebase config (YOUR project) ---
const firebaseConfig = {
  apiKey: "AIzaSyBR_wN5OK7VuipEp7PPdsHvB6fRoaQoQdg",
  authDomain: "freefiretopupsite-f91ed.firebaseapp.com",
  projectId: "freefiretopupsite-f91ed",
  storageBucket: "freefiretopupsite-f91ed.appspot.com", // important: .appspot.com
  messagingSenderId: "414112823597",
  appId: "1:414112823597:web:bf1a4b4d3edce55665bba4",
  measurementId: "G-4K1RQN0E8Q"
};

// Init Firebase (Compat builds expose global "firebase")
firebase.initializeApp(firebaseConfig);
// Optional: firebase.analytics();
const db = firebase.firestore();
const storage = firebase.storage();

// --- Safe DOM hookup ---
document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("orderForm");
  const statusDiv = document.getElementById("status");
  const selectedPackInput = document.getElementById("selectedPack");

  // Pack selection
  document.querySelectorAll(".pack-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".pack-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedPackInput.value = `${card.dataset.pack} Diamonds`;
    });
  });

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("⏳ Submitting your order...");

    const playerId = document.getElementById("playerId").value.trim();
    const diamondPack = selectedPackInput.value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value;
    const fileInput = document.getElementById("paymentScreenshot");
    const file = fileInput.files[0];

    // Basic validations to avoid silent failures
    if (!playerId) return setStatus("❌ Please enter your Player ID.");
    if (!diamondPack) return setStatus("❌ Please select a diamond pack.");
    if (!paymentMethod) return setStatus("❌ Please choose a payment method.");
    if (!file) return setStatus("❌ Please upload a payment screenshot.");

    // Optional: limit image size/types
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      return setStatus(`❌ Image too large. Max ${maxMB} MB.`);
    }
    if (!file.type.startsWith("image/")) {
      return setStatus("❌ File must be an image.");
    }

    try {
      // Upload screenshot to Storage
      const safeName = `${Date.now()}-${(file.name || "payment").replace(/[^a-z0-9.\-_]/gi, "_")}`;
      const storageRef = storage.ref(`payments/${safeName}`);
      await storageRef.put(file);
      const screenshotUrl = await storageRef.getDownloadURL();

      // Save order in Firestore
      await db.collection("orders").add({
        playerId,
        diamondPack,
        paymentMethod,
        screenshot: screenshotUrl,
        status: "Pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setStatus("✅ Order placed successfully! Please wait for confirmation.");
      orderForm.reset();
      selectedPackInput.value = "";
      document.querySelectorAll(".pack-card").forEach((c) => c.classList.remove("selected"));
    } catch (err) {
      console.error(err);
      setStatus(`❌ Failed to submit order: ${err?.message || err}`);
    }
  });

  function setStatus(msg) {
    statusDiv.textContent = msg;
  }
});
