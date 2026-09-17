import {isSupportAuthToken} from '@libs/actions/Session';
import {shouldInitializeFullstory} from '@libs/Fullstory/common';

import CONST from '@src/CONST';
import type {Session, UserMetadata} from '@src/types/onyx';

const regularSession: Session = {authToken: 'token', accountID: 1, creationDate: Date.now()};
const supportSession: Session = {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT, authToken: 'supportToken', accountID: 2, creationDate: Date.now()};

describe('Fullstory', () => {
    describe('shouldInitializeFullstory', () => {
        const productionEnv = CONST.ENVIRONMENT.PRODUCTION;

        test('returns true for production environment with non-expensify email', () => {
            const metadata: UserMetadata = {accountID: 1, email: 'user@example.com'};
            expect(shouldInitializeFullstory(metadata, productionEnv, regularSession)).toBe(true);
        });

        test('returns false for non-production environment', () => {
            const metadata: UserMetadata = {accountID: 1, email: 'user@example.com'};
            expect(shouldInitializeFullstory(metadata, CONST.ENVIRONMENT.DEV, regularSession)).toBe(false);
        });

        test('returns false for expensify partner email in production', () => {
            const metadata: UserMetadata = {accountID: 1, email: 'user@expensify.com'};
            expect(shouldInitializeFullstory(metadata, productionEnv, regularSession)).toBe(false);
        });

        test('returns true for fullstory QA test email in non-production', () => {
            const metadata: UserMetadata = {accountID: 1, email: `fullstory-test${CONST.EMAIL.QA_DOMAIN}`};
            expect(shouldInitializeFullstory(metadata, CONST.ENVIRONMENT.DEV, regularSession)).toBe(true);
        });
    });

    describe('shouldInitialize with isSupportAuthToken', () => {
        test('isSupportAuthToken returns true for support session', () => {
            expect(isSupportAuthToken(supportSession)).toBe(true);
        });

        test('isSupportAuthToken returns false for regular session', () => {
            expect(isSupportAuthToken(regularSession)).toBe(false);
        });

        test('Fullstory should not initialize when session is support token', () => {
            const metadata: UserMetadata = {accountID: 1, email: 'user@example.com'};
            const result = shouldInitializeFullstory(metadata, CONST.ENVIRONMENT.PRODUCTION, supportSession) && !isSupportAuthToken(supportSession);
            expect(result).toBe(false);
        });

        test('Fullstory should initialize when session is not support token', () => {
            const metadata: UserMetadata = {accountID: 1, email: 'user@example.com'};
            const result = shouldInitializeFullstory(metadata, CONST.ENVIRONMENT.PRODUCTION, regularSession) && !isSupportAuthToken(regularSession);
            expect(result).toBe(true);
        });
    });
});
