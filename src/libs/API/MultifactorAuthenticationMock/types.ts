import type {EmptyObject} from 'type-fest';
import type {SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {MultifactorAuthenticationKeyInfo} from '@libs/MultifactorAuthentication/Biometrics/types';
import type Response from '@src/types/onyx/Response';
import type {API_ROUTES, READ_COMMANDS, WRITE_COMMANDS} from './config';

type Challenge = {
    nonce: string;
    expires: number;
};

type APIResponse<T = undefined> = {
    response: T | undefined;
    status: number;
    message: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Base64URL<T> = string;

type WriteCommands = {
    RegisterBiometrics: {
        route: typeof API_ROUTES.Write.RegisterBiometrics;
        parameters: {
            keyInfo: MultifactorAuthenticationKeyInfo<'biometric'>;
            validateCode?: number;
        };
        returns: APIResponse;
    };
    AuthorizeTransaction: {
        route: typeof API_ROUTES.Write.AuthorizeTransaction;
        parameters: {
            transactionID: string;
            signedChallenge: SignedChallenge;
        };
        returns: APIResponse;
    };
    RevokeMultifactorAuthenticationKeys: {
        route: typeof API_ROUTES.Write.RevokeMultifactorAuthenticationKeys;
        parameters: Record<string, unknown>;
        returns: APIResponse;
    };
    ResendValidateCode: {
        route: typeof API_ROUTES.Write.ResendValidateCode;
        parameters: {
            email: string;
        };
        returns: APIResponse;
    };
};

type ReadCommands = {
    RequestBiometricChallenge: {
        route: typeof API_ROUTES.Read.RequestBiometricChallenge;
        parameters?: Record<string, unknown>;
        returns: APIResponse<Response>;
    };
};

type WriteCommandType = (typeof WRITE_COMMANDS)[keyof typeof WRITE_COMMANDS];
type ReadCommandType = (typeof READ_COMMANDS)[keyof typeof READ_COMMANDS];

type ReadAPI = (route: ReadCommandType, parameters?: ReadCommands[typeof route]['parameters']) => Promise<ReadCommands[typeof route]['returns']>;

type WriteAPI = (route: WriteCommandType, parameters: WriteCommands[typeof route]['parameters']) => Promise<WriteCommands[typeof route]['returns']>;

type SideEffectsResponse = Response & {
    jsonCode?: number | string;
    message?: string;
};

type APIType = {
    read: ReadAPI;
    write: WriteAPI;
    makeRequestWithSideEffects: {
        (route: ReadCommandType, parameters: ReadCommands[typeof route]['parameters'], onyxData: EmptyObject): Promise<SideEffectsResponse>;
        (route: WriteCommandType, parameters: WriteCommands[typeof route]['parameters'], onyxData: EmptyObject): Promise<SideEffectsResponse>;
    };
};

export type {Challenge, Base64URL, APIType, WriteCommands, ReadCommands, WriteCommandType, ReadCommandType};
