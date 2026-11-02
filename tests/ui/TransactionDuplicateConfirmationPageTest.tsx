import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import DynamicConfirmationPage from '@pages/TransactionDuplicate/DynamicConfirmationPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const SUBMITTER_ACCOUNT_ID = 1;
const ADMIN_ACCOUNT_ID = 2;
const POLICY_ID = 'policyWithDuplicates';
const EXPENSE_REPORT_ID = 'expenseReportWithDuplicates';
const TRANSACTION_THREAD_REPORT_ID = 'threadOfKeptExpense';
const IOU_ACTION_ID = 'iouActionOfKeptExpense';
const KEPT_TRANSACTION_ID = 'keptTransaction';
const DUPLICATE_TRANSACTION_ID = 'duplicateTransaction';

const REMOVED_INFO = `The duplicates you don't keep will be removed.`;
const HELD_INFO = `The duplicates you don't keep will be held for the submitter to delete.`;

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));

// The expense details are irrelevant to which outcome the page describes, so they are rendered as a lightweight probe
jest.mock('@components/ReportActionItem/MoneyRequestView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="money-request-view" />;
});

const Stack = createPlatformStackNavigator<Record<string, {reportID: string}>>();

TestHelper.setupGlobalFetchMock();

const buildExpense = (transactionID: string) => ({
    transactionID,
    reportID: EXPENSE_REPORT_ID,
    amount: -1000,
    currency: CONST.CURRENCY.USD,
    created: '2026-10-01',
    merchant: 'Coffee Shop',
    comment: {},
});

const renderPageAs = async (accountID: number) => {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <CurrentUserPersonalDetailsContext.Provider value={{accountID}}>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_CONFIRMATION}
                            component={DynamicConfirmationPage}
                            initialParams={{reportID: TRANSACTION_THREAD_REPORT_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </CurrentUserPersonalDetailsContext.Provider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
};

describe('Confirming the details kept from duplicate expenses', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, {
                reportID: EXPENSE_REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: POLICY_ID,
                ownerAccountID: SUBMITTER_ACCOUNT_ID,
                managerID: ADMIN_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${TRANSACTION_THREAD_REPORT_ID}`, {
                ...LHNTestUtils.getFakeReport(),
                reportID: TRANSACTION_THREAD_REPORT_ID,
                policyID: POLICY_ID,
                parentReportID: EXPENSE_REPORT_ID,
                parentReportActionID: IOU_ACTION_ID,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, {
                [IOU_ACTION_ID]: {
                    ...LHNTestUtils.getFakeReportAction(),
                    reportActionID: IOU_ACTION_ID,
                    reportID: EXPENSE_REPORT_ID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    actorAccountID: SUBMITTER_ACCOUNT_ID,
                    childReportID: TRANSACTION_THREAD_REPORT_ID,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: KEPT_TRANSACTION_ID,
                        IOUReportID: EXPENSE_REPORT_ID,
                        amount: 1000,
                        currency: CONST.CURRENCY.USD,
                    },
                },
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${KEPT_TRANSACTION_ID}`, buildExpense(KEPT_TRANSACTION_ID));
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${DUPLICATE_TRANSACTION_ID}`, buildExpense(DUPLICATE_TRANSACTION_ID));
            await Onyx.merge(ONYXKEYS.REVIEW_DUPLICATES, {
                transactionID: KEPT_TRANSACTION_ID,
                reportID: EXPENSE_REPORT_ID,
                duplicates: [DUPLICATE_TRANSACTION_ID],
                merchant: 'Coffee Shop',
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('tells the submitter that the duplicates they do not keep will be removed', async () => {
        // Given the submitter owns the report, so Confirm deletes the duplicates they don't keep

        // When the submitter opens the page to confirm the details they're keeping
        await renderPageAs(SUBMITTER_ACCOUNT_ID);

        // Then the page says the other duplicates will be removed, rather than held for the submitter to delete
        expect(screen.getByText(REMOVED_INFO)).toBeOnTheScreen();
        expect(screen.queryByText(HELD_INFO)).not.toBeOnTheScreen();
    });

    it('tells an admin that the duplicates they do not keep will be held for the submitter', async () => {
        // Given an admin doesn't own the submitter's report, so Confirm holds the duplicates they don't keep

        // When the admin opens the page to confirm the details they're keeping
        await renderPageAs(ADMIN_ACCOUNT_ID);

        // Then the page says the other duplicates will be held for the submitter to delete
        expect(screen.getByText(HELD_INFO)).toBeOnTheScreen();
        expect(screen.queryByText(REMOVED_INFO)).not.toBeOnTheScreen();
    });
});
