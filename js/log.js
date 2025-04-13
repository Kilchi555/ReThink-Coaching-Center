// /js/log.js
import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function logNoteChange({ autorUid, zielUid, inhalt, typ }) {
  const ref = collection(db, "logs", "notizen", "eintraege");
  await addDoc(ref, {
    autorUid,
    zielUid,
    inhalt,
    typ, // z. B. "kundenNotiz", "mitarbeiterNotiz"
    timestamp: serverTimestamp()
  });
}

import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.logout = async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "login.html";
};
