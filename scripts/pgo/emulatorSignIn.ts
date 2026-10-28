import {isRecord} from '@libs/ObjectUtils';

// The workflow places this file outside the app's cache directory, so profile pulls never copy it.
const EMULATOR_SIGN_IN_FILE = 'pgo-ci-sign-in.json';
// The app writes why it could not sign in next to the sign-in file. The runner prints it when sign-in times out.
const EMULATOR_SIGN_IN_ERROR_FILE = 'pgo-ci-sign-in-error.txt';
// shortcut: the session refreshes only at launch, so Auth must keep tokens valid for this long plus one journey; refresh on 407 if that changes.
const SESSION_REFRESH_MS = 30 * 60 * 1000;

type EmulatorSignIn = {email: string; partnerUserID: string; partnerUserSecret: string; partnerName?: string; partnerPassword?: string};
type StoredSession = {authToken?: string; email?: string; creationDate?: number};

/** Validate the test-account partner login that the emulator workflow provides at runtime. */
function parseEmulatorSignIn(input: unknown): EmulatorSignIn {
    if (!isRecord(input)) {
        throw new Error('The emulator sign-in file must be a JSON object.');
    }
    const email = requiredText(input, 'email');
    if (!email.includes('@')) {
        throw new Error('The emulator sign-in file must name the test account email.');
    }
    const partnerName = optionalText(input, 'partnerName');
    const partnerPassword = optionalText(input, 'partnerPassword');
    if (!partnerName !== !partnerPassword) {
        throw new Error('Provide both partnerName and partnerPassword, or neither.');
    }
    return {
        email,
        partnerUserID: requiredText(input, 'partnerUserID'),
        partnerUserSecret: requiredText(input, 'partnerUserSecret'),
        ...(partnerName && partnerPassword ? {partnerName, partnerPassword} : {}),
    };
}

/** Sign in when the stored session is missing, belongs to another account, or may expire during the next journey. */
function needsEmulatorSignIn(session: StoredSession | undefined, email: string, now: number): boolean {
    return !session?.authToken || session.email !== email || !session.creationDate || now - session.creationDate > SESSION_REFRESH_MS;
}

function requiredText(input: Record<string, unknown>, key: string): string {
    const value = optionalText(input, key);
    if (!value) {
        throw new Error(`The emulator sign-in file is missing ${key}.`);
    }
    return value;
}

function optionalText(input: Record<string, unknown>, key: string): string | undefined {
    const value = input[key];
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export {EMULATOR_SIGN_IN_ERROR_FILE, EMULATOR_SIGN_IN_FILE, needsEmulatorSignIn, parseEmulatorSignIn, SESSION_REFRESH_MS};
export type {EmulatorSignIn};
