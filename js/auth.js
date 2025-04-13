// /js/auth.js
import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function login(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    console.log("Anmeldung erfolgreich, Benutzer-ID:", uid);

    const roleRef = doc(db, "users", uid);
    const snap = await getDoc(roleRef);

    if (snap.exists() && snap.data()?.rolle) {
      const rolle = snap.data().rolle;
      sessionStorage.setItem("uid", uid);
      sessionStorage.setItem("rolle", rolle);
      console.log("Benutzerrolle abgerufen:", rolle);

      if (rolle === "admin") window.location.href = "admin.html";
      else if (rolle === "mitarbeiter") window.location.href = "mitarbeiter.html";
      else if (rolle === "kunde") window.location.href = "kunden.html";
      else {
        alert("Ungültige Benutzerrolle: " + rolle);
        await signOut(auth);
        window.location.href = "login.html";
      }
    } else {
      alert("Benutzerrolle nicht gefunden.");
      await signOut(auth);
      window.location.href = "login.html";
    }

  } catch (error) {
    alert("Login fehlgeschlagen: " + error.message);
    console.error("Login-Fehler:", error);
  }
}

export async function register(email, password, rolle) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    console.log("Registrierung erfolgreich, Benutzer-ID:", uid);

    // Speichern der Benutzerrolle in der Firestore-Datenbank
    await setDoc(doc(db, "users", uid), {
      rolle: rolle
    });

    alert("Registrierung erfolgreich. Sie können sich nun anmelden.");
    window.location.href = "login.html"; // Weiterleiten zur Login-Seite nach erfolgreicher Registrierung

  } catch (error) {
    alert("Registrierung fehlgeschlagen: " + error.message);
    console.error("Registrierungsfehler:", error);
  }
}

export function checkAuth(allowedRoles) {
  onAuthStateChanged(auth, user => {
    const rolle = sessionStorage.getItem("rolle");
    if (!user || !rolle || !allowedRoles.includes(rolle)) {
      sessionStorage.clear();
      window.location.href = "login.html";
    } else {
      console.log("Benutzer authentifiziert mit Rolle:", rolle);
    }
  });
}

window.logout = async () => {
  try {
    await signOut(auth);
    sessionStorage.clear();
    console.log("Benutzer erfolgreich ausgeloggt.");
    window.location.href = "login.html";
  } catch (error) {
    alert("Logout fehlgeschlagen: " + error.message);
    console.error("Logout-Fehler:", error);
  }
};