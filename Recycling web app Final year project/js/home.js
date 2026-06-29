// Expanded Recycling Tips Array
const recyclingTips = [
  "Did you know? Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
  "Tip: Rinse your recyclables to avoid contamination.",
  "Fun Fact: Recycling one ton of paper can save 17 trees.",
  "Remember: Recycling plastic helps reduce harmful landfill waste.",
  "Did you know? Glass can be recycled endlessly without losing quality.",
  "Tip: Separate your paper, plastic, and metal for efficient recycling.",
  "Fun Fact: Recycling one glass bottle saves enough energy to light a 60-watt bulb for 4 hours.",
  "Remember: Reduce, Reuse, Recycle - the 3 R's make a big impact!",
  "Tip: Check local guidelines to recycle correctly and prevent contamination.",
  "Did you know? Recycling saves up to 95% of the energy used in producing new products."
];

function getRandomTip() {
  const randomIndex = Math.floor(Math.random() * recyclingTips.length);
  return recyclingTips[randomIndex];
}

// Count-up animation using requestAnimationFrame for a 300ms duration
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  const startTime = performance.now();
  function updateValue(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    obj.textContent = Math.floor(start + progress * (end - start));
    if (progress < 1) {
      requestAnimationFrame(updateValue);
    } else {
      obj.textContent = end; // Ensure exact final value
    }
  }
  requestAnimationFrame(updateValue);
}

// Flags for goal completion notifications (once per session)
let dailyGoalCompletedShown = false;
let monthlyGoalCompletedShown = false;

document.getElementById("closeGoalPopup").addEventListener("click", () => {
  document.getElementById("goalPopup").style.display = "none";
});

// Modal logic for metric details
function showModal(message) {
  document.getElementById("modalText").textContent = message;
  document.getElementById("detailsModal").style.display = "block";
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("detailsModal").style.display = "none";
});

