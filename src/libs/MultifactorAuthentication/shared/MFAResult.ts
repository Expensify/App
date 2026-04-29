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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- {} means "no additional data fields" as default generic parameter
type MFAResult<TData = {}> = ({success: true} & TData) | {success: false; error: MFAError};

export type {MFAError, MFAResult};
export {createLocalMFAError, createMFAErrorFromApiResponse};
