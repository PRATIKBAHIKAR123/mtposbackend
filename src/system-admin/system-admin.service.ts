import {
    Injectable,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class SystemAdminService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    async getDashboard() {
        const firestore =
            this.firebaseService.firestore;

        const [
            applicationsSnapshot,
            tenantsSnapshot,
            usersSnapshot,
            subscriptionsSnapshot,
        ] = await Promise.all([
            firestore
                .collection('applications')
                .get(),

            firestore
                .collection('tenants')
                .get(),

            firestore
                .collection('users')
                .get(),

            firestore
                .collectionGroup('subscriptions')
                .get(),
        ]);

        let pendingApplications = 0;
        let approvedApplications = 0;
        let rejectedApplications = 0;
        let activeBusinesses = 0;
        let suspendedBusinesses = 0;
        let activeUsers = 0;

        let trialingSubscriptions = 0;
        let activeSubscriptions = 0;
        let expiredSubscriptions = 0;
        let cancelledSubscriptions = 0;
        let suspendedSubscriptions = 0;

        applicationsSnapshot.forEach((doc) => {
            const data = doc.data();

            switch (data.status) {
                case 'pending':
                    pendingApplications++;
                    break;

                case 'approved':
                    approvedApplications++;
                    break;

                case 'rejected':
                    rejectedApplications++;
                    break;
            }
        });

        tenantsSnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.status === 'active') {
                activeBusinesses++;
            } else if (data.status === 'suspended') {
                suspendedBusinesses++;
            }
        });

        usersSnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.status === 'active') {
                activeUsers++;
            }
        });

        subscriptionsSnapshot.forEach((doc) => {
            const data = doc.data();

            switch (data.status) {
                case 'trialing':
                    trialingSubscriptions++;
                    break;

                case 'active':
                    activeSubscriptions++;
                    break;

                case 'expired':
                    expiredSubscriptions++;
                    break;

                case 'cancelled':
                    cancelledSubscriptions++;
                    break;

                case 'suspended':
                    suspendedSubscriptions++;
                    break;
            }
        });

        return {
            businesses: {
                total: tenantsSnapshot.size,
                active: activeBusinesses,
                suspended: suspendedBusinesses,
            },
            applications: {
                total: applicationsSnapshot.size,
                pending: pendingApplications,
                approved: approvedApplications,
                rejected: rejectedApplications,
            },
            users: {
                total: usersSnapshot.size,
                active: activeUsers,
            },
            subscriptions: {
                total: subscriptionsSnapshot.size,
                trialing: trialingSubscriptions,
                active: activeSubscriptions,
                expired: expiredSubscriptions,
                cancelled: cancelledSubscriptions,
                suspended: suspendedSubscriptions,
            },
        };
    }
}