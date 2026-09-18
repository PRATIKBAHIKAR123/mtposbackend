import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    async verifyToken(token: string) {
        try {
            const decodedToken =
                await this.firebaseService.auth.verifyIdToken(token);

            return decodedToken;
        } catch {
            throw new UnauthorizedException(
                'Invalid or expired Firebase token',
            );
        }
    }
}