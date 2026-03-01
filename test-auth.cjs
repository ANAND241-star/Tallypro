const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyD5-3hAE6tJT2_bM158ckWs0j_8t0UQMPw",
    authDomain: "tallybackend-a1bf0.firebaseapp.com",
    projectId: "tallybackend-a1bf0",
    storageBucket: "tallybackend-a1bf0.firebasestorage.app",
    messagingSenderId: "1094591828824",
    appId: "1:1094591828824:web:be640c95e3037190130b2d",
    measurementId: "G-XB6C1JVXPY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testAuth() {
    const testEmail = `test_${Date.now()}@anduriltech.in`;
    const testPassword = "Password123!";

    console.log(`[TEST] Starting tests with email: ${testEmail}`);

    try {
        console.log("[TEST] Attempting Signup...");
        const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        console.log("[TEST] Signup Success! UID:", userCredential.user.uid);

        console.log("[TEST] Attempting Login with Correct Password...");
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log("[TEST] Login Success!");

        console.log("[TEST] Attempting Login with Wrong Password...");
        try {
            await signInWithEmailAndPassword(auth, testEmail, "WrongPassword123!");
        } catch (err) {
            console.log("[TEST] Expected Login Error:", err.code);
        }

        console.log("[TEST] Attempting Password Reset...");
        await sendPasswordResetEmail(auth, testEmail);
        console.log("[TEST] Password Reset Request Sent successfully.");

        // Clean up
        console.log("[TEST] Cleaning up test user...");
        await deleteUser(userCredential.user);
        console.log("[TEST] Cleanup complete.");

    } catch (error) {
        console.error("[TEST] Error Encountered:", error.code, error.message);
    }
}

testAuth();
