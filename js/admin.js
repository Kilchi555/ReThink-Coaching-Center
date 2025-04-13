import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { checkAuth } from "./auth.js";

checkAuth(["admin"]);

onAuthStateChanged(auth, async (user) => {
  const list = document.getElementById("benutzerListe");
  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");

    li.innerHTML = `
  <strong>${data.name || docSnap.id}</strong>
  - Rolle: 
  <select data-uid="${docSnap.id}">
    <option ${data.rolle === 'kunde' ? 'selected' : ''}>kunde</option>
    <option ${data.rolle === 'mitarbeiter' ? 'selected' : ''}>mitarbeiter</option>
    <option ${data.rolle === 'admin' ? 'selected' : ''}>admin</option>
  </select>
  - <a href="kunden.html?uid=${docSnap.id}">Zum Profil</a>
`;


    list.appendChild(li);
  });
});

list.addEventListener('change', async (e) => {
    if (e.target.tagName === "SELECT") {
      const uid = e.target.getAttribute("data-uid");
      const neueRolle = e.target.value;
  
      await setDoc(doc(db, "users", uid), { rolle: neueRolle }, { merge: true });
      alert(`Rolle von ${uid} wurde zu ${neueRolle} geändert.`);
    }
  });
  
  import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.logout = async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "login.html";
};
