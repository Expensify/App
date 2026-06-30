import type {MultifactorAuthenticationReason} from './types';

import VALUES from './VALUES';

type MFAError = {
    readonly reason: MultifactorAuthenticationReason;
    readonly httpStatusCode?: number;
    readonly message: string | undefined;
};

function createLocalMFAError(reason: MultifactorAuthenticationReason, message: string | undefined): MFAError {
    return {reason, message};
}

function createMFAErrorFromApiResponse(httpStatusCode: number | undefined, reason: MultifactorAuthenticationReason | undefined, message?: string): MFAError {
    const resolvedReason: MultifactorAuthenticationReason = reason ?? VALUES.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE;
    return {reason: resolvedReason, httpStatusCode, message};
}

/**
 * The error an MFA actor rejects with when a step fails. It is a real Error, so it carries a stack and
 * satisfies the throw-an-Error lint, and it wraps the domain MFAError that the machine's onError routes
 * to the failure outcome.
 */
class MFAActorError extends Error {
    readonly mfaError: MFAError;

    constructor(mfaError: MFAError) {
        super(mfaError.message ?? mfaError.reason);
        this.name = 'MFAActorError';
        this.mfaError = mfaError;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- {} means "no additional data fields" as default generic parameter
type MFAResult<TData = {}> = ({success: true} & TData) | {success: false; error: MFAError};

export type {MFAError, MFAResult};
export {createLocalMFAError, createMFAErrorFromApiResponse, MFAActorError};
