import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ChatActionableButtons from '@pages/inbox/report/actionContents/ChatActionableButtons';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const PARENT_REPORT_ID = 'parent-report-100';
const THREAD_REPORT_ID = 'thread-report-200';
const CURRENT_USER_ACCOUNT_ID = 1;

function createConciergeCategoryOptionsAction(options: string[]): ReportAction {
    return {
        reportActionID: 'concierge-category-action-1',
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        created: '2025-07-12 09:03:17.653',
        actionName: CONST.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS,
        automatic: true,
        shouldShow: true,
        avatar: '',
        person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
        message: [{type: 'COMMENT', html: 'Pick a category', text: 'Pick a category'}],
        originalMessage: {
            options,
        },
    } as ReportAction;
}

function renderChatActionableButtons(action: ReportAction, originalReportID: string | undefined, reportID: string | undefined) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ChatActionableButtons
                action={action}
                originalReportID={originalReportID}
                reportID={reportID}
                hasPendingFollowupListSkeleton={false}
            />
        </ComposeProviders>,
    );
}

describe('ChatActionableButtons', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@test.com'});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [CURRENT_USER_ACCOUNT_ID]: {
                    accountID: CURRENT_USER_ACCOUNT_ID,
                    login: 'test@test.com',
                    displayName: 'Test User',
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('renders concierge category buttons using visible report when original report is not in Onyx', async () => {
        const action = createConciergeCategoryOptionsAction(['Travel', 'Meals']);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, {
                reportID: THREAD_REPORT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            } as Report);
        });

        renderChatActionableButtons(action, PARENT_REPORT_ID, THREAD_REPORT_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('1 - Travel')).toBeOnTheScreen();
        expect(screen.getByText('2 - Meals')).toBeOnTheScreen();
    });

    it('does not render concierge category buttons when neither original nor visible report is in Onyx', async () => {
        const action = createConciergeCategoryOptionsAction(['Travel']);

        renderChatActionableButtons(action, PARENT_REPORT_ID, THREAD_REPORT_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText('1 - Travel')).not.toBeOnTheScreen();
    });
});
