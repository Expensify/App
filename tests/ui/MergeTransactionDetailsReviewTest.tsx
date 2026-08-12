import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import DynamicConfirmationPage from '@pages/TransactionMerge/DynamicConfirmationPage';
import DynamicDetailsReviewPage from '@pages/TransactionMerge/DynamicDetailsReviewPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import {createRandomDistanceRequestTransaction} from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));

const Stack = createPlatformStackNavigator<Record<string, {transactionID: string}>>();

// Expose each field row's description and title so the rendered distance can be read back
jest.mock('@components/MenuItemWithTopDescription', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({description, title}: {description?: string; title?: string}) => (
        <RN.View testID={`field-${description}`}>
            <RN.Text>{title}</RN.Text>
        </RN.View>
    );
});

TestHelper.setupGlobalFetchMock();

const MERGE_TRANSACTION_ID = 'mergeDistanceTransaction';
const EXCLUDING_POLICY_ID = 'policyThatExcludesCommuterDistance';
const PLAIN_POLICY_ID = 'policyThatExcludesNothing';
const EXCLUDING_REPORT_ID = '4444';
const PLAIN_REPORT_ID = '5555';

const excludingPolicy: Policy = {
    ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
    id: EXCLUDING_POLICY_ID,
    name: 'Workspace that excludes 1 mile',
    commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE, fixedDistance: 1, fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
};
const plainPolicy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: PLAIN_POLICY_ID, name: 'Workspace that excludes nothing'};

const buildReport = (reportID: string, policyID: string, reportName: string): Report => ({
    ...createRandomReport(Number(reportID)),
    reportID,
    policyID,
    reportName,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
});

const buildDistanceExpense = (transactionID: string, reportID: string, merchant: string, quantity: number, commuterExclusion?: number): Transaction => ({
    ...createRandomDistanceRequestTransaction(quantity),
    transactionID,
    reportID,
    merchant,
    modifiedMerchant: merchant,
    // A dollar per billed mile, so the amount and the distance stay readable against each other
    amount: -Math.round((commuterExclusion === undefined ? quantity : quantity - commuterExclusion) * 100),
    currency: CONST.CURRENCY.USD,
    created: '2026-08-01',
    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
    comment: {
        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
        customUnit: {
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            quantity,
            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            ...(commuterExclusion !== undefined && {commuterExclusion, reimbursableDistance: quantity - commuterExclusion}),
        },
        waypoints: {waypoint0: {address: `${merchant} start`}, waypoint1: {address: `${merchant} end`}},
    },
});

// The expense being merged into lives on the workspace that excludes nothing, and the other one on the workspace that
// excludes a commuter mile, which is the combination that decides whether the merged expense gets a deduction
const targetExpense = buildDistanceExpense('targetTransaction', PLAIN_REPORT_ID, '10.20 mi @ $0.67 / mi', 10.2);
const sourceExpense = buildDistanceExpense('sourceTransaction', EXCLUDING_REPORT_ID, '4.49 mi @ $0.67 / mi', 4.49, 1);

describe('Merging distance expenses across workspaces', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${EXCLUDING_POLICY_ID}`, excludingPolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${PLAIN_POLICY_ID}`, plainPolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXCLUDING_REPORT_ID}`, buildReport(EXCLUDING_REPORT_ID, EXCLUDING_POLICY_ID, 'Report that deducts'));
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PLAIN_REPORT_ID}`, buildReport(PLAIN_REPORT_ID, PLAIN_POLICY_ID, 'Report that does not deduct'));
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${targetExpense.transactionID}`, targetExpense);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${sourceExpense.transactionID}`, sourceExpense);
            await Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${MERGE_TRANSACTION_ID}`, {
                targetTransactionID: targetExpense.transactionID,
                sourceTransactionID: sourceExpense.transactionID,
                eligibleTransactions: [targetExpense, sourceExpense],
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    const renderPage = async () => {
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.MERGE_TRANSACTION.DYNAMIC_DETAILS_PAGE}
                            component={DynamicDetailsReviewPage}
                            initialParams={{transactionID: MERGE_TRANSACTION_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
    };

    const press = async (label: string) => {
        const option = screen.getAllByLabelText(label).at(0);
        if (!option) {
            throw new Error(`No option to select for ${label}`);
        }
        fireEvent.press(option);
        await waitForBatchedUpdatesWithAct();
    };

    it("applies the destination workspace's commuter exclusion to the distance that was selected", async () => {
        await renderPage();

        // When the distance of the expense from the workspace that excludes nothing is selected, and the merged expense
        // is put on the report of the workspace that excludes a commuter mile
        await press(targetExpense.merchant);
        await press('Report that deducts');

        // Then that workspace's exclusion is deducted from the selected 10.2 mile distance, and the amount pays for the
        // 9.2 miles that are left rather than for the whole trip
        const mergeTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${MERGE_TRANSACTION_ID}`);
        expect(mergeTransaction?.customUnit?.commuterExclusion).toBe(1);
        expect(mergeTransaction?.customUnit?.reimbursableDistance).toBe(9.2);
        expect(mergeTransaction?.amount).toBe(920);

        // And the confirmation page shows the reimbursable distance, alongside the distance it was deducted from
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.MERGE_TRANSACTION.DYNAMIC_CONFIRMATION_PAGE}
                            component={DynamicConfirmationPage}
                            initialParams={{transactionID: MERGE_TRANSACTION_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('field-Distance • Original: 10.20 mi')).toHaveTextContent('9.20 mi');
    });

    it('deducts nothing when the merged expense is put on the report of a workspace that excludes nothing', async () => {
        await renderPage();

        // When the distance of the expense from the workspace that excludes a commuter mile is selected, but the merged
        // expense is put on the report of the workspace that excludes nothing
        await press(sourceExpense.merchant);
        await press('Report that does not deduct');

        // Then nothing is deducted from it, and the amount pays for the whole trip
        const mergeTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${MERGE_TRANSACTION_ID}`);
        expect(mergeTransaction?.customUnit?.commuterExclusion).toBeUndefined();
        expect(mergeTransaction?.customUnit?.reimbursableDistance).toBeUndefined();
        expect(mergeTransaction?.amount).toBe(449);
    });
});
