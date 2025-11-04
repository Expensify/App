import type {EmptyObject} from 'type-fest';
import type {SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/types';
import type Response from '@src/types/onyx/Response';
import fetch from './router';

/* eslint-disable rulesdir/no-api-in-views */

const api = async (path: string, method: 'GET' | 'POST', body?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fetch(path, {
        method,
        body,
    });
};

type APIResponse<T = undefined> = {
    response: T | undefined;
    status: number;
    message: string;
};

const APIRoutes: {
    Read: Record<keyof ReadCommands, `${'POST' | 'GET'}:${string}`>;
    Write: Record<keyof WriteCommands, `${'POST' | 'GET'}:${string}`>;
} = {
    Read: {
        RequestBiometricChallenge: 'GET:/request_biometric_challenge',
    },
    Write: {
        ResendValidateCode: 'POST:/resend_validate_code',
        RegisterBiometrics: 'POST:/register_biometrics',
        AuthorizeTransaction: 'POST:/authorize_transaction',
        SendOTP: 'POST:/send_otp',
    },
};

type WriteCommands = {
    RegisterBiometrics: {
        route: typeof APIRoutes.Write.RegisterBiometrics;
        parameters: {
            publicKey: string;
            validateCode?: number;
        };
        returns: APIResponse;
    };
    AuthorizeTransaction: {
        route: typeof APIRoutes.Write.AuthorizeTransaction;
        parameters: {
            transactionID: string;
            // this one:
            signedChallenge?: SignedChallenge; // JWT
            // or these two together:
            validateCode?: number; // validate code
            otp?: number; // 2FA / SMS OTP
        };
        returns: APIResponse;
    };
    ResendValidateCode: {
        route: typeof APIRoutes.Write.ResendValidateCode;
        parameters: {
            email: string;
        };
        returns: APIResponse;
    };
    SendOTP: {
        route: typeof APIRoutes.Write.SendOTP;
        parameters: {
            phoneNumber: string;
        };
        returns: APIResponse;
    };
};

type ReadCommands = {
    RequestBiometricChallenge: {
        route: typeof APIRoutes.Read.RequestBiometricChallenge;
        parameters?: Record<string, unknown>;
        returns: APIResponse<Response>;
    };
};

const WRITE_COMMANDS = {
    REGISTER_BIOMETRICS: 'RegisterBiometrics',
    AUTHORIZE_TRANSACTION: 'AuthorizeTransaction',
    RESEND_VALIDATE_CODE: 'ResendValidateCode',
    SEND_OTP: 'SendOTP',
} as const;

const READ_COMMANDS = {
    REQUEST_BIOMETRIC_CHALLENGE: 'RequestBiometricChallenge',
} as const;

const SIDE_EFFECT_REQUEST_COMMANDS = {
    REGISTER_BIOMETRICS: WRITE_COMMANDS.REGISTER_BIOMETRICS,
    AUTHORIZE_TRANSACTION: WRITE_COMMANDS.AUTHORIZE_TRANSACTION,
    RESEND_VALIDATE_CODE: WRITE_COMMANDS.RESEND_VALIDATE_CODE,
    REQUEST_BIOMETRIC_CHALLENGE: READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE,
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

const isReadCommandType = (route: ReadCommandType | WriteCommandType): route is ReadCommandType => route === READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE;

const API: APIType = {
    read: async (route, parameters) => {
        const routePath = APIRoutes.Read[route];
        const [protocol, path] = routePath.split(':') as ['GET' | 'POST', string];
        return (await api(path, protocol, parameters)) as Promise<ReadCommands[typeof route]['returns']>;
    },
    write: async (route, parameters) => {
        const routePath = APIRoutes.Write[route];
        const [protocol, path] = routePath.split(':') as ['GET' | 'POST', string];
        return (await api(path, protocol, parameters)) as Promise<WriteCommands[typeof route]['returns']>;
    },
    makeRequestWithSideEffects: async (route, parameters) => {
        if (isReadCommandType(route)) {
            const res = await API.read(route, parameters);
            return {
                message: res.message,
                jsonCode: res.status,
                challenge: res.response?.challenge,
            };
        }
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        const res = await API.write(route, parameters as WriteCommands[typeof route]['parameters']);
        return {
            message: res.message,
            jsonCode: res.status,
        };
    },
};

const {makeRequestWithSideEffects} = API;

// eslint-disable-next-line rulesdir/no-api-in-views
export default API;
export {WRITE_COMMANDS, READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, makeRequestWithSideEffects};
export type {WriteCommands, ReadCommands};
