import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SupportTicketPreview from '@components/ReportActionItem/SupportTicketPreview';
import SupportTicketView from '@components/ReportActionItem/SupportTicketView';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockShowConfirmModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@libs/Navigation/Navigation');

const mockNavigate = jest.mocked(Navigation.navigate);

const SUPPORT_REP_ACCOUNT_ID = 2;
const SUPPORT_TICKET_REPORT_ID = 'supportTicketReportID';

const supportTicketAction = createMock<ReportAction>({
    reportActionID: 'supportTicketActionID',
    parentReportID: 'conciergeReportID',
    childReportID: SUPPORT_TICKET_REPORT_ID,
    childType: CONST.REPORT.TYPE.SUPPORT_TICKET,
    childStateNum: CONST.REPORT.STATE_NUM.OPEN,
    childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2026-09-30 00:00:00.000',
    message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: '', text: ''}],
});

const supportTicketReport: Report = {
    reportID: SUPPORT_TICKET_REPORT_ID,
    type: CONST.REPORT.TYPE.SUPPORT_TICKET,
    managerID: SUPPORT_REP_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
};

function renderSupportTicketView() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SupportTicketView
                report={supportTicketReport}
                action={supportTicketAction}
            />
        </ComposeProviders>,
    );
}

function renderSupportTicketPreview() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SupportTicketPreview
                action={supportTicketAction}
                isHovered={false}
                style={undefined}
            />
        </ComposeProviders>,
    );
}

describe('Support tickets', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [SUPPORT_REP_ACCOUNT_ID]: {
                    accountID: SUPPORT_REP_ACCOUNT_ID,
                    displayName: 'John Smith',
                    firstName: 'John',
                    login: 'john.smith@expensify.com',
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows the title, description, and assigned support rep for an open ticket', async () => {
        // Given an open support ticket assigned to John
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
                locale: 'en',
                reports: {
                    [SUPPORT_TICKET_REPORT_ID]: {
                        reportName: 'Support ticket, Sep 30, 2026: Jane Doe and John Smith',
                        isEmpty: false,
                        brickRoadStatus: undefined,
                        requiresAttention: false,
                        reportErrors: {},
                    },
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
        renderSupportTicketView();
        await waitForBatchedUpdatesWithAct();

        // When the ticket is shown
        fireEvent.press(screen.getByLabelText(translateLocal('supportTicket.checkboxTooltip')));

        // Then it shows the localized title, description, and read-only assignee
        expect(screen.getByText('Support ticket, Sep 30, 2026: Jane Doe and John Smith')).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('task.description'))).toBeOnTheScreen();
        expect(
            screen.getByText(
                "Hi, I'm John, and I'll work with you until this is fully resolved. If you've already shared details with us, I'll review them before responding so you don't need to repeat yourself. If this is a new issue, let me know what you need help with.",
            ),
        ).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('task.assignee'))).toBeOnTheScreen();
        expect(screen.getByText('John Smith')).toBeOnTheScreen();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('uses the support rep email when their display name is unavailable', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [SUPPORT_REP_ACCOUNT_ID]: {
                    accountID: SUPPORT_REP_ACCOUNT_ID,
                    displayName: '',
                    login: 'support.rep@expensify.com',
                },
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderSupportTicketView();
        await waitForBatchedUpdatesWithAct();

        expect(
            screen.getByText(
                "Hi, I'm support.rep@expensify.com, and I'll work with you until this is fully resolved. If you've already shared details with us, I'll review them before responding so you don't need to repeat yourself. If this is a new issue, let me know what you need help with.",
            ),
        ).toBeOnTheScreen();
    });

    it('uses the derived title in the preview and keeps the checkbox press in place', async () => {
        // Given a support ticket whose derived title is localized
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
                locale: 'en',
                reports: {
                    [SUPPORT_TICKET_REPORT_ID]: {
                        reportName: 'Support ticket, Sep 30, 2026: Jane Doe and John Smith',
                        isEmpty: false,
                        brickRoadStatus: undefined,
                        requiresAttention: false,
                        reportErrors: {},
                    },
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
        renderSupportTicketPreview();
        await waitForBatchedUpdatesWithAct();

        // When the App language changes and the preview checkbox is pressed
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
                locale: 'es',
                reports: {
                    [SUPPORT_TICKET_REPORT_ID]: {
                        reportName: 'Localized support ticket title',
                        isEmpty: false,
                        brickRoadStatus: undefined,
                        requiresAttention: false,
                        reportErrors: {},
                    },
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('supportTicket.checkboxTooltip')));

        // Then the preview updates its localized title and opens the checkbox explanation without navigating away
        expect(screen.getByText('Localized support ticket title')).toBeOnTheScreen();
        expect(mockShowConfirmModal).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
