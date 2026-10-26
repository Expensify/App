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
        // Given the user's onboarding and Concierge context is available in Onyx.
        const conciergeChat = {reportID: CONCIERGE_REPORT_ID, type: CONST.REPORT.TYPE.CHAT} as Report;
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        await act(async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`, conciergeChat);
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, introSelected);
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false, selfTourViewed: true});
        });

        const {result} = await renderOpenReport();
        // When opening an existing report without participant data.
        result.current({personalDetails: undefined, reportID: REPORT_ID, hasReportActions: true});

        // Then the hook forwards the explicit absence of details together with user context.
        expect(openReport).toHaveBeenCalledTimes(1);
        expect(openReport).toHaveBeenCalledWith({
            reportID: REPORT_ID,
            hasReportActions: true,
            personalDetails: undefined,
            introSelected,
            conciergeChat,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            isSelfTourViewed: true,
            hasCompletedGuidedSetupFlow: false,
        });
    });

    it('passes the caller params through unchanged', async () => {
        // Given the caller has participant data for report creation.
        const participantAccountID = 2;
        const personalDetails = {[participantAccountID]: {accountID: participantAccountID, login: 'participant@example.com'}};
        const {result} = await renderOpenReport();
        // When opening the report, the hook must retain the caller's data.
        result.current({personalDetails, reportID: REPORT_ID, hasReportActions: false, shouldMarkAsRead: false, reportActionID: '300'});

        // Then supplied personal details are forwarded without being replaced.
        expect(openReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: REPORT_ID,
                personalDetails,
                hasReportActions: false,
                shouldMarkAsRead: false,
                reportActionID: '300',
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            }),
        );
    });

    it('leaves the Onyx-backed params empty when nothing is stored', async () => {
        // Given Onyx has no user context yet.
        const {result} = await renderOpenReport();
        // When the report is opened before context has loaded.
        result.current({personalDetails: undefined, reportID: REPORT_ID, hasReportActions: undefined});

        // Then missing context stays undefined.
        expect(openReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: REPORT_ID,
                introSelected: undefined,
                conciergeChat: undefined,
            }),
        );
    });
});
