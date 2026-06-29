document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      window.location.href = "home.html";
    })
    .catch(err => {
      alert(err.message);
    });
});
