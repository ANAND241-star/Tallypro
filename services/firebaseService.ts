import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDoc,
    setDoc,
    onSnapshot
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from './firebaseConfig';
import { db as mockDb } from './mockDatabase';
import { User, TDLProduct, Order, Ticket, Feedback } from '../types';

export class FirebaseDatabaseService {

    // --- Products ---
    async getProducts(): Promise<TDLProduct[]> {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products: TDLProduct[] = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as TDLProduct);
        });
        return products;
    }

    subscribeProducts(callback: (products: TDLProduct[]) => void): () => void {
        return onSnapshot(collection(db, "products"), (snapshot) => {
            const products: TDLProduct[] = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as TDLProduct);
            });
            callback(products);
        });
    }

    async addProduct(product: TDLProduct): Promise<TDLProduct> {
        // We intentionally ignore the passed 'id' if we want auto-gen, 
        // but preserving the mock logic's style:
        // Ideally, let firestore allow generating the ID or use a custom one.
        // Let's use addDoc for auto-id, but if product has an id (from type), 
        // strict types say it does. 
        // For TDLProduct, usually we create a new one without ID then assign it.
        // Here we'll take the object excluding ID and let Firestore generate it, 
        // or use setDoc if we really want a specific ID.

        // For simplicity consistent with typical firestore usage:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...data } = product; // remove potential local ID
        const docRef = await addDoc(collection(db, "products"), data);
        return { id: docRef.id, ...data } as TDLProduct;
    }

    async updateProduct(id: string, updates: Partial<TDLProduct>): Promise<void> {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, updates);
    }

    async deleteProduct(id: string): Promise<void> {
        // Soft delete as per previous logic or hard delete?
        // Previous logic was: await this.updateProduct(id, { active: false });
        // Let's stick to update to keep it consistent, strictly speaking the interface said deleteProduct
        // but the implementation did soft delete. Let's do soft delete to be safe.
        await this.updateProduct(id, { active: false });
    }

    // --- Users & Auth ---
    // Note: "getUsers" acts as an admin feature usually.
    async getUsers(): Promise<User[]> {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });
        return users;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as User;
        }
        return undefined;
    }

    async getUserById(uid: string): Promise<User | null> {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as User;
        }
        return null;
    }

    // Replaces "verifyCredentials" - actually logs in
    async login(email: string, password: string): Promise<User | null> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Fetch extra user details from Firestore
            let user = await this.getUserById(userCredential.user.uid);

            const adminEmails = [
                import.meta.env.VITE_ADMIN1_EMAIL,
                import.meta.env.VITE_ADMIN2_EMAIL
            ].filter(Boolean).map(e => e?.toLowerCase());

            const isAdmin = adminEmails.includes(email.toLowerCase());

            // Auto-create Admin Document if missing
            if (!user && isAdmin) {
                user = {
                    id: userCredential.user.uid,
                    name: 'Admin',
                    email: email,
                    role: 'super_admin',
                    status: 'active',
                    joinedAt: new Date().toISOString(),
                    purchasedProducts: []
                };
                await setDoc(doc(db, "users", user.id), user);
            } else if (user && isAdmin && user.role !== 'super_admin') {
                // TODO: Migrate this admin detection to a Cloud Function or Firebase Admin SDK custom claims.
                // Eliminate the use of import.meta.env.VITE_* for admin emails here.
                user.role = 'super_admin'; // Enforce super_admin role
                await updateDoc(doc(db, "users", user.id), { role: 'super_admin' }); // Persist to Firestore
            }

            return user;
        } catch (error: any) {
            console.error("Login error:", error);
            // Show error so UI can react (like auth/user-not-found)
            throw error;
        }
    }

    async logout(): Promise<void> {
        await signOut(auth);
    }

    async signup(user: User, password: string): Promise<User> {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, password);
        const uid = userCredential.user.uid;

        // 2. Create Firestore User Document
        // 2. Create Firestore User Document
        // SECURITY: Exclude password from Firestore document
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...safeUserData } = user;

        const newUser: User = {
            ...safeUserData,
            id: uid, // Use Auth UID as doc ID
            purchasedProducts: [],
            joinedAt: new Date().toISOString()
        } as User;

        await setDoc(doc(db, "users", uid), newUser);
        return newUser;
    }

    // Legacy support for mock interface methods if needed, mostly used for admin updates
    async updatePassword(_email: string, _newPassword: string): Promise<boolean> {
        // Admin checking or user self-update? 
        // Firebase Client SDK doesn't easily allow updating OTHER people's passwords.
        // This might fail if simpler approach. 
        // For now, return false or needs Admin SDK (Cloud Functions).
        console.warn("Update Password via Client SDK for arbitrary user is not supported directly without re-auth");
        return false;
    }

    // Guest purchase — no login needed, just email
    async createGuestOrder(email: string, product: TDLProduct, details?: { phoneNumber?: string, tallySerial?: string }): Promise<User | null> {
        // 1. Find or create user by email
        let user = await this.getUserByEmail(email);
        let userId: string;

        if (!user) {
            // Create a new guest user record in Firestore (no Firebase Auth account)
            const guestUser: Omit<User, 'id'> = {
                name: email.split('@')[0],
                email: email,
                role: 'customer',
                status: 'active',
                joinedAt: new Date().toISOString(),
                purchasedProducts: [],
                phoneNumber: details?.phoneNumber,
                tallySerial: details?.tallySerial
            };
            const docRef = await addDoc(collection(db, 'users'), guestUser);
            userId = docRef.id;
            // Update the doc with its own Firestore ID
            await updateDoc(doc(db, 'users', userId), { id: userId });
            user = { ...guestUser, id: userId } as User;
        } else {
            userId = user.id;
        }

        // 2. Create order record with crypto-safe ID
        const orderId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? 'ord_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12)
            : 'ord_' + Date.now().toString(36);

        const newOrder: Order = {
            id: orderId,
            userId,
            userName: user.name,
            productId: product.id,
            productName: product.name,
            amount: product.price,
            status: 'success',
            date: new Date().toISOString(),
            phoneNumber: details?.phoneNumber,
            tallySerial: details?.tallySerial
        };
        await addDoc(collection(db, 'orders'), newOrder);

        // 3. Update purchasedProducts (only if not already owned)
        const alreadyOwned = user.purchasedProducts?.includes(product.id);
        if (!alreadyOwned) {
            const updatedProducts = [...(user.purchasedProducts || []), product.id];
            await updateDoc(doc(db, 'users', userId), { purchasedProducts: updatedProducts });
            return { ...user, purchasedProducts: updatedProducts };
        }
        return user;
    }

    async updateUserProfile(userId: string, updates: { name: string }): Promise<User | null> {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, updates);
        return this.getUserById(userId);
    }

    async addUser(user: User): Promise<User> {
        // This is "Admin adds user" - tricky with Firebase Client SDK auth.
        // We will just add to Firestore, but they won't have Auth credentials unless we create them.
        // For now, just add to FS.
        // If ID is not present, auto-gen
        if (user.id) {
            await setDoc(doc(db, "users", user.id), user);
            return user;
        } else {
            const docRef = await addDoc(collection(db, "users"), user);
            return { ...user, id: docRef.id };
        }
    }

    async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
        const userRef = doc(db, "users", id);
        await updateDoc(userRef, { status });
    }

    // --- Purchases & Orders ---
    async createOrder(userId: string, product: TDLProduct): Promise<User | null> {
        const newOrder: Order = {
            id: 'ord_' + Math.random().toString(36).substr(2, 9), // Or let Firestore Gen ID
            userId: userId,
            userName: '', // Fetch current user name if needed, or rely on what's passed
            productId: product.id,
            productName: product.name,
            amount: product.price,
            status: 'success',
            date: new Date().toISOString()
        };

        // Get basic user info for the order record to be redundant/safe
        const user = await this.getUserById(userId);
        if (user) {
            newOrder.userName = user.name;
        }

        // 1. Add Order
        await addDoc(collection(db, "orders"), newOrder);

        // 2. Update User purchasedProducts
        if (user) {
            if (!user.purchasedProducts?.includes(product.id)) {
                const updatedProducts = [...(user.purchasedProducts || []), product.id];
                await updateDoc(doc(db, "users", userId), {
                    purchasedProducts: updatedProducts
                });
                return { ...user, purchasedProducts: updatedProducts };
            }
            return user;
        }
        return null;
    }

    async getRevenue(): Promise<number> {
        // Client side aggregation is expensive, but for small app OK.
        const orders = await this.getOrders();
        return orders.reduce((sum, ord) => ord.status === 'success' ? sum + ord.amount : sum, 0);
    }

    async getOrders(): Promise<Order[]> {
        const q = query(collection(db, "orders"));
        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    }

    // --- Tickets ---
    async getTickets(): Promise<Ticket[]> {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const tickets: Ticket[] = [];
        querySnapshot.forEach((doc) => {
            tickets.push({ id: doc.id, ...doc.data() } as Ticket);
        });
        return tickets;
    }

    subscribeTickets(callback: (tickets: Ticket[]) => void): () => void {
        return onSnapshot(collection(db, "tickets"), (snapshot) => {
            const tickets: Ticket[] = [];
            snapshot.forEach((doc) => {
                tickets.push({ id: doc.id, ...doc.data() } as Ticket);
            });
            callback(tickets);
        });
    }

    async createTicket(userId: string, subject: string, priority: 'low' | 'medium' | 'high'): Promise<Ticket> {
        const newTicket = {
            userId,
            subject,
            status: 'open',
            priority,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "tickets"), newTicket);
        return { id: docRef.id, ...newTicket } as Ticket;
    }

    async updateTicketStatus(ticketId: string, status: 'open' | 'closed' | 'in_progress'): Promise<void> {
        const ref = doc(db, "tickets", ticketId);
        await updateDoc(ref, { status });
    }

    // --- Feedbacks ---
    async getFeedbacks(): Promise<Feedback[]> {
        const querySnapshot = await getDocs(collection(db, "feedbacks"));
        const feedbacks: Feedback[] = [];
        querySnapshot.forEach((doc) => {
            feedbacks.push({ id: doc.id, ...doc.data() } as Feedback);
        });
        return feedbacks;
    }

    subscribeFeedbacks(callback: (feedbacks: Feedback[]) => void): () => void {
        return onSnapshot(collection(db, "feedbacks"), (snapshot) => {
            const feedbacks: Feedback[] = [];
            snapshot.forEach((doc) => {
                feedbacks.push({ id: doc.id, ...doc.data() } as Feedback);
            });
            callback(feedbacks);
        });
    }

    async createFeedback(userName: string, userEmail: string, rating: number, comment: string): Promise<Feedback> {
        const newFeedback = {
            userName,
            userEmail,
            rating,
            comment,
            date: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "feedbacks"), newFeedback);
        return { id: docRef.id, ...newFeedback } as Feedback;
    }

    // --- File Upload (Storage) ---
    async uploadFile(file: File, path: string, onProgress?: (progress: number) => void): Promise<string> {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error("Error uploading file:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    }

    // --- Google Authentication ---
    async loginWithGoogle(): Promise<User | null> {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const uid = result.user.uid;
            const email = result.user.email || '';
            const name = result.user.displayName || email.split('@')[0];

            // Check if user already exists
            let user = await this.getUserById(uid);

            if (!user) {
                // Determine role based on whitelist
                const adminEmails = [
                    import.meta.env.VITE_ADMIN1_EMAIL,
                    import.meta.env.VITE_ADMIN2_EMAIL
                ].filter(Boolean).map(e => e?.toLowerCase());

                const isAdmin = adminEmails.includes(email.toLowerCase());

                user = {
                    id: uid,
                    name: name,
                    email: email,
                    role: isAdmin ? 'super_admin' : 'customer',
                    status: 'active',
                    joinedAt: new Date().toISOString(),
                    purchasedProducts: []
                };

                await setDoc(doc(db, "users", uid), user);
            }

            return user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    }
}

const hasFirebaseConfig =
    !!import.meta.env.VITE_FIREBASE_API_KEY &&
    !!import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    !!import.meta.env.VITE_FIREBASE_APP_ID;

export const dbService = hasFirebaseConfig ? new FirebaseDatabaseService() : mockDb;
