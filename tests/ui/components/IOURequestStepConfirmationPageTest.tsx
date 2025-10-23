import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import IOURequestStepConfirmationWithWritableReportOrNotFound from '@pages/iou/request/step/IOURequestStepConfirmation';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import * as IOU from '../../../src/libs/actions/IOU';
import {signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));
jest.mock('@libs/actions/IOU', () => {
    const actualNav = jest.requireActual<typeof IOU>('@libs/actions/IOU');
    return {
        ...actualNav,
        startMoneyRequest: jest.fn(),
        startSplitBill: jest.fn(),
    };
});
jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', () => ({
    createNavigationContainerRef: jest.fn(),
    useIsFocused: () => true,
    useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = '1';
const PARTICIPANT_ACCOUNT_ID = 2;
const TRANSACTION_ID = '1';

const DEFAULT_SPLIT_TRANSACTION: Transaction = {
    amount: 0,
    billable: false,
    comment: {
        attendees: [
            {
                accountID: ACCOUNT_ID,
                avatarUrl: '',
                displayName: '',
                email: ACCOUNT_LOGIN,
                login: ACCOUNT_LOGIN,
                reportID: REPORT_ID,
                selected: true,
                text: ACCOUNT_LOGIN,
            },
        ],
    },
    created: '2025-08-29',
    currency: 'USD',
    isFromGlobalCreate: false,
    merchant: '(none)',
    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
    participantsAutoAssigned: true,
    reimbursable: true,
    reportID: REPORT_ID,
    transactionID: TRANSACTION_ID,
};

describe('IOURequestStepConfirmationPageTest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.init({keys: ONYXKEYS});
    });

    it('should not restart the money request creation flow when sending invoice from global FAB', async () => {
        // Given an invoice creation flow started from global FAB menu
        const routeReportID = '1';
        const participantReportID = '2';

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                transactionID: TRANSACTION_ID,
                isFromGlobalCreate: true,
                participants: [
                    {
                        accountID: 1,
                        reportID: participantReportID,
                        iouType: 'invoice',
                    },
                ],
            });
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepConfirmationWithWritableReportOrNotFound
                            route={{
                                key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                                name: 'Money_Request_Step_Confirmation',
                                params: {
                                    action: 'create',
                                    iouType: 'invoice',
                                    transactionID: TRANSACTION_ID,
                                    reportID: routeReportID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here.
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Then startMoneyRequest should not be called from IOURequestConfirmationPage.
        expect(IOU.startMoneyRequest).not.toHaveBeenCalled();
    });

    it('should create a split expense for a scanned receipt', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}1`, {
                ...DEFAULT_SPLIT_TRANSACTION,
                filename: 'receipt1.jpg',
                iouRequestType: 'scan',
                receipt: {source: 'path/to/receipt1.jpg', type: ''},
            });
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepConfirmationWithWritableReportOrNotFound
                            route={{
                                key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                                name: 'Money_Request_Step_Confirmation',
                                params: {
                                    action: 'create',
                                    iouType: 'split',
                                    transactionID: TRANSACTION_ID,
                                    reportID: REPORT_ID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here.
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        fireEvent.press(await screen.findByText(translateLocal('iou.splitExpense')));
        expect(IOU.startSplitBill).toHaveBeenCalledTimes(1);
    });

    it('should create a split expense for each scanned receipt', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}1`, {
                ...DEFAULT_SPLIT_TRANSACTION,
                filename: 'receipt1.jpg',
                iouRequestType: 'scan',
                receipt: {source: 'path/to/receipt1.jpg', type: ''},
                transactionID: '1',
            });
        });

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}2`, {
                ...DEFAULT_SPLIT_TRANSACTION,
                filename: 'receipt2.jpg',
                iouRequestType: 'scan',
                receipt: {source: 'path/to/receipt2.jpg', type: ''},
                transactionID: '2',
            });
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepConfirmationWithWritableReportOrNotFound
                            route={{
                                key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                                name: 'Money_Request_Step_Confirmation',
                                params: {
                                    action: 'create',
                                    iouType: 'split',
                                    transactionID: TRANSACTION_ID,
                                    reportID: REPORT_ID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here.
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        fireEvent.press(await screen.findByText(translateLocal('iou.createExpenses', {expensesNumber: 2})));
        expect(IOU.startSplitBill).toHaveBeenCalledTimes(2);
    });
});
