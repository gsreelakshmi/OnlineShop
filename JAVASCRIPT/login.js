// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCf1dQRFZMpwjpWvqQ0xy1MKuuyF3jgbZE",
  authDomain: "online-store-9d44e.firebaseapp.com",
  projectId: "online-store-9d44e",
  storageBucket: "online-store-9d44e.appspot.com",
  messagingSenderId: "291500312353",
  appId: "1:291500312353:web:2204583be6be6830c1e060",
  measurementId: "G-92JHSL94KD"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

var email = document.getElementById("email");
var password = document.getElementById("password");
window.login= function(e) {
  e.preventDefault();
  var obj = {
    email: email.value,
    password: password.value,
  };

  signInWithEmailAndPassword(auth, obj.email, obj.password)
    .then(function (success) {
      var aaaa =  (success.user.uid);
      localStorage.setItem("uid",aaaa)
      console.log(aaaa)
      if(obj.email=="sreegiri27@gmail.com"){
        window.location.replace('admin.html');
      }
      else{
        window.location.replace('customerdashboard.html');
      }
      
    })
    .catch(function (err) {
      alert("login error"+err);
    });

  console.log(obj);
}


