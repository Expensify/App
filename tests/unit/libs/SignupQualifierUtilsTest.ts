import {isSmbQualifier, isVsbQualifier} from '@libs/SignupQualifierUtils';
import CONST from '@src/CONST';

describe('SignupQualifierUtils', () => {
    describe('isVsbQualifier', () => {
        it('returns true for legacy VSB', () => {
            expect(isVsbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB)).toBe(true);
        });

        it('returns true for granular VSB_1_4', () => {
            expect(isVsbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB_1_4)).toBe(true);
        });

        it('returns false for SMB qualifiers', () => {
            expect(isVsbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB)).toBe(false);
            expect(isVsbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB_5_PLUS)).toBe(false);
        });

        it('returns false for INDIVIDUAL', () => {
            expect(isVsbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL)).toBe(false);
        });

        it('returns false for null/undefined', () => {
            expect(isVsbQualifier(undefined)).toBe(false);
            expect(isVsbQualifier(null)).toBe(false);
        });
    });

    describe('isSmbQualifier', () => {
        it('returns true for legacy SMB', () => {
            expect(isSmbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB)).toBe(true);
        });

        it('returns true for granular SMB_5_PLUS', () => {
            expect(isSmbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB_5_PLUS)).toBe(true);
        });

        it('returns false for VSB qualifiers', () => {
            expect(isSmbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB)).toBe(false);
            expect(isSmbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB_1_4)).toBe(false);
        });

        it('returns false for INDIVIDUAL', () => {
            expect(isSmbQualifier(CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL)).toBe(false);
        });

        it('returns false for null/undefined', () => {
            expect(isSmbQualifier(undefined)).toBe(false);
            expect(isSmbQualifier(null)).toBe(false);
        });
    });

    describe('qualifier value strings', () => {
        // These exact strings are sent by the landing page and stored on the account NVP.
        // Changing them is a breaking change for in-flight signup sessions and historical data.
        it('uses the expected wire-format strings', () => {
            expect(CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB_1_4).toBe('vsb-1-4');
            expect(CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB_5_PLUS).toBe('smb-5-plus');
        });
    });
});
