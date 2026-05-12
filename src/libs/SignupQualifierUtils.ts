import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type SignupQualifier = ValueOf<typeof CONST.ONBOARDING_SIGNUP_QUALIFIERS>;

const VSB_QUALIFIERS = new Set<SignupQualifier>([CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB, CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB_1_4]);

const SMB_QUALIFIERS = new Set<SignupQualifier>([CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB, CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB_5_PLUS]);

/**
 * Returns true when the user signed up with a VSB-style qualifier on the landing page.
 * Includes the legacy `vsb` ("1-9") value and the granular `vsb-1-4` value.
 */
function isVsbQualifier(qualifier: SignupQualifier | undefined | null): boolean {
    return !!qualifier && VSB_QUALIFIERS.has(qualifier);
}

/**
 * Returns true when the user signed up with an SMB-style qualifier on the landing page.
 * Includes the legacy `smb` ("10+") value and the granular `smb-5-plus` value.
 */
function isSmbQualifier(qualifier: SignupQualifier | undefined | null): boolean {
    return !!qualifier && SMB_QUALIFIERS.has(qualifier);
}

export {isVsbQualifier, isSmbQualifier};
export type {SignupQualifier};
