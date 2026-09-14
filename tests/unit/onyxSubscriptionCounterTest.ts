import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import OnyxSubscriptionCounter from '@libs/telemetry/onyxSubscriptionCounter';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Guards `onyxSubscriptionCounter` itself. The instrument is only useful if it counts real subscription work
 * and does not perturb what it measures, so both properties are asserted here rather than assumed.
 */

const WATCHED_ACCOUNT_ID = 1;

const displayNameSelector = (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[WATCHED_ACCOUNT_ID]?.firstName;

function useSelectorConsumer() {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: displayNameSelector});
}

function useWholeListConsumer() {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
}

describe('onyxSubscriptionCounter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[WATCHED_ACCOUNT_ID]: {accountID: WATCHED_ACCOUNT_ID, firstName: 'before'}});
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        OnyxSubscriptionCounter.stop();
    });

    it('counts nothing outside a counting window', async () => {
        renderHook(useWholeListConsumer);
        await waitForBatchedUpdates();

        expect(OnyxSubscriptionCounter.stop()).toEqual({});
    });

    it('counts hook runs and selector runs caused by a one-member merge', async () => {
        renderHook(useWholeListConsumer);
        renderHook(useSelectorConsumer);
        await waitForBatchedUpdates();

        OnyxSubscriptionCounter.start();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[WATCHED_ACCOUNT_ID]: {firstName: 'after'}});
        await waitForBatchedUpdates();
        const counts = OnyxSubscriptionCounter.stop();

        expect(counts[ONYXKEYS.PERSONAL_DETAILS_LIST].hookRuns).toBeGreaterThan(0);
        expect(counts[ONYXKEYS.PERSONAL_DETAILS_LIST].selectorRuns).toBeGreaterThan(0);
    });

    it('does not re-run the selector on a render that changes no Onyx data', async () => {
        const {rerender} = renderHook(useSelectorConsumer);
        await waitForBatchedUpdates();

        OnyxSubscriptionCounter.start();
        rerender(undefined);
        await waitForBatchedUpdates();
        const counts = OnyxSubscriptionCounter.stop();

        // The re-render must be counted. If the counter's selector wrapper had an unstable identity, Onyx would
        // also see `hasSelectorChanged` and recompute the selector here, which is the perturbation to catch.
        expect(counts[ONYXKEYS.PERSONAL_DETAILS_LIST].hookRuns).toBeGreaterThan(0);
        expect(counts[ONYXKEYS.PERSONAL_DETAILS_LIST].selectorRuns).toBe(0);
    });
});
