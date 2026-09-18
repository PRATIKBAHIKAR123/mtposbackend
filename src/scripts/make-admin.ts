import 'dotenv/config';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

async function makeAdmin() {
    const target = process.argv[2];

    if (!target) {
        console.error('❌ Error: Please provide an email address or Firebase UID.');
        console.error('Usage: npm run make:admin <email-or-uid>');
        process.exit(1);
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase environment variables are missing');
    }

    const firebaseApp =
        getApps().length > 0
            ? getApps()[0]
            : initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });

    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    let uid = target;
    let userEmail: string | undefined = undefined;

    // Check if target is an email
    if (target.includes('@')) {
        try {
            const userRecord = await auth.getUserByEmail(target);
            uid = userRecord.uid;
            userEmail = userRecord.email;
        } catch {
            console.error(`❌ Could not find Firebase Auth user with email: ${target}`);
            process.exit(1);
        }
    } else {
        try {
            const userRecord = await auth.getUser(target);
            userEmail = userRecord.email;
        } catch {
            console.log(`⚠️ User not found in Firebase Auth with UID: ${target}, checking Firestore...`);
        }
    }

    const userRef = firestore.collection('users').doc(uid);
    const userDoc = await userRef.get();

    const now = new Date();

    if (userDoc.exists) {
        await userRef.update({
            systemRole: 'admin',
            updatedAt: now,
        });
        console.log(`✅ Successfully promoted existing user (${uid} / ${userEmail ?? 'no email'}) to systemRole: 'admin'!`);
    } else {
        await userRef.set({
            id: uid,
            email: userEmail ?? null,
            displayName: null,
            photoUrl: null,
            emailVerified: true,
            status: 'active',
            systemRole: 'admin',
            createdAt: now,
            updatedAt: now,
        });
        console.log(`✅ Created Firestore user record for UID: ${uid} with systemRole: 'admin'!`);
    }
}

makeAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Failed to promote admin:', err);
        process.exit(1);
    });
