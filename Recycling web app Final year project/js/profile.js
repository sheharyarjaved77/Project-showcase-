// Global variable to store full recycling history
let allHistory = [];
let showingAll = false;


// Renders history items inside the history container.
// @param {Array} items - An array of recycling history objects.

function renderHistoryItems(items) {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("history-item");
    div.innerHTML = `
      <img src="../assets/icons/recycle-icon.png" alt="Item Icon" class="history-icon" />
      <div>
        <strong>${item.product}</strong><br>
        <small>${new Date(item.timestamp).toLocaleString()}</small> - ${item.pointsEarned} Points
      </div>
    `;
    historyList.appendChild(div);
  });
}

// Calculates the recycling streak (in days) based on recycling history.

function calculateStreak(recycleHistory) {
  if (!recycleHistory || recycleHistory.length === 0) return 0;
  const sortedHistory = recycleHistory.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  let streak = 1;
  let prev = new Date(sortedHistory[0].timestamp);
  prev.setHours(0, 0, 0, 0);
  for (let i = 1; i < sortedHistory.length; i++) {
    let current = new Date(sortedHistory[i].timestamp);
    current.setHours(0, 0, 0, 0);
    const diffDays = (prev - current) / (1000 * 60 * 60 * 24);
    if (diffDays >= 1 && diffDays < 2) {
      streak++;
      prev = current;
    } else if (diffDays < 1) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

// Determines which badges to award based on items recycled and streak.

function determineBadges(itemsRecycled, streak) {
  const badges = [];
  if (itemsRecycled > 0) {
    badges.push({ title: "First Recycle", icon: "../assets/icons/first-recycle.png" });
  }
  if (itemsRecycled >= 10) {
    badges.push({ title: "10 Items Recycled", icon: "../assets/icons/10-recycled.png" });
  }
  if (itemsRecycled >= 30) {
    badges.push({ title: "30 Items Recycled", icon: "../assets/icons/30-recycled.png" });
  }
  if (streak >= 7) {
    badges.push({ title: "7-Day Streak", icon: "../assets/icons/7-day.png" });
  }
  if (streak >= 30) {
    badges.push({ title: "30-Day Streak", icon: "../assets/icons/30-day.png" });
  }
  return badges;
}

// Renders achievement badges inside the achievements container.

function renderAchievements(badges) {
  const achievementsContainer = document.getElementById("achievementsContainer");
  achievementsContainer.innerHTML = "";
  badges.forEach((badge) => {
    const badgeEl = document.createElement("div");
    badgeEl.classList.add("achievement-card");
    badgeEl.innerHTML = `<img src="${badge.icon}" alt="${badge.title} Icon" /> ${badge.title}`;
    achievementsContainer.appendChild(badgeEl);
  });
  const toggleBtn = document.getElementById("toggleBadgesBtn");
  toggleBtn.style.display = achievementsContainer.scrollHeight > 50 ? "block" : "none";
}

//Toggles the expansion of the achievements container.
document.getElementById("toggleBadgesBtn").addEventListener("click", function() {
  const container = document.getElementById("achievementsContainer");
  container.classList.toggle("expanded");
  this.textContent = container.classList.contains("expanded") ? "Show Less" : "Show More";
});

// Signs the user out and redirects to the login page.

document.getElementById("signOutBtn").addEventListener("click", () => {
  auth.signOut().then(() => (window.location.href = "login.html"));
});

// Retrieves the user's rank based on points from Firestore.
 
async function getUserRank(uid) {
  const snapshot = await db.collection("users")
    .orderBy("points", "desc")
    .limit(5)
    .get();
  let rank = 1;
  let userRank = null;
  snapshot.forEach((doc) => {
    if (doc.id === uid) {
      userRank = rank;
    }
    rank++;
  });
  return userRank;
}

// Fetches user data from Firestore and updates the Profile page.

firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const userDocRef = db.collection("users").doc(uid);
  const docSnap = await userDocRef.get();

  if (docSnap.exists) {
    const data = docSnap.data();

    // Secure: Get email from Firebase Auth only
    document.getElementById("userName").textContent = data.name || "N/A";
    document.getElementById("userEmail").textContent = user.email || "N/A";

    // Recycling history
    const historyList = document.getElementById("historyList");
    const viewAllBtn = document.getElementById("viewAllBtn");
    if (data.recycleHistory && data.recycleHistory.length > 0) {
      allHistory = data.recycleHistory.slice().reverse();
      if (allHistory.length > 5) {
        renderHistoryItems(allHistory.slice(0, 5));
        viewAllBtn.style.display = "inline-block";
      } else {
        renderHistoryItems(allHistory);
        viewAllBtn.style.display = "none";
      }
    } else {
      historyList.innerHTML = "<p>No recycling history yet.</p>";
    }

    // Gamification
    const recycleHistory = data.recycleHistory || [];
    const streak = calculateStreak(recycleHistory);
    const badges = determineBadges(data.itemsRecycled || 0, streak);
    document.getElementById("streakValue").textContent = `${streak} Day${streak !== 1 ? "s" : ""}`;
    renderAchievements(badges);

    // Leaderboard rank
    const userRank = await getUserRank(uid);
    const rankValue = document.getElementById("rankValue");
    rankValue.textContent = userRank
      ? "Current Rank: #" + userRank
      : "Not on leaderboard";
  }
});
