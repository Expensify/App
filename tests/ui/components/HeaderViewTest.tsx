import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {KeyValueMapping} from 'react-native-onyx';
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
import type {ReportAction} from '@src/types/onyx';
import {createRandomReport} from '../../utils/collections/reports';
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

const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.MockedFunction<typeof useCurrentUserPersonalDetails>;
const currentUserAccountID = 1;

describe('HeaderView', () => {
    beforeEach(() => {
        // Set up default mock return value
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: currentUserAccountID,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    it('should update invoice room title when the invoice receiver detail is updated', async () => {
        // Given an invoice room header
        const chatReportID = '1';
        const accountID = 2;
        let displayName = 'test';
        const report = {
            ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.INVOICE),
            invoiceReceiver: {
                accountID,
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
            },
        };
        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]: report,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [accountID]: {
                        displayName,
                    },
                },
            } as unknown as KeyValueMapping);
        });

        render(
            <LocaleContextProvider>
                <OnyxListItemProvider>
                    <HeaderView
                        report={report}
                        onNavigationMenuButtonClicked={() => {}}
                        parentReportAction={null}
                        reportID={report.reportID}
                    />
                </OnyxListItemProvider>
            </LocaleContextProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);

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
        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);
    });

    it('should display join button', async () => {
        // Given an policy room header
        const report = {
            ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
            reportName: 'Test Room',
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        };

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <HeaderView
                    report={report}
                    onNavigationMenuButtonClicked={() => {}}
                    parentReportAction={null}
                    reportID={report.reportID}
                    shouldUseNarrowLayout
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

        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`]: originalReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`]: parentReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`]: threadReport,
        } as unknown as KeyValueMapping);

        render(
            <LocaleContextProvider>
                <OnyxListItemProvider>
                    <HeaderView
                        report={threadReport}
                        onNavigationMenuButtonClicked={() => {}}
                        parentReportAction={parentReportAction}
                        reportID={threadReport.reportID}
                    />
                </OnyxListItemProvider>
            </LocaleContextProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Then the header should display a title containing the message about held expenses
        expect(screen.getByTestId('DisplayNames')).toHaveTextContent(/created this report for any held expenses from/);
    });
});
