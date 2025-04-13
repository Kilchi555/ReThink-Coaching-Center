import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { checkAuth } from "./auth.js";

checkAuth(["admin"]);

onAuthStateChanged(auth, async user => {
  const logsRef = collection(db, "logs", "notizen", "eintraege");
  const q = query(logsRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  const logList = document.getElementById("logList");
  snapshot.forEach(doc => {
    const data = doc.data();
    const ts = data.timestamp?.toDate().toLocaleString("de-DE") || "unbekannt";
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${data.typ}</strong>: Von <code>${data.autorUid}</code> für <code>${data.zielUid}</code><br>
      Inhalt: <em>${data.inhalt}</em><br>
      Zeit: ${ts}
    `;
    logList.appendChild(li);
  });
});
