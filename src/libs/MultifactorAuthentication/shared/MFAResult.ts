import {getErrorMessage} from '@libs/ErrorUtils';

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

/** Builds the error for an actor that unexpectedly rejected instead of returning a failed result. */
function createUnhandledExceptionMFAError(stepLabel: string, thrown: unknown): MFAError {
    return createLocalMFAError(VALUES.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, `${stepLabel} threw: ${getErrorMessage(thrown)}`);
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- {} means "no additional data fields" as default generic parameter
type MFAResult<TData = {}> = ({success: true} & TData) | {success: false; error: MFAError};

/**
 * Builds the failed result a step returns when the flow was canceled before it could run. The return
 * type is spelled out because an inferred `success: false` widens to `boolean`, which no longer fits
 * {@link MFAResult}'s failure branch. That branch carries no data, so this result is assignable to
 * every `MFAResult<TData>` a caller declares.
 */
function createCanceledMFAResult(message: string): {success: false; error: MFAError} {
    return {success: false, error: createLocalMFAError(VALUES.REASON.LOCAL_ERRORS.CANCELED, message)};
}

/** Returns the error a failed result carries. It throws on a successful result, so callers must rule success out first. */
function getMFAFailureError(result: MFAResult): MFAError {
    if (result.success) {
        throw new Error('Expected a failed MFA result');
    }
    return result.error;
}

export type {MFAError, MFAResult};
export {createCanceledMFAResult, createLocalMFAError, createMFAErrorFromApiResponse, createUnhandledExceptionMFAError, getMFAFailureError};
