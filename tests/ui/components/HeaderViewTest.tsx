import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import type Navigation from '@libs/Navigation/Navigation';
import {buildOptimisticCreatedReportForUnapprovedAction} from '@libs/ReportUtils';

import HeaderView from '@pages/inbox/HeaderView';

import {joinRoom} from '@userActions/Report';
import type * as ReportType from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {KeyValueMapping} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createRandomReport, createRegularChat} from '../../utils/collections/reports';
import createMock from '../../utils/createMock';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => jest.fn(),
    };
});

jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportType>('@userActions/Report'),
    joinRoom: jest.fn(),
}));

const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const currentUserAccountID = 1;

describe('HeaderView', () => {
    beforeEach(() => {
        // Set up default mock return value
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: currentUserAccountID,
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    it('should update invoice room title when the invoice receiver detail is updated', async () => {
        // Given an invoice room header
        const chatReportID = '1';
        const accountID = 2;
        let displayName = 'test';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}` as const;
        const report: Report = {
            ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.INVOICE),
            invoiceReceiver: {
                accountID,
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
            },
        };
        await act(async () => {
            await Onyx.multiSet(
                createMock<KeyValueMapping>({
                    [reportKey]: report,
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                        [accountID]: {
                            accountID,
                            displayName,
                        },
                    },
                }),
            );
        });

        render(
            <LocaleContextProvider>
                <OnyxListItemProvider>
                    <HeaderView
                        onNavigationMenuButtonClicked={() => {}}
                        reportID={report.reportID}
                    />
                </OnyxListItemProvider>
            </LocaleContextProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Report attributes recompute is coalesced onto a microtask, so the title can settle a tick after
        // the initial flush; waitFor retries until the derived recompute + re-render lands.
        await waitFor(() => expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName));

        // When the invoice receiver display name is updated
        displayName = 'test edit';
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [accountID]: {
                    displayName,
                },
            });
        });

        // Then the header title should be updated using the new display name
        await waitFor(() => expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName));
    });

    it('should display join button', async () => {
        // Given an policy room header
        const report = {
            ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
            reportName: 'Test Room',
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
        await waitForBatchedUpdates();

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <HeaderView
                    onNavigationMenuButtonClicked={() => {}}
                    reportID={report.reportID}
                />
            </ComposeProviders>,
        );

        await waitForBatchedUpdatesWithAct();
        // When the header display the Join button
        const joinButton = screen.getByText('Join');
        expect(joinButton).toBeTruthy();

        // Then the joinRoom action should be called when the user presses the Join button
        fireEvent.press(joinButton);
        expect(joinRoom).toHaveBeenCalledWith(report, currentUserAccountID);
    });

    it('should display correct title for report with CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS parent action', async () => {
        // Given a chat thread with a CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS parent action
        const originalReportID = '100';
        const originalReportName = 'Original Report';
        const parentReportID = '200';
        const threadReportID = '300';

        const originalReport = {
            ...createRandomReport(Number(originalReportID), undefined),
            reportName: originalReportName,
        };

        const parentReport = createRandomReport(Number(parentReportID), undefined);

        const parentReportAction: ReportAction = buildOptimisticCreatedReportForUnapprovedAction(parentReportID, originalReportID);

        const threadReport = {
            ...createRandomReport(Number(threadReportID), undefined),
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID,
            parentReportActionID: parentReportAction.reportActionID,
        };

        // Set report actions first so they're available when the derived value computes report names
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}` as `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`, {
            [parentReportAction.reportActionID]: parentReportAction,
        });
        await waitForBatchedUpdates();

        const originalReportKey = `${ONYXKEYS.COLLECTION.REPORT}${originalReportID}` as const;
        const parentReportKey = `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}` as const;
        const threadReportKey = `${ONYXKEYS.COLLECTION.REPORT}${threadReportID}` as const;
        await Onyx.multiSet(
            createMock<KeyValueMapping>({
                [originalReportKey]: originalReport,
                [parentReportKey]: parentReport,
                [threadReportKey]: threadReport,
            }),
        );

        render(
            <LocaleContextProvider>
                <OnyxListItemProvider>
                    <HeaderView
                        onNavigationMenuButtonClicked={() => {}}
                        reportID={threadReport.reportID}
                    />
                </OnyxListItemProvider>
            </LocaleContextProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Then the header should display a title containing the message about held expenses
        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(/created this report for any held expenses from/);
    });

    const accountManagerAccountID = 777;
    const otherAccountID = 888;
    const accountManagerCalendarLink = 'https://calendly.com/account-manager/expensify';

    const personalDetailsList = {
        [currentUserAccountID]: {accountID: currentUserAccountID, login: 'me@example.com', displayName: 'My Account'},
        [accountManagerAccountID]: {accountID: accountManagerAccountID, login: 'am@example.com', displayName: 'Account Manager'},
        [otherAccountID]: {accountID: otherAccountID, login: 'other@example.com', displayName: 'Someone Else'},
    };

    function renderHeader(reportID: string) {
        return render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <HeaderView
                    onNavigationMenuButtonClicked={() => {}}
                    reportID={reportID}
                />
            </ComposeProviders>,
        );
    }

    it('should display the localized category update message for a thread on a category update action', async () => {
        // Given an #admins room with a report action that made attendees required on a category
        const policyID = '400';
        const adminsReportID = '401';
        const threadReportID = '402';
        const rawServerMessage = 'updated the category "Advertising" by changing the Attendees from Not Required to Required';

        const parentReportAction: ReportAction = {
            reportActionID: '4001',
            actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY,
            created: '2026-01-01 00:00:00.000',
            message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: rawServerMessage, text: rawServerMessage}],
            originalMessage: {
                categoryName: 'Advertising',
                updatedField: 'areAttendeesRequired',
                oldValue: '',
                newValue: true,
            },
        };

        const adminsReport = {
            ...createRandomReport(Number(adminsReportID), CONST.REPORT.CHAT_TYPE.POLICY_ADMINS),
            type: CONST.REPORT.TYPE.CHAT,
            policyID,
        };

        // And a chat thread opened on that action
        const threadReport = {
            ...createRandomReport(Number(threadReportID), undefined),
            type: CONST.REPORT.TYPE.CHAT,
            policyID,
            parentReportID: adminsReportID,
            parentReportActionID: parentReportAction.reportActionID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsReportID}`, {
            [parentReportAction.reportActionID]: parentReportAction,
        });
        await waitForBatchedUpdates();

        const adminsReportKey = `${ONYXKEYS.COLLECTION.REPORT}${adminsReportID}` as const;
        const threadReportKey = `${ONYXKEYS.COLLECTION.REPORT}${threadReportID}` as const;
        await Onyx.multiSet(
            createMock<KeyValueMapping>({
                [adminsReportKey]: adminsReport,
                [threadReportKey]: threadReport,
            }),
        );

        renderHeader(threadReport.reportID);
        await waitForBatchedUpdatesWithAct();

        // Then the thread header should show the same copy as the system message in the chat
        await waitFor(() => expect(screen.getByTestId('DisplayNames')).toHaveTextContent(translateLocal('workspaceActions.updateAreAttendeesRequired', 'Advertising', true)));
    });

    it('should display the Book a call button in the 1:1 DM with the account manager', async () => {
        // Given a 1:1 DM with the assigned account manager who has a calendar link
        const report = createRegularChat(500, [currentUserAccountID, accountManagerAccountID]);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {accountManagerAccountID, accountManagerCalendarLink});
        });

        renderHeader(report.reportID);
        await waitForBatchedUpdatesWithAct();

        // Then the Book a call button is shown
        expect(screen.getByText(translateLocal('videoChatButtonAndMenu.tooltip'))).toBeOnTheScreen();
    });

    it('should display the Book a call button in the Concierge chat when an account manager is assigned', async () => {
        // Given the Concierge chat and an assigned account manager with a calendar link
        const report = createRegularChat(501, [currentUserAccountID]);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, report.reportID);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {accountManagerAccountID, accountManagerCalendarLink});
        });

        renderHeader(report.reportID);
        await waitForBatchedUpdatesWithAct();

        // Then the Book a call button is shown
        expect(screen.getByText(translateLocal('videoChatButtonAndMenu.tooltip'))).toBeOnTheScreen();
    });

    it('should not display the Book a call button in the account manager DM when there is no calendar link', async () => {
        // Given a 1:1 DM with the account manager but no calendar link
        const report = createRegularChat(500, [currentUserAccountID, accountManagerAccountID]);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {accountManagerAccountID});
        });

        renderHeader(report.reportID);
        await waitForBatchedUpdatesWithAct();

        // Then the Book a call button is not shown
        expect(screen.queryByText(translateLocal('videoChatButtonAndMenu.tooltip'))).not.toBeOnTheScreen();
    });

    it('should not display the Book a call button in a 1:1 DM with someone who is not the account manager', async () => {
        // Given a 1:1 DM whose participant is not the assigned account manager
        const report = createRegularChat(500, [currentUserAccountID, otherAccountID]);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {accountManagerAccountID, accountManagerCalendarLink});
        });

        renderHeader(report.reportID);
        await waitForBatchedUpdatesWithAct();

        // Then the Book a call button is not shown
        expect(screen.queryByText(translateLocal('videoChatButtonAndMenu.tooltip'))).not.toBeOnTheScreen();
    });
});
