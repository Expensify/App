import {act, render} from '@testing-library/react-native';

import ProactiveAppReviewModalManager from '@components/ProactiveAppReviewModalManager';

import * as API from '@libs/API';
import DateUtils from '@libs/DateUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type ModalProps = {
    isVisible: boolean;
    onPositive: () => void;
    onNegative: () => void;
    onSkip: () => void;
};

const modal: {props?: ModalProps} = {};

/** Read through a call so the assertions are not narrowed by the resets between renders. */
function getModalProps(): ModalProps | undefined {
    return modal.props;
}

jest.mock('@components/ProactiveAppReviewModal', () => {
    return (props: ModalProps) => {
        modal.props = props;
        return null;
    };
});
jest.mock('@libs/actions/StoreReview');
jest.mock('@libs/API');
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1, email: 'test@expensify.com'}));

const mockAPI = jest.mocked(API);

const ACCOUNT_ID = 1;
const FORTY_DAYS_AGO = DateUtils.getDBTime(Date.now() - 40 * 24 * 60 * 60 * 1000);

/** The authoritative nvp_appReview an account in the #99564 state receives on every full app load. */
const STALE_SERVER_NVP = {trigger: 'submit', response: 'negative', lastPrompt: FORTY_DAYS_AGO} as const;

function renderManager() {
    return render(<ProactiveAppReviewModalManager />);
}

describe('ProactiveAppReviewModalManager', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        modal.props = undefined;
        // Emulate the real API layer: apply optimisticData to Onyx, then a 200 with empty onyxData.
        // @ts-expect-error test mock
        mockAPI.write.mockImplementation((command, params, onyxData) => {
            if (!onyxData?.optimisticData) {
                return;
            }
            Onyx.update(onyxData.optimisticData);
        });
        return Onyx.clear()
            .then(() => Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'test@expensify.com'}))
            .then(waitForBatchedUpdates);
    });

    it('stays closed after a negative response when the authoritative NVP comes back without lastPrompt', async () => {
        // Given the server asked us to prompt
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit'});
        await waitForBatchedUpdates();

        renderManager();
        await waitForBatchedUpdates();

        expect(getModalProps()?.isVisible).toBe(true);

        // When the user taps "Not really."
        await act(async () => {
            getModalProps()?.onNegative();
            await waitForBatchedUpdates();
        });

        expect(getModalProps()?.isVisible).toBe(false);

        // And when the authoritative nvp_appReview lands (jsonCode 200, response persisted, no lastPrompt)
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'negative'});
            await waitForBatchedUpdates();
        });

        // Then the modal must stay closed
        expect(getModalProps()?.isVisible).toBe(false);
    });

    it('stays closed after skipping when the authoritative NVP comes back without lastPrompt', async () => {
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit'});
        await waitForBatchedUpdates();

        renderManager();
        await waitForBatchedUpdates();

        expect(getModalProps()?.isVisible).toBe(true);

        await act(async () => {
            getModalProps()?.onSkip();
            await waitForBatchedUpdates();
        });

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'skip'});
            await waitForBatchedUpdates();
        });

        expect(getModalProps()?.isVisible).toBe(false);
    });

    it('does not re-open while the stale server NVP keeps landing during sign-in (#99564)', async () => {
        // Given an account the server keeps describing as "prompted 40 days ago, answered negative".
        // On sign-in that payload lands more than once while the rest of the account data streams in.
        await Onyx.set(ONYXKEYS.NVP_APP_REVIEW, STALE_SERVER_NVP);
        await waitForBatchedUpdates();

        renderManager();
        await waitForBatchedUpdates();

        expect(getModalProps()?.isVisible).toBe(true);

        await act(async () => {
            getModalProps()?.onNegative();
            await waitForBatchedUpdates();
        });

        expect(getModalProps()?.isVisible).toBe(false);

        // When the same authoritative payload lands again, overwriting the optimistic lastPrompt
        for (let i = 0; i < 3; i++) {
            await act(async () => {
                await Onyx.set(ONYXKEYS.NVP_APP_REVIEW, STALE_SERVER_NVP);
                await waitForBatchedUpdates();
            });

            // Then the modal must not come back
            expect(getModalProps()?.isVisible).toBe(false);
        }
    });

    it('does not re-open on the next sign-in after the user already answered on this device (#99564)', async () => {
        await Onyx.set(ONYXKEYS.NVP_APP_REVIEW, STALE_SERVER_NVP);
        await waitForBatchedUpdates();

        const firstRender = renderManager();
        await waitForBatchedUpdates();

        expect(getModalProps()?.isVisible).toBe(true);

        await act(async () => {
            getModalProps()?.onNegative();
            await waitForBatchedUpdates();
        });

        expect(getModalProps()?.isVisible).toBe(false);
        firstRender.unmount();

        // When the user signs out (Onyx.clear keeps only KEYS_TO_PRESERVE) and signs back in,
        // so the server's untouched copy is all that is left of nvp_appReview
        await act(async () => {
            await Onyx.clear([ONYXKEYS.APP_REVIEW_LAST_PROMPT]);
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'test@expensify.com'});
            await Onyx.set(ONYXKEYS.NVP_APP_REVIEW, STALE_SERVER_NVP);
            await waitForBatchedUpdates();
        });

        modal.props = undefined;
        renderManager();
        await waitForBatchedUpdates();

        // Then the prompt the user already answered must not come back
        expect(getModalProps()?.isVisible).toBe(false);
    });
});
