import registerPrefetchOnAppStart from '@libs/Prefetch/registerPrefetchOnAppStart';

import {prefetchOnAppStart} from 'react-native-nitro-fetch';

const URL = 'https://www.expensify.com.dev/api/ReconnectApp?';
const PREFETCH_KEY = 'ReconnectApp:1';

type ReactNativeFormDataPart = {fieldName: string; string: string};

/** Jest's FormData has no getParts, so this mimics the RN FormData the app sends on native */
function createReactNativeFormData(parts: ReactNativeFormDataPart[]): FormData {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {append: jest.fn(), getParts: () => parts} as unknown as FormData;
}

function getSavedPrefetchBody(): RequestInit['body'] {
    const [, fetchParams] = jest.mocked(prefetchOnAppStart).mock.calls.at(0) ?? [];
    return fetchParams?.body;
}

describe('registerPrefetchOnAppStart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves the prefetch body without appversion and keeps the other fields', () => {
        // Given a ReconnectApp body with appversion, as built by enhanceParameters
        const body = createReactNativeFormData([
            {fieldName: 'authToken', string: 'token'},
            {fieldName: 'appversion', string: '9.4.89-0'},
            {fieldName: 'clientUpdateID', string: '123'},
        ]);

        // When the request is registered for the next app start
        registerPrefetchOnAppStart({prefetchKey: PREFETCH_KEY, command: 'ReconnectApp', url: URL, fetchParams: {method: 'POST', body}});

        // Then the saved body has no appversion, so a newer version replaying it after an update isn't sent to the server as the old one
        const savedBody = getSavedPrefetchBody();
        if (!(savedBody instanceof FormData)) {
            throw new Error('Expected the saved prefetch body to be FormData');
        }
        expect(savedBody.has('appversion')).toBe(false);
        expect(savedBody.get('authToken')).toBe('token');
        expect(savedBody.get('clientUpdateID')).toBe('123');
    });

    it('saves a body that is not RN FormData unchanged', () => {
        // Given a body that is a plain string, which has no parts to filter
        const body = 'appversion=9.4.89-0';

        // When the request is registered for the next app start
        registerPrefetchOnAppStart({prefetchKey: PREFETCH_KEY, command: 'ReconnectApp', url: URL, fetchParams: {method: 'POST', body}});

        // Then the body is saved as is, because only RN FormData bodies are rebuilt
        expect(getSavedPrefetchBody()).toBe(body);
    });
});
