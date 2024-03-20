import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCf1dQRFZMpwjpWvqQ0xy1MKuuyF3jgbZE",
  authDomain: "online-store-9d44e.firebaseapp.com",
  projectId: "online-store-9d44e",
  storageBucket: "online-store-9d44e.appspot.com",
  messagingSenderId: "291500312353",
  appId: "1:291500312353:web:2204583be6be6830c1e060",
  measurementId: "G-92JHSL94KD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submitData = document.getElementById("submit");
const forgotEmail = document.getElementById("email");

submitData.addEventListener("click", () => {
    const email = forgotEmail.value;
    sendPasswordResetEmail(auth, email)
        .then(() => {
            forgotEmail.value = "";
            Swal.fire("Congratulation!", "Your Password reset link has been sent to your email!", "success");
            // Redirect to login page after 4 seconds
            setTimeout(() => {
                window.location.href = "login.html";
            }, 4000);
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);
            const errorMessage = error.message;
            Swal.fire("Oops!", errorMessage, "error");
        });
});
