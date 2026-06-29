
// Global Variables and Constants


// URL for backend to lookup barcode product info
const backendUrl = "https://barcode-backend-5ie8.onrender.com";

// Global variables for video track and flash state
let videoTrack = null;
let flashEnabled = false;

// Display error message in the scan-error element.
// @param {string} message - The error message to display.

function displayError(message) {
  document.getElementById("scan-error").textContent = message;
}

// Clear any displayed error message.

function clearError() {
  document.getElementById("scan-error").textContent = "";
}

// Show the skeleton loader overlay.

function showSkeletonLoader() {
  document.getElementById("skeletonLoader").style.display = "flex";
  document.getElementById("scan-status").style.display = "none";
}

// Hide the skeleton loader overlay.

function hideSkeletonLoader() {
  document.getElementById("skeletonLoader").style.display = "none";
}


// Display a visual confirmation overlay with the found product name,
// then redirect to the product info page.
// @param {string} productName - The name of the product found.

function showConfirmationOverlay(productName) {
  const scannerBox = document.getElementById("scannerBox");
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.color = "#fff";
  overlay.style.fontSize = "1.2rem";
  overlay.style.fontWeight = "bold";
  overlay.textContent = `Found: ${productName}`;
  scannerBox.appendChild(overlay);
  setTimeout(() => {
    scannerBox.removeChild(overlay);
    window.location.href = "productinfo.html";
  }, 1000);
}


// Get recycling tips from ChatGPT for a given product name.
// @param {string} productName - The product name.
// @returns {Promise<string>} - Recycling tips or error message.


// Get UK-localised recycling tips from ChatGPT for a given product name.
// @param {string} productName - The product name.
// @returns {Promise<string>} - Recycling tips or error message.

