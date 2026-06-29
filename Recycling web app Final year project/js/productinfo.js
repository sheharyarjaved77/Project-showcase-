// Listen for authentication state changes
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // Redirect to login page if not authenticated
    window.location.href = "login.html";
    return;
  }

  // Retrieve product details from local storage
  const productName = localStorage.getItem("productName") || "Unknown Product";
  const recyclingTips = localStorage.getItem("recyclingTips") || "No recycling info available.";
  const pointsEarned = 10; // Points are set to 10 by default

  // Update the DOM with the retrieved information
  document.getElementById("product-name").textContent = productName;
  document.getElementById("recycling-tips").innerText = recyclingTips;
  document.getElementById("points-earned").textContent = pointsEarned;

  // When the "Recycle" button is clicked, navigate to the confirmation page
  document.getElementById("recycle-btn").addEventListener("click", function() {
    window.location.href = "confirmBin.html";
  });

  // When the "Exit" button is clicked, navigate back to the scan page
  document.getElementById("exit-btn").addEventListener("click", function() {
    window.location.href = "scan.html";
  });
});
