
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
    serverTimestamp
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from './firebaseConfig';
import { User, TDLProduct, Order, Ticket } from '../types';

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
        const { id, ...data } = product; // remove potential local ID
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
            const user = await this.getUserById(userCredential.user.uid);
            return user;
        } catch (error) {
            console.error("Login error:", error);
            return null;
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
        const newUser: User = {
            ...user,
            id: uid, // Use Auth UID as doc ID
            purchasedProducts: [],
            joinedAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", uid), newUser);
        return newUser;
    }

    // Legacy support for mock interface methods if needed, mostly used for admin updates
    async updatePassword(email: string, newPassword: string): Promise<boolean> {
        // Admin checking or user self-update? 
        // Firebase Client SDK doesn't easily allow updating OTHER people's passwords.
        // This might fail if simpler approach. 
        // For now, return false or needs Admin SDK (Cloud Functions).
        console.warn("Update Password via Client SDK for arbitrary user is not supported directly without re-auth");
        return false;
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
}

export const dbService = new FirebaseDatabaseService();
