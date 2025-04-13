import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { checkAuth } from "./auth.js";

checkAuth(["kunde", "admin"]);

onAuthStateChanged(auth, async user => {
  const sessionRolle = sessionStorage.getItem("rolle");
  const urlUid = new URLSearchParams(window.location.search).get("uid");

  // Wenn Admin + URL-UID vorhanden → lade fremden Nutzer
  const targetUid = (sessionRolle === "admin" && urlUid) ? urlUid : user.uid;

  const notizRef = doc(db, "users", targetUid, "notizen", "persoenlich");
  const snap = await getDoc(notizRef);
  document.getElementById("notizfeld").value = snap.exists() ? snap.data().text : "";

  // Nur eigene Notizen dürfen bearbeitet werden
  const textarea = document.getElementById("notizfeld");
  const speichernBtn = document.querySelector("button");

  const istEigeneSicht = (targetUid === user.uid);

  textarea.disabled = !istEigeneSicht;
  speichernBtn.style.display = istEigeneSicht ? "block" : "none";

  if (!istEigeneSicht) {
    console.log("Admin liest fremde Notiz");
  }
});

window.speichern = async () => {
  const user = auth.currentUser;
  const notizRef = doc(db, "users", user.uid, "notizen", "persoenlich");
  const text = document.getElementById("notizfeld").value;
  await setDoc(notizRef, { text });
};

import { logNoteChange } from './log.js';

window.speichern = async () => {
  const user = auth.currentUser;
  const uid = user.uid;
  const text = document.getElementById("notizfeld").value;

  const ref = doc(db, "users", uid, "notizen", "persoenlich");
  await setDoc(ref, { text });

  await logNoteChange({
    autorUid: uid,
    zielUid: uid,
    inhalt: text,
    typ: "kundenNotiz"
  });
};

import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.logout = async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "login.html";
};
