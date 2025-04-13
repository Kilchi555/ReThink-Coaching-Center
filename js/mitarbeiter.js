// /js/mitarbeiter.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { checkAuth } from "./auth.js";

checkAuth(["mitarbeiter"]);

window.speichern = async () => {
  const mitarbeiter = auth.currentUser.uid;
  const kunde = document.getElementById("kundeId").value;
  const text = document.getElementById("notiz").value;

  const ref = doc(db, "users", kunde, "mitarbeiterNotizen", mitarbeiter);
  await setDoc(ref, { text });
  alert("Gespeichert");
};

import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.logout = async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "login.html";
};
