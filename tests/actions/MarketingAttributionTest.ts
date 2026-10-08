import {renderHook} from '@testing-library/react-native';

import useSaveMarketingAttribution from '@hooks/useSaveMarketingAttribution';

import {captureMarketingAttributionFromURL, savePendingMarketingAttribution} from '@libs/actions/MarketingAttribution';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MarketingAttribution} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

    it('stores the UTM params, Google Ads params and click IDs from the landing URL', async () => {
        // Given a landing URL from a Google ad
        setLandingURL(
            '?utm_source=google&utm_medium=cpc&utm_campaign=123&utm_content=456-789&utm_term=expense%20app-e&device=m&network=g&gclid=testGclid&gbraid=testGbraid&wbraid=testWbraid',
        );

        // When the attribution is captured
        captureMarketingAttributionFromURL();
        savePendingMarketingAttribution(false);
        await waitForBatchedUpdates();

        // Then every param is stored under its request param name
        expect(await getStoredAttribution()).toEqual({
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

    it('ignores params that are not marketing attribution', async () => {
        // Given a landing URL with an unrelated param
        setLandingURL('?utm_source=reddit&exitTo=settings&fbclid=testFbclid');

        // When the attribution is captured
        captureMarketingAttributionFromURL();
        savePendingMarketingAttribution(false);
        await waitForBatchedUpdates();

        // Then only the attribution param is stored
        expect(await getStoredAttribution()).toEqual({utm_source: 'reddit'});
    });

    it('replaces the stored attribution when the URL carries new params', async () => {
        // Given attribution stored from an earlier Google ad click
        await Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, {utm_source: 'google', utm_medium: 'cpc', gclid: 'testGclid', device: 'm'});

        // When the user lands again from a Reddit ad
        setLandingURL('?utm_source=reddit&utm_campaign=spring');
        captureMarketingAttributionFromURL();
        savePendingMarketingAttribution(false);
        await waitForBatchedUpdates();

        // Then only the Reddit values are kept, so values from the two clicks are not combined
        expect(await getStoredAttribution()).toEqual({utm_source: 'reddit', utm_campaign: 'spring'});
    });

    it('keeps the stored attribution when the URL carries no params', async () => {
        // Given attribution stored from an earlier ad click
        await Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, {utm_source: 'google', gclid: 'testGclid'});

        // When the user comes back without any attribution params
        setLandingURL('');
        captureMarketingAttributionFromURL();
        savePendingMarketingAttribution(false);
        await waitForBatchedUpdates();

        // Then the stored attribution is kept
        expect(await getStoredAttribution()).toEqual({utm_source: 'google', gclid: 'testGclid'});
    });

    it('does not store the attribution when the user already has a session', async () => {
        // Given a signed-in user and a landing URL with UTM params
        await Onyx.set(ONYXKEYS.SESSION, {authToken: 'testAuthToken', email: 'test@test.com'});
        setLandingURL('?utm_source=google&utm_medium=cpc');

        // When the attribution is captured and the session has loaded
        captureMarketingAttributionFromURL();
        renderHook(() => useSaveMarketingAttribution());
        await waitForBatchedUpdates();

        // Then the key stays unset
        expect(await getStoredAttribution()).toBeUndefined();
    });

    it('stores the attribution when the user has no session', async () => {
        // Given no session and a landing URL with UTM params
        setLandingURL('?utm_source=google&utm_medium=cpc');

        // When the attribution is captured and the session has loaded
        captureMarketingAttributionFromURL();
        renderHook(() => useSaveMarketingAttribution());
        await waitForBatchedUpdates();

        // Then the attribution is written
        expect(await getStoredAttribution()).toEqual({utm_source: 'google', utm_medium: 'cpc'});
    });

    it('saves the captured attribution only once', async () => {
        // Given attribution captured from the landing URL and saved
        setLandingURL('?utm_source=google');
        captureMarketingAttributionFromURL();
        savePendingMarketingAttribution(false);
        await waitForBatchedUpdates();

        // When the stored value is cleared, as signup does, and the save runs again
        await Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, null);
        savePendingMarketingAttribution(false);
        await waitForBatchedUpdates();

        // Then the attribution is not written again
        expect(await getStoredAttribution()).toBeUndefined();
    });
});
