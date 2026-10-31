import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {explain} from '@libs/actions/Report';

import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Report', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@libs/actions/Report');
    return {
        ...actual,
        explain: jest.fn(),
    };
});

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'explainer@example.com';
const CONCIERGE_REPORT_ID = 'concierge1';
const ORIGINAL_REPORT_ID = 'report1';
const CONCIERGE_REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}` as const;

const originalReport = {reportID: ORIGINAL_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE} as Report;
const conciergeChat = {reportID: CONCIERGE_REPORT_ID} as Report;
const reimbursedAction = {
    reportActionID: 'action1',
    actorAccountID: 2,
    actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
    created: '2026-10-20 00:00:00.000',
    originalMessage: {reasoning: 'Routed through Corpay because the withdrawal account is outside the United States.'},
} as ReportAction;

describe('ReportActionItemMessageWithExplain', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('passes the Onyx-backed values to explain when the link is pressed', async () => {
        // Given a signed-in user whose onboarding, intro choice and Concierge chat live in Onyx
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL}},
                [ONYXKEYS.NVP_INTRO_SELECTED]: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                [ONYXKEYS.NVP_ONBOARDING]: {selfTourViewed: true},
                [ONYXKEYS.CONCIERGE_REPORT_ID]: CONCIERGE_REPORT_ID,
                [CONCIERGE_REPORT_KEY]: conciergeChat,
            });
        });

        render(
            <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <ReportActionItemMessageWithExplain
                    message="Reimbursed via ACH"
                    action={reimbursedAction}
                    childReport={undefined}
                    originalReport={originalReport}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user presses the Explain link
        fireEvent.press(screen.getByText('Explain'));
        await waitForBatchedUpdatesWithAct();

        // Then explain receives the press-time reads, because the thread it creates depends on the tour state, intro choice and Concierge chat
        expect(explain).toHaveBeenCalledTimes(1);
        expect(explain).toHaveBeenCalledWith(
            expect.objectContaining({
                originalReport,
                reportAction: reimbursedAction,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                introSelected: expect.objectContaining({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}),
                isSelfTourViewed: true,
                conciergeChat: expect.objectContaining({reportID: CONCIERGE_REPORT_ID}),
            }),
        );
    });
});
