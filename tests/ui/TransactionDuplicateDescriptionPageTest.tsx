import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import DynamicReviewDescriptionPage from '@pages/TransactionDuplicate/DynamicReviewDescriptionPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = 'expenseReport';
const THREAD_ID = 'transactionThread';
const TRANSACTION_ID = 'keptTransaction';
const ACTION_ID = 'iouAction';

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@hooks/useReviewDuplicatesNavigation', () => jest.fn(() => ({currentScreenIndex: 0, navigateToNextScreen: jest.fn()})));

const Stack = createPlatformStackNavigator<Record<string, {reportID: string}>>();

TestHelper.setupGlobalFetchMock();

describe('Reviewing duplicate expense descriptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_ID}`, {
                ...LHNTestUtils.getFakeReport(),
                reportID: THREAD_ID,
                parentReportID: REPORT_ID,
                parentReportActionID: ACTION_ID,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [ACTION_ID]: {
                    ...LHNTestUtils.getFakeReportAction(),
                    reportActionID: ACTION_ID,
                    reportID: REPORT_ID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: TRANSACTION_ID,
                        IOUReportID: REPORT_ID,
                        amount: 1000,
                        currency: CONST.CURRENCY.USD,
                        text: '',
                    },
                },
            });

            // Numeric API values deliberately violate the declared description type to exercise the original crash
            const descriptions = [12345, 0, undefined, '', '<strong>Lunch</strong><br />With team'];
            const transactionIDs = descriptions.map((description, index) => (index === 0 ? TRANSACTION_ID : `duplicate${index}`));
            await Promise.all(
                descriptions.map((description, index) =>
                    Onyx.set(
                        `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs[index]}`,
                        Object.assign(
                            createMock<Transaction>({
                                transactionID: transactionIDs[index],
                                reportID: REPORT_ID,
                                amount: -1000,
                                currency: CONST.CURRENCY.USD,
                                created: '2026-11-01',
                                merchant: 'Coffee Shop',
                            }),
                            {comment: {comment: description}},
                        ),
                    ),
                ),
            );
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
                {
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {duplicates: transactionIDs.slice(1)},
                },
            ]);
            await Onyx.set(ONYXKEYS.REVIEW_DUPLICATES, {transactionID: TRANSACTION_ID, reportID: REPORT_ID});
        });
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['12345', '12345'],
        ['0', '0'],
        ['None', ''],
        ['Lunch With team', '<strong>Lunch</strong><br />With team'],
    ])('renders descriptions safely and selects %j without changing the saved value', async (label, value) => {
        // Given duplicate choices contain numeric, zero, missing, empty and HTML descriptions

        // When the real comparison and parser build the description review screen
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_DESCRIPTION}
                            component={DynamicReviewDescriptionPage}
                            initialParams={{reportID: THREAD_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then zero is not None, empty values share one choice, and only display text loses HTML and line breaks
        expect(screen.getByText('12345')).toBeOnTheScreen();
        expect(screen.getByText('0')).toBeOnTheScreen();
        expect(screen.getAllByText('None')).toHaveLength(1);
        fireEvent.press(screen.getByText(label));
        await waitForBatchedUpdatesWithAct();
        expect((await Onyx.get(ONYXKEYS.REVIEW_DUPLICATES))?.description).toBe(value);
    });
});
