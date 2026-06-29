let capturedImageBlob = null;
let stream = null;


// Camera Functions

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    document.getElementById('video').srcObject = stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert("Cannot access camera. Please check your device settings and ensure you have granted permission for camera access.");
  }
}

function capturePhoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const capturedImage = document.getElementById('capturedImage');
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    capturedImageBlob = blob;
    const imageUrl = URL.createObjectURL(blob);
    capturedImage.src = imageUrl;
    capturedImage.style.display = "block";
    capturedImage.style.opacity = 0;
    setTimeout(() => { capturedImage.style.opacity = 1; }, 50);
    video.style.opacity = 0;
    setTimeout(() => { video.style.display = "none"; }, 500);
    document.getElementById("confirmBtn").style.display = "block";
    document.getElementById("retakeBtn").style.display = "block";
    document.getElementById("captureBtn").style.display = "none";
  }, 'image/jpeg');
}

function showCameraAgain() {
  capturedImageBlob = null;
  document.getElementById('capturedImage').style.display = "none";
  const video = document.getElementById('video');
  video.style.display = "block";
  video.style.opacity = 1;
  document.getElementById("confirmBtn").style.display = "none";
  document.getElementById("retakeBtn").style.display = "none";
  document.getElementById("captureBtn").style.display = "block";
}


// Firebase Data Update Function 


async function updateRecyclingData(uid) {
  const userDocRef = db.collection('users').doc(uid);
  const newHistoryItem = {
    product: localStorage.getItem("productName") || "Unknown Product",
    timestamp: new Date().toISOString(),
    pointsEarned: 10
  };
  await userDocRef.update({
    points: firebase.firestore.FieldValue.increment(10),
    itemsRecycled: firebase.firestore.FieldValue.increment(1),
    itemsRecycledToday: firebase.firestore.FieldValue.increment(1),
    recycleHistory: firebase.firestore.FieldValue.arrayUnion(newHistoryItem)
  });
}

// Photo Verification with ChatGPT


async function verifyPhotoWithChatGPT(photoBlob) {
  if (!CONFIG || !CONFIG.OPENAI_API_KEY) {
    console.error("OpenAI API Key is missing! Check config.js.");
    return false;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(photoBlob);
    reader.onload = async function () {
      try {
        const base64Image = reader.result.split(',')[1];
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
                content: "You are an AI that verifies images for bins. Respond with 'Yes' if the image clearly shows a bin, otherwise respond with 'No'."
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Does this image contain a bin?" },
                  { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                ]
              }
            ],
            max_tokens: 10
          })
        });
        if (!response.ok) {
          console.error("OpenAI API Error:", await response.text());
          reject(false);
          return;
        }
        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content?.trim().toLowerCase();
        console.log("ChatGPT Response:", answer);
        resolve(answer.includes("yes"));
      } catch (error) {
        console.error("Error verifying photo:", error);
        reject(false);
      }
    };
    reader.onerror = function (error) {
      console.error("Error reading image file:", error);
      reject(false);
    };
  });
}


// Event Handlers for UI Buttons


document.addEventListener("DOMContentLoaded", function() {
  startCamera();

  document.getElementById("captureBtn").addEventListener("click", capturePhoto);
  document.getElementById("retakeBtn").addEventListener("click", showCameraAgain);

  document.getElementById("confirmBtn").addEventListener("click", async () => {
    firebase.auth().onAuthStateChanged(async user => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      const uid = user.uid;
      if (!capturedImageBlob) {
        alert("Please capture a photo before confirming.");
        return;
      }
      try {
        document.getElementById("loadingPopup").style.display = "block";
        const binVerified = await verifyPhotoWithChatGPT(capturedImageBlob);
        document.getElementById("loadingPopup").style.display = "none";
        if (!binVerified) {
          document.getElementById("failurePopup").style.display = "block";
          return;
        }
        await updateRecyclingData(uid);
        document.getElementById("popup").style.display = "block";
      } catch (err) {
        document.getElementById("loadingPopup").style.display = "none";
        console.error("Error during verification:", err);
        alert("An error occurred during verification. Please try again.");
      }
    });
  });

  document.getElementById("skipBtn").addEventListener("click", async () => {
    firebase.auth().onAuthStateChanged(async user => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      const uid = user.uid;
      try {
        await updateRecyclingData(uid);
        document.getElementById("popup").style.display = "block";
      } catch (err) {
        console.error("Error:", err);
        alert("An error occurred. Please try again.");
      }
    });
  });

  document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("popup").style.display = "none";
    window.location.href = "home.html";
  });

  document.getElementById("closeFailurePopup").addEventListener("click", () => {
    document.getElementById("failurePopup").style.display = "none";
    showCameraAgain();
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = "home.html";
  });

  // Show Skip button for all logged-in users
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      document.getElementById("skipBtn").style.display = "block";
    }
  });
});
