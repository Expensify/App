import {act, renderHook} from '@testing-library/react-native';

import useOpenReport from '@hooks/useOpenReport';

import {openReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CONCIERGE_REPORT_ID = '100';
const REPORT_ID = '200';

jest.mock('@userActions/Report', () => ({
    openReport: jest.fn(),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: CURRENT_USER_ACCOUNT_ID}));

const renderOpenReport = async () => {
    const hook = renderHook(() => useOpenReport());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useOpenReport', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('fills in the current user, intro selection, Concierge chat and onboarding status', async () => {
        const conciergeChat = {reportID: CONCIERGE_REPORT_ID, type: CONST.REPORT.TYPE.CHAT} as Report;
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        await act(async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`, conciergeChat);
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, introSelected);
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false, selfTourViewed: true});
        });

        const {result} = await renderOpenReport();
        result.current({reportID: REPORT_ID, hasReportActions: true});

        expect(openReport).toHaveBeenCalledTimes(1);
        expect(openReport).toHaveBeenCalledWith({
            reportID: REPORT_ID,
            hasReportActions: true,
            introSelected,
            conciergeChat,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            isSelfTourViewed: true,
            hasCompletedGuidedSetupFlow: false,
        });
    });

    it('passes the caller params through unchanged', async () => {
        const {result} = await renderOpenReport();
        result.current({reportID: REPORT_ID, hasReportActions: false, shouldMarkAsRead: false, reportActionID: '300'});

        expect(openReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: REPORT_ID,
                hasReportActions: false,
                shouldMarkAsRead: false,
                reportActionID: '300',
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            }),
        );
    });

    it('leaves the Onyx-backed params empty when nothing is stored', async () => {
        const {result} = await renderOpenReport();
        result.current({reportID: REPORT_ID, hasReportActions: undefined});

        expect(openReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: REPORT_ID,
                introSelected: undefined,
                conciergeChat: undefined,
            }),
        );
    });
});
