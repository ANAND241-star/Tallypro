const { initializeApp } = require('firebase/app');
const { getAuth, sendPasswordResetEmail } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyD5-3hAE6tJT2_bM158ckWs0j_8t0UQMPw",
    authDomain: "tallybackend-a1bf0.firebaseapp.com",
    projectId: "tallybackend-a1bf0",
    storageBucket: "tallybackend-a1bf0.firebasestorage.app",
    messagingSenderId: "1094591828824",
    appId: "1:1094591828824:web:be640c95e3037190130b2d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testEmail() {
    const targetEmail = "pjat95015@gmail.com"; // User's known email from .env
    console.log(`[DIAGNOSTICS] Attempting to send password reset to: ${targetEmail}`);
    try {
        await sendPasswordResetEmail(auth, targetEmail);
        console.log("[DIAGNOSTICS] SUCCESS: Firebase accepted the request to send the email.");
        console.log("[DIAGNOSTICS] If it hasn't arrived, the issue is 100% with Gmail Spam filters or Firebase Console quotas.");
    } catch (error) {
        console.error("[DIAGNOSTICS] ERROR:", error.code, error.message);
    }
}

testEmail();
