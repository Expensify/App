import {API_ROUTES, FALLBACK_EMAIL} from './config';
import fetch from './router';
import type {APIType, ReadCommands, WriteCommands} from './types';
import {isReadCommandType} from './utils';

/* eslint-disable rulesdir/no-api-in-views */
const api = async (path: string, method: 'GET' | 'POST', body?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fetch(path, {
        method,
        body,
    });
};

const read: APIType['read'] = async (route, parameters) => {
    const routePath = API_ROUTES.Read[route];
    const [protocol, path] = routePath.split(':') as ['GET' | 'POST', string];
    return (await api(path, protocol, parameters)) as Promise<ReadCommands[typeof route]['returns']>;
};

const write: APIType['write'] = async (route, parameters) => {
    const routePath = API_ROUTES.Write[route];
    const [protocol, path] = routePath.split(':') as ['GET' | 'POST', string];
    return (await api(path, protocol, parameters)) as Promise<WriteCommands[typeof route]['returns']>;
};

const makeRequestWithSideEffects: APIType['makeRequestWithSideEffects'] = async (route, parameters) => {
    if (isReadCommandType(route)) {
        const res = await read(route, parameters);
        const {response = {}} = res;
        return {
            ...response,
            message: res.message,
            jsonCode: res.status,
            challenge: response.challenge,
        };
    }
    // eslint-disable-next-line rulesdir/no-multiple-api-calls,@typescript-eslint/non-nullable-type-assertion-style
    const res = await write(route, parameters as WriteCommands[typeof route]['parameters']);
    const {response = {}} = res;
    return {
        ...response,
        message: res.message,
        jsonCode: res.status,
    };
};

const requestValidateCodeAction = () => write('ResendValidateCode', {email: FALLBACK_EMAIL});

const triggerOnyxConnect = () => {
    fetch('/trigger', {method: 'GET'});
};

export {WRITE_COMMANDS, READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS} from './config';
export {requestValidateCodeAction, makeRequestWithSideEffects, triggerOnyxConnect};
export type {WriteCommands, ReadCommands};
