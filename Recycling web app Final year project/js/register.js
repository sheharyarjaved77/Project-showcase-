registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = registerForm["name"].value;
  const email = registerForm["email"].value;
  const password = registerForm["password"].value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      const uid = cred.user.uid;

      // Only store public leaderboard info — no email
      return db.collection("users").doc(uid).set({
        name: name,
        points: 0,
        badges: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      window.location.href = "home.html";
    })
    .catch((err) => {
      alert("Registration failed: " + err.message);
    });
});
