// === Firebase 核心設定 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

//⚠️ 請在此處填入您的 Firebase 專案設定
const firebaseConfig = {
  apiKey: "AIzaSyC7rVKcrDV8DBRuzJlxd4wD0QEGzJZnGhs",
  authDomain: "wedding-e-sign.firebaseapp.com",
  projectId: "wedding-e-sign",
  storageBucket: "wedding-e-sign.firebasestorage.app",
  messagingSenderId: "119317618164",
  appId: "1:119317618164:web:de97e40d34919b30fd6da1"
};

// 初始化
const app = initializeApp(firebaseConfig);

// === 修改點：加上 export 關鍵字，讓 wall.js 可以共用 ===
export const db = getFirestore(app);
export const auth = getAuth(app);

// 匿名登入 (確保有權限寫入)
async function initAuth() {
    try {
        await signInAnonymously(auth);
        console.log("🔥 Firebase: 匿名登入成功");
    } catch (error) {
        console.error("Firebase 登入失敗:", error);
    }
}
initAuth();

// 儲存資料函式
export async function saveToCloud(data) {
    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
    const collectionRef = collection(db, "guests");
    return addDoc(collectionRef, {
        ...data,
        timestamp: serverTimestamp(),
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    });

}
