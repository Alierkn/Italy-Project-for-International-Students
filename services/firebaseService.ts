import { firebaseConfig } from '../firebaseConfig';

// Declare firebase as a global variable to satisfy TypeScript
declare const firebase: any;

let db: any;

try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore.getFirestore(app);
} catch (e) {
    console.error("Firebase initialization error", e);
}


/**
 * Adds feedback for a specific city and topic combination to Firestore.
 * It increments a counter for either 'likes' or 'dislikes'.
 * @param cityId The ID of the city (e.g., 'milan').
 * @param topicId The ID of the topic (e.g., 'accommodation').
 * @param type The type of feedback, either 'like' or 'dislike'.
 */
export const addFeedback = async (cityId: string, topicId: string, type: 'like' | 'dislike'): Promise<void> => {
    if (!db) {
        console.error("Firestore is not initialized.");
        return;
    }

    const docId = `${cityId}_${topicId}`;
    const docRef = firebase.firestore.doc(db, 'feedback', docId);
    
    const { increment, runTransaction } = firebase.firestore;

    try {
        await runTransaction(db, async (transaction: any) => {
            const doc = await transaction.get(docRef);
            
            if (!doc.exists()) {
                 const newDocData = {
                    cityId,
                    topicId,
                    likeCount: type === 'like' ? 1 : 0,
                    dislikeCount: type === 'dislike' ? 1 : 0
                };
                transaction.set(docRef, newDocData);
            } else {
                const fieldToIncrement = type === 'like' ? 'likeCount' : 'dislikeCount';
                transaction.update(docRef, { [fieldToIncrement]: increment(1) });
            }
        });

    } catch (error) {
        console.error("Firebase transaction failed: ", error);
        throw error;
    }
};
