const { initializeApp } = require('firebase/app');
const { getAuth, fetchSignInMethodsForEmail } = require('firebase/auth');

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

async function checkProviders() {
    const targetEmail = "pjat95015@gmail.com";
    console.log(`[PROVIDER CHECK] Checking sign-in methods for: ${targetEmail}`);
    try {
        const methods = await fetchSignInMethodsForEmail(auth, targetEmail);
        console.log("[PROVIDER CHECK] Methods found:", methods);
        if (methods.length === 0) {
            console.log("[INFO] No account exists for this email, so NO password reset email will be sent.");
        } else if (methods.includes('google.com') && !methods.includes('password')) {
            console.log("[INFO] Account exists but only via Google. No password reset email will be sent.");
        }
    } catch (error) {
        if (error.code === 'auth/admin-restricted-operation') {
            console.log("Email Enumeration Protection is likely enabled so we can't check client-side.");
        } else {
            console.error("[ERROR]:", error);
        }
    }
}

checkProviders();
