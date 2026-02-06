import { firebaseConfig, BRAND_ID } from './config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// Database helper with brand filtering
const db = {
    // Fetch documents from a collection
    async fetch(collection, options = {}) {
        let query = firestore.collection(collection);
        
        // Add brand filter unless disabled
        if (options.brandFilter !== false) {
            query = query.where('brand_id', '==', BRAND_ID);
        }
        
        // Add additional filters
        if (options.filters) {
            options.filters.forEach(f => {
                const op = f.op || '==';
                query = query.where(f.column, op, f.value);
            });
        }
        
        // Add ordering
        if (options.order) {
            query = query.orderBy(options.order.column, options.order.ascending ? 'asc' : 'desc');
        }
        
        // Add limit
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        try {
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            // If index doesn't exist, try without ordering
            if (error.code === 'failed-precondition') {
                console.warn('Index missing, fetching without order:', error.message);
                let fallbackQuery = firestore.collection(collection);
                if (options.brandFilter !== false) {
                    fallbackQuery = fallbackQuery.where('brand_id', '==', BRAND_ID);
                }
                const snapshot = await fallbackQuery.get();
                let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort client-side if needed
                if (options.order) {
                    results.sort((a, b) => {
                        const aVal = a[options.order.column];
                        const bVal = b[options.order.column];
                        if (aVal < bVal) return options.order.ascending ? -1 : 1;
                        if (aVal > bVal) return options.order.ascending ? 1 : -1;
                        return 0;
                    });
                }
                
                if (options.limit) {
                    results = results.slice(0, options.limit);
                }
                
                return results;
            }
            throw error;
        }
    },

    // Insert a document
    async insert(collection, data, options = {}) {
        const docData = {
            ...data,
            brand_id: options.skipBrandId ? data.brand_id : BRAND_ID,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await firestore.collection(collection).add(docData);
        return { id: docRef.id, ...docData };
    },

    // Update a document
    async update(collection, id, updates) {
        const docRef = firestore.collection(collection).doc(id);
        await docRef.update({
            ...updates,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    },

    // Delete a document
    async delete(collection, id) {
        await firestore.collection(collection).doc(id).delete();
        return true;
    },

    // Real-time listener
    subscribe(collection, callback, options = {}) {
        let query = firestore.collection(collection);
        
        if (options.brandFilter !== false) {
            query = query.where('brand_id', '==', BRAND_ID);
        }
        
        return query.onSnapshot(snapshot => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(docs);
        });
    },

    // Raw firestore access
    raw: firestore
};

export { db, firestore };
