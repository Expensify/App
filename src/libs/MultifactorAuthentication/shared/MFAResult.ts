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

/**
 * Builds the error for a step that threw where it should not. Expected refusals travel as failed
 * results, so machine actors use this in onError, where a rejection always means an unhandled
 * exception. The label names the failed step in telemetry, for example 'Device check'.
 */
function createUnhandledExceptionMFAError(stepLabel: string, thrown: unknown): MFAError {
    return createLocalMFAError(VALUES.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, `${stepLabel} threw: ${getErrorMessage(thrown)}`);
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- {} means "no additional data fields" as default generic parameter
type MFAResult<TData = {}> = ({success: true} & TData) | {success: false; error: MFAError};

/**
 * Returns the error a failed result carries, or undefined for a successful one. It narrows the result
 * union for callers that already routed on `success` elsewhere, such as a guarded XState transition.
 */
function getMFAResultError(result: MFAResult): MFAError | undefined {
    return result.success ? undefined : result.error;
}

export type {MFAError, MFAResult};
export {createLocalMFAError, createMFAErrorFromApiResponse, createUnhandledExceptionMFAError, getMFAResultError};
