import {Response} from '@src/types/onyx';
import createProxyForObject from '@src/utils/createProxyForObject';

const GetMissingOnyxUpdatesPromiseValue = {GetMissingOnyxUpdatesPromise: undefined as Promise<Response | Response[] | void> | undefined};

export default createProxyForObject(GetMissingOnyxUpdatesPromiseValue);
