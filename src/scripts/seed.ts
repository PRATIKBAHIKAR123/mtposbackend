import 'dotenv/config';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { DEFAULT_FEATURES } from '../plans/default-features.js';
import { DEFAULT_PLANS } from '../plans/default-plans.js';
import { DEFAULT_ROLES } from '../roles/default-roles.js';

async function seed() {
    console.log('🌱 Starting Firestore seed...');

    const projectId =
        process.env.FIREBASE_PROJECT_ID;

    const clientEmail =
        process.env.FIREBASE_CLIENT_EMAIL;

    const privateKey =
        process.env.FIREBASE_PRIVATE_KEY
            ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Firebase environment variables are missing',
        );
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

    /*
     * -----------------------------------------
     * FEATURE DEFINITIONS
     * -----------------------------------------
     */

    console.log('📦 Seeding feature definitions...');

    for (const feature of DEFAULT_FEATURES) {
        const ref = firestore
            .collection('featureDefinitions')
            .doc(feature.id);

        const existing = await ref.get();

        if (existing.exists) {
            console.log(
                `⏭️ Feature already exists: ${feature.id}`,
            );
            continue;
        }

        await ref.set({
            ...feature,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log(
            `✅ Feature created: ${feature.id}`,
        );
    }

    /*
     * -----------------------------------------
     * PLANS
     * -----------------------------------------
     */

    console.log('💳 Seeding plans...');

    for (const plan of DEFAULT_PLANS) {
        const ref = firestore
            .collection('plans')
            .doc(plan.id);

        const existing = await ref.get();

        if (existing.exists) {
            console.log(
                `⏭️ Plan already exists: ${plan.id}`,
            );
            continue;
        }

        await ref.set({
            ...plan,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log(
            `✅ Plan created: ${plan.id}`,
        );
    }

    /*
     * -----------------------------------------
     * DEFAULT ROLE DEFINITIONS
     * -----------------------------------------
     *
     * These are templates.
     *
     * Actual roles will later be copied into
     * tenants/{tenantId}/roles when a business
     * is approved.
     */

    console.log('👥 Seeding default role definitions...');

    for (const role of DEFAULT_ROLES) {
        const ref = firestore
            .collection('systemSettings')
            .doc('defaultRoles');

        const existing = await ref.get();

        const currentRoles =
            existing.exists
                ? existing.data()?.roles ?? []
                : [];

        const roleExists = currentRoles.some(
            (item: any) => item.id === role.id,
        );

        if (!roleExists) {
            currentRoles.push(role);
        }

        await ref.set({
            roles: currentRoles,
            updatedAt: new Date(),
        });

        console.log(
            `✅ Default role available: ${role.id}`,
        );
    }

    console.log('');
    console.log('🎉 Firestore seed completed!');
}

seed()
    .then(() => {
        console.log('✅ Done');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seed failed');
        console.error(error);
        process.exit(1);
    });