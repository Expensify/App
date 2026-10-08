import {act, renderHook} from '@testing-library/react-native';

import useSaveMarketingAttribution from '@hooks/useSaveMarketingAttribution';

import {captureMarketingAttributionFromURL, saveMarketingAttribution} from '@libs/actions/MarketingAttribution';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MarketingAttribution} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

function setLandingURL(search: string) {
    window.history.replaceState({}, '', `/${search}`);
}

function getStoredAttribution(): Promise<OnyxEntry<MarketingAttribution>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.MARKETING_ATTRIBUTION,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

describe('MarketingAttribution', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterAll(() => {
        setLandingURL('');
    });

    describe('captureMarketingAttributionFromURL', () => {
        it('returns the UTM params, Google Ads params and click IDs from the landing URL', () => {
            // Given a landing URL from a Google ad
            setLandingURL(
                '?utm_source=google&utm_medium=cpc&utm_campaign=123&utm_content=456-789&utm_term=expense%20app-e&device=m&network=g&gclid=testGclid&gbraid=testGbraid&wbraid=testWbraid',
            );

            // When the attribution is captured, then every param is returned under its request param name
            expect(captureMarketingAttributionFromURL()).toEqual({
                utm_source: 'google',
                utm_medium: 'cpc',
                utm_campaign: '123',
                utm_content: '456-789',
                utm_term: 'expense app-e',
                device: 'm',
                network: 'g',
                gclid: 'testGclid',
                gbraid: 'testGbraid',
                wbraid: 'testWbraid',
            });
        });

        it('ignores params that are not marketing attribution', () => {
            // Given a landing URL with unrelated params
            setLandingURL('?utm_source=reddit&exitTo=settings&fbclid=testFbclid');

            // When the attribution is captured, then only the attribution param is returned
            expect(captureMarketingAttributionFromURL()).toEqual({utm_source: 'reddit'});
        });

        it('returns undefined when the URL carries no params', () => {
            // Given a landing URL without attribution params
            setLandingURL('?exitTo=settings');

            // When the attribution is captured, then nothing is returned
            expect(captureMarketingAttributionFromURL()).toBeUndefined();
        });

        it('does not write to Onyx', async () => {
            // Given a landing URL with UTM params
            setLandingURL('?utm_source=google');

            // When the attribution is captured
            captureMarketingAttributionFromURL();
            await waitForBatchedUpdates();

            // Then nothing is stored
            expect(await getStoredAttribution()).toBeUndefined();
        });
    });

    describe('saveMarketingAttribution', () => {
        it('replaces the stored attribution instead of merging into it', async () => {
            // Given attribution stored from an earlier Google ad click
            await Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, {utm_source: 'google', utm_medium: 'cpc', gclid: 'testGclid', device: 'm'});

            // When attribution from a later Reddit ad is saved
            saveMarketingAttribution({utm_source: 'reddit', utm_campaign: 'spring'}, false);
            await waitForBatchedUpdates();

            // Then only the Reddit values are kept, so values from the two clicks are not combined
            expect(await getStoredAttribution()).toEqual({utm_source: 'reddit', utm_campaign: 'spring'});
        });

        it('keeps the stored attribution when nothing was captured', async () => {
            // Given attribution stored from an earlier ad click
            await Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, {utm_source: 'google', gclid: 'testGclid'});

            // When a load without attribution params is saved
            saveMarketingAttribution(undefined, false);
            await waitForBatchedUpdates();

            // Then the stored attribution is kept
            expect(await getStoredAttribution()).toEqual({utm_source: 'google', gclid: 'testGclid'});
        });

        it('does nothing when the user has a session', async () => {
            // When attribution is saved for a signed-in user
            saveMarketingAttribution({utm_source: 'google'}, true);
            await waitForBatchedUpdates();

            // Then the key stays unset
            expect(await getStoredAttribution()).toBeUndefined();
        });
    });

    describe('useSaveMarketingAttribution', () => {
        it('stores the attribution from the landing URL when the user has no session', async () => {
            // Given no session and a landing URL with UTM params
            setLandingURL('?utm_source=google&utm_medium=cpc');

            // When the hook renders and the session has loaded
            renderHook(() => useSaveMarketingAttribution());
            await waitForBatchedUpdatesWithAct();

            // Then the attribution is written
            expect(await getStoredAttribution()).toEqual({utm_source: 'google', utm_medium: 'cpc'});
        });

        it('does not store the attribution when the user already has a session', async () => {
            // Given a signed-in user and a landing URL with UTM params
            await Onyx.set(ONYXKEYS.SESSION, {authToken: 'testAuthToken', email: 'test@test.com'});
            setLandingURL('?utm_source=google&utm_medium=cpc');

            // When the hook renders and the session has loaded
            renderHook(() => useSaveMarketingAttribution());
            await waitForBatchedUpdatesWithAct();

            // Then the key stays unset
            expect(await getStoredAttribution()).toBeUndefined();
        });

        it('stores the attribution when the user only has an anonymous session from viewing a public room', async () => {
            // Given an anonymous session and a landing URL with Google Ads params
            await Onyx.set(ONYXKEYS.SESSION, {authToken: 'anonymousAuthToken', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS, email: 'anon-123@guest.expensify.com'});
            setLandingURL('?gclid=testGclid&utm_source=google');

            // When the hook renders and the session has loaded
            renderHook(() => useSaveMarketingAttribution());
            await waitForBatchedUpdatesWithAct();

            // Then the attribution is written, since the anonymous user can still sign up from the room
            expect(await getStoredAttribution()).toEqual({gclid: 'testGclid', utm_source: 'google'});
        });

        it('reads the URL on the first render only', async () => {
            // Given a landing URL with UTM params that the router later strips
            setLandingURL('?utm_source=google');
            const {rerender} = renderHook(() => useSaveMarketingAttribution());
            setLandingURL('');
            rerender({});
            await waitForBatchedUpdatesWithAct();

            // Then the attribution from the landing URL is stored
            expect(await getStoredAttribution()).toEqual({utm_source: 'google'});
        });

        it('saves the attribution only once, even after the session changes', async () => {
            // Given attribution saved on landing
            setLandingURL('?utm_source=google');
            renderHook(() => useSaveMarketingAttribution());
            await waitForBatchedUpdatesWithAct();

            // When signup clears it and the user later signs in and out
            await act(async () => {
                await Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, null);
                await Onyx.set(ONYXKEYS.SESSION, {authToken: 'testAuthToken'});
            });
            await act(async () => {
                await Onyx.set(ONYXKEYS.SESSION, {});
            });
            await waitForBatchedUpdatesWithAct();

            // Then the attribution is not written again
            expect(await getStoredAttribution()).toBeUndefined();
        });

        it('works under StrictMode', async () => {
            // Given a landing URL with UTM params
            setLandingURL('?utm_source=google&gclid=testGclid');

            // When the hook renders under StrictMode, which double-invokes initializers and effects
            renderHook(() => useSaveMarketingAttribution(), {wrapper: React.StrictMode});
            await waitForBatchedUpdatesWithAct();

            // Then the attribution is stored
            expect(await getStoredAttribution()).toEqual({utm_source: 'google', gclid: 'testGclid'});
        });
    });
});