// Firebase authentication state change
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const uid = user.uid;
  const userDocRef = db.collection("users").doc(uid);

  userDocRef.onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      // Animate overview metrics (300ms duration)
      animateValue("points", Number(document.getElementById("points").textContent), data.points || 0, 300);
      animateValue("itemsRecycled", Number(document.getElementById("itemsRecycled").textContent), data.itemsRecycled || 0, 300);
      animateValue("itemsRecycledToday", Number(document.getElementById("itemsRecycledToday").textContent), data.itemsRecycledToday || 0, 300);

      // Calculate CO₂ saved (0.01 kg per recycled item)
      const newCo2Saved = (Number(data.itemsRecycled) * 0.01).toFixed(1);
      document.getElementById("co2Saved").textContent = newCo2Saved + " kg";

      // Set motivational message based on daily progress
      const dailyGoalVal = Number(data.dailyGoal);
      const itemsRecycledToday = Number(data.itemsRecycledToday) || 0;
      const motivationalMessage = document.getElementById("motivationalMessage");
      if (dailyGoalVal > 0 && itemsRecycledToday >= dailyGoalVal) {
        motivationalMessage.textContent = "Great job! You've met your daily goal!";
        motivationalMessage.style.color = "green";
      } else {
        motivationalMessage.textContent = "Keep it up, you can do more today!";
        motivationalMessage.style.color = "orange";
      }

      // Update Goals Dashboard values and progress bars
      document.getElementById("dailyGoal").value = data.dailyGoal || "";
      document.getElementById("monthlyGoal").value = data.monthlyGoal || "";

      const monthlyGoalVal = Number(data.monthlyGoal);
      const itemsRecycled = Number(data.itemsRecycled) || 0;
      const dailyProgressBar = document.getElementById("dailyProgressBar");
      const monthlyProgressBar = document.getElementById("monthlyProgressBar");
      const dailyProgressText = document.getElementById("dailyProgressText");
      const monthlyProgressText = document.getElementById("monthlyProgressText");

      if (dailyGoalVal > 0) {
        let progressValue = Math.min(itemsRecycledToday, dailyGoalVal);
        dailyProgressBar.value = progressValue;
        dailyProgressBar.max = dailyGoalVal;
        let percentage = Math.round((progressValue / dailyGoalVal) * 100);
        dailyProgressText.textContent = percentage + "%";
        if (percentage >= 100 && !dailyGoalCompletedShown) {
          dailyGoalCompletedShown = true;
          showGoalPopup("Congratulations! You've reached your daily goal!");
        }
      } else {
        dailyProgressBar.value = 0;
        dailyProgressBar.max = 100;
        dailyProgressText.textContent = "0%";
      }

      if (monthlyGoalVal > 0) {
        let progressValue = Math.min(itemsRecycled, monthlyGoalVal);
        monthlyProgressBar.value = progressValue;
        monthlyProgressBar.max = monthlyGoalVal;
        let percentage = Math.round((progressValue / monthlyGoalVal) * 100);
        monthlyProgressText.textContent = percentage + "%";
        if (percentage >= 100 && !monthlyGoalCompletedShown) {
          monthlyGoalCompletedShown = true;
          showGoalPopup("Amazing! You've reached your monthly goal!");
        }
      } else {
        monthlyProgressBar.value = 0;
        monthlyProgressBar.max = 100;
        monthlyProgressText.textContent = "0%";
      }
    }
  });

  const dailyGoalInput = document.getElementById("dailyGoal");
  const monthlyGoalInput = document.getElementById("monthlyGoal");

  dailyGoalInput.addEventListener("change", () => {
    const newDailyGoal = Number(dailyGoalInput.value);
    userDocRef.update({ dailyGoal: newDailyGoal })
      .catch(err => console.error("Error updating dailyGoal:", err));
  });

  monthlyGoalInput.addEventListener("change", () => {
    const newMonthlyGoal = Number(monthlyGoalInput.value);
    userDocRef.update({ monthlyGoal: newMonthlyGoal })
      .catch(err => console.error("Error updating monthlyGoal:", err));
  });

  // Update Leaderboard and Achievement
  db.collection("users").orderBy("points", "desc").limit(5).onSnapshot(snapshot => {
    const leaderboardTable = document.getElementById("leaderboardTable");
    leaderboardTable.innerHTML = "";
    let rank = 1;
    let userRank = null;
    snapshot.forEach(doc => {
      const userData = doc.data();
      let rankContent = "";
      if (rank === 1) {
        rankContent = '<img class="medal-icon" src="../assets/icons/gold-medal.png" alt="Gold Medal">';
      } else if (rank === 2) {
        rankContent = '<img class="medal-icon" src="../assets/icons/silver-medal.png" alt="Silver Medal">';
      } else if (rank === 3) {
        rankContent = '<img class="medal-icon" src="../assets/icons/bronze-medal.png" alt="Bronze Medal">';
      } else {
        rankContent = '<div class="rank-number">' + rank + '</div>';
      }
      if (doc.id === uid) {
        userRank = rank;
      }
      const highlightClass = doc.id === uid ? "highlight" : "";
      leaderboardTable.innerHTML += `<tr class="fade-in ${highlightClass}"><td>${rankContent}</td><td>${userData.name || "Anonymous"}</td><td>${userData.points || 0}</td></tr>`;
      rank++;
    });
    // Update achievement display in Goals Dashboard if user is in top 5
    const achievementDiv = document.getElementById("achievement");
    achievementDiv.textContent = userRank !== null
      ? "Your Achievement: Ranked #" + userRank + " in Leaderboard"
      : "";
  });

  // Display a random tip initially with fade effect
  const tipElement = document.getElementById("recyclingTip");
  tipElement.style.opacity = 1;
  tipElement.textContent = getRandomTip();

  // Event listener for shuffle button with fade-out/in transition
  document.getElementById("shuffleTipBtn").addEventListener("click", () => {
    tipElement.style.opacity = 0;
    setTimeout(() => {
      tipElement.textContent = getRandomTip();
      tipElement.style.opacity = 1;
    }, 300);
  });
});

function showGoalPopup(message) {
  const popup = document.getElementById("goalPopup");
  document.getElementById("goalPopupMessage").textContent = message;
  popup.style.display = "block";
}