async function getChatGPTRecyclingTips(productName) {
    if (!CONFIG || !CONFIG.OPENAI_API_KEY) {
        console.error("API Key is missing. Ensure config.js is loaded correctly.");
        return "No API Key provided.";
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a recycling assistant based in the UK. Provide practical, UK-specific recycling instructions following local council waste collection rules.

Use the following format:

🗑️ Bin: (e.g., Mixed Recycling, Food Waste, General Waste say the colour of the bin based on UK bins)
🔹 Steps: (short steps suitable for UK users)
♻️ Alternative: (If the item is not recyclable, suggest an eco-friendly disposal or reuse option)
💡 Extra Tip: (Optional fact or advice)

Assume the user is in England. Keep the entire response under 100 words.`
                    },
                    { role: "user", content: `How should I recycle a ${productName}?` }
                ],
                max_tokens: 300
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "No recycling info available.";
    } catch (error) {
        console.error("Error fetching recycling tips:", error);
        return "No recycling info available.";
    }
}



// Lookup a product using its barcode.
// First attempts to get info from OpenFoodFacts, then from a custom backend.
// Updates local storage with the product name and recycling tips.
// @param {string} barcode - The scanned barcode.
// @returns {Promise<boolean>} - True if product recognized, false otherwise.

async function lookupProduct(barcode) {
  clearError();
  showSkeletonLoader();
  let productName = await getProductFromOpenFoodFacts(barcode);
  if (!productName) {
    productName = await getProductFromBackend(barcode);
  }
  if (!productName) {
    displayError("Barcode not recognized. Please try again or enter manually.");
    setTimeout(hideSkeletonLoader, 1000);
    return false;
  }
  const tips = await getChatGPTRecyclingTips(productName);
  localStorage.setItem("productName", productName);
  localStorage.setItem("recyclingTips", tips);
  setTimeout(() => {
    hideSkeletonLoader();
    showConfirmationOverlay(productName);
  }, 500);
  return true;
}


// Fetch product information from the OpenFoodFacts API.
// @param {string} barcode - The barcode.
// @returns {Promise<string|null>} - The product name if found, or null.

async function getProductFromOpenFoodFacts(barcode) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    return data.status === 1 ? (data.product.product_name || "Unnamed Product") : null;
  } catch (error) {
    console.error("Error fetching from Open Food Facts:", error);
    return null;
  }
}

//Fetch product information from a custom backend.
//@param {string} barcode - The barcode.
// @returns {Promise<string|null>} - The product title if found, or null.
 
async function getProductFromBackend(barcode) {
  try {
    const response = await fetch(`${backendUrl}/api/barcode/${barcode}`);
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      return data.products[0].title;
    }
    return null;
  } catch (error) {
    console.error("Error fetching from backend proxy:", error);
    return null;
  }
}


// Initialize and start the barcode scanner using QuaggaJS.
// Sets up the live video stream and checks for zoom and torch capabilities.

function startScanner() {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector("#interactive"),
      constraints: { 
        width: 640, 
        height: 480, 
        facingMode: "environment" 
      }
    },
    decoder: { readers: ["ean_reader", "upc_reader"] }
  }, function(err) {
    // Hide spinner overlay after initialization
    document.getElementById("spinnerOverlay").style.display = "none";
    if (err) {
      console.error("QuaggaJS initialization failed:", err);
      displayError("Camera access failed. Please allow permissions.");
      return;
    }
    Quagga.start();
    Quagga.onDetected(handleDetected);

    // After the video stream starts, check for zoom and torch support
    setTimeout(async () => {
      const video = document.querySelector("#interactive video");
      if (video && video.srcObject) {
        videoTrack = video.srcObject.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.getCapabilities === "function") {
          const capabilities = videoTrack.getCapabilities();
          // Enable zoom controls if supported
          if (capabilities.zoom) {
            document.getElementById("zoomControls").style.display = "flex";
            document.getElementById("zoomMessage").style.display = "block";
            applyZoom(1, capabilities);
            document.querySelectorAll(".zoom-option").forEach(option => {
              option.addEventListener("click", () => {
                const desiredZoom = parseFloat(option.dataset.zoom);
                applyZoom(desiredZoom, capabilities);
                document.querySelectorAll(".zoom-option").forEach(o => o.classList.remove("active"));
                option.classList.add("active");
              });
            });
          } else {
            console.log("Zoom capability not supported on this device.");
          }
          // Enable torch (flash) toggle if supported
          if (capabilities.torch) {
            const flashToggle = document.getElementById("flashToggle");
            flashToggle.style.display = "block";
            flashToggle.addEventListener("click", async () => {
              flashEnabled = !flashEnabled;
              try {
                await videoTrack.applyConstraints({ advanced: [{ torch: flashEnabled }] });
                flashToggle.textContent = flashEnabled ? "Flash On" : "Flash Off";
                flashToggle.classList.toggle("active", flashEnabled);
              } catch (error) {
                console.warn("Error toggling flash:", error);
              }
            });
          } else {
            console.log("Torch capability not supported on this device.");
          }
        }
      }
    }, 1000);
  });
}

// Handler for QuaggaJS's onDetected event.
// Processes the detected barcode and stops scanning if the product is recognized.
// @param {Object} result - The result object from QuaggaJS.

async function handleDetected(result) {
  // Remove the detection event listener to avoid duplicate handling
  Quagga.offDetected(handleDetected);
  const recognized = await lookupProduct(result.codeResult.code);
  if (!recognized) {
    // Reattach detection if the product wasn't recognized
    Quagga.onDetected(handleDetected);
  } else {
    // Stop the scanner if the product was recognized
    Quagga.stop();
  }
}

// Apply zoom to the video stream.
// @param {number} value - The desired zoom value.
// @param {Object} capabilities - The video track capabilities.

async function applyZoom(value, capabilities) {
  if (!videoTrack) return;
  const clampedValue = Math.max(capabilities.zoom.min, Math.min(capabilities.zoom.max, value));
  try {
    await videoTrack.applyConstraints({ advanced: [{ zoom: clampedValue }] });
    console.log(`Zoom set to: ${clampedValue}x`);
  } catch (error) {
    console.warn("Error applying zoom constraints:", error);
  }
}

// DOM Content Loaded: Start Scanner and Attach Manual Lookup Handler


document.addEventListener("DOMContentLoaded", function() {
  startScanner();

  // Manual barcode lookup event listener
  const lookupBtn = document.getElementById("lookup-barcode");
  lookupBtn.addEventListener("click", async function() {
    const barcode = document.getElementById("manual-barcode").value.trim();
    if (!barcode) return;
    lookupBtn.disabled = true;
    lookupBtn.textContent = "Loading...";
    const recognized = await lookupProduct(barcode);
    lookupBtn.disabled = false;
    lookupBtn.textContent = "Look Up Product";
    if (!recognized) {
      // Reattach detection if manual lookup fails
      Quagga.onDetected(handleDetected);
    }
  });
});
