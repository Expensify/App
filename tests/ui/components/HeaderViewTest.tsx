import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {KeyValueMapping} from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type Navigation from '@libs/Navigation/Navigation';
import {buildOptimisticCreatedReportForUnapprovedAction} from '@libs/ReportUtils';
import HeaderView from '@pages/home/HeaderView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import {createRandomReport} from '../../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => jest.fn(),
    };
});

jest.mock('@hooks/useCurrentUserPersonalDetails');

describe('HeaderView', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
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
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [accountID]: {
                    displayName,
                },
            });
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
            parentReportID,
            parentReportActionID: parentReportAction.reportActionID,
        };

        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`]: originalReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`]: parentReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`]: threadReport,
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`]: {
                [parentReportAction.reportActionID]: parentReportAction,
            },
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
