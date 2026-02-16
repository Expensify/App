import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestStepTimeRate from '@pages/iou/request/step/IOURequestStepTimeRate';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModalWithReport: jest.fn(),
    isNavigationReady: () => Promise.resolve(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Time_Rate',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }),
        useFocusEffect: jest.fn((callback: () => void) => callback()),
        useRoute: () => ({
            params: {},
        }),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => () => false);

jest.mock('@hooks/useResponsiveLayout', () => () => ({
    shouldUseNarrowLayout: false,
    isExtraSmallScreenHeight: false,
    isExtraSmallScreenWidth: false,
    isSmallScreenWidth: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const TRANSACTION_ID = 'transaction-1';
const REPORT_ID = 'report-1';

describe('IOURequestStepTimeRate', () => {
    let setMoneyRequestAmountSpy: jest.SpyInstance;
    let setMoneyRequestMerchantSpy: jest.SpyInstance;
    let setMoneyRequestTimeRateSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        setMoneyRequestAmountSpy = jest.spyOn(require('@libs/actions/IOU'), 'setMoneyRequestAmount');
        setMoneyRequestMerchantSpy = jest.spyOn(require('@libs/actions/IOU'), 'setMoneyRequestMerchant');
        setMoneyRequestTimeRateSpy = jest.spyOn(require('@libs/actions/IOU'), 'setMoneyRequestTimeRate');
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    function renderComponent(action: IOUAction = CONST.IOU.ACTION.CREATE) {
        return render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <IOURequestStepTimeRate
                        route={{
                            key: 'IOURequestStepTimeRate',
                            params: {
                                iouType: CONST.IOU.TYPE.SUBMIT,
                                reportID: REPORT_ID,
                                transactionID: TRANSACTION_ID,
                                action,
                                reportActionID: '1',
                            },
                            name: SCREENS.MONEY_REQUEST.STEP_TIME_RATE,
                        }}
                        // @ts-expect-error we don't need navigation param here
                        navigation={undefined}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
    }

    describe('rendering', () => {
        it('should display existing rate from transaction', async () => {
            const existingRate = 7500; // $75.00

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    currency: CONST.CURRENCY.USD,
                    comment: {
                        units: {
                            count: 8,
                            rate: existingRate,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            // The rate 7500 (cents) should be displayed as 75.00 in the amount input
            expect(screen.getByDisplayValue('75.00')).toBeDefined();
        });

        it('should display currency from transaction', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    currency: CONST.CURRENCY.EUR,
                    comment: {
                        units: {
                            count: 5,
                            rate: 6000,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            // The EUR currency symbol should be displayed
            expect(screen.getByText('€')).toBeDefined();
            // The rate 6000 (cents) should be displayed as 60.00
            expect(screen.getByDisplayValue('60.00')).toBeDefined();
        });
    });

    describe('rate input and saving', () => {
        it('should save rate and compute correct amount', async () => {
            const hours = 8;
            const rate = 5000; // $50.00 in cents

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    currency: CONST.CURRENCY.USD,
                    comment: {
                        units: {
                            count: hours,
                            rate,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            const saveButton = screen.getByTestId('next-button');
            fireEvent.press(saveButton);
            await waitForBatchedUpdatesWithAct();

            expect(setMoneyRequestTimeRateSpy).toHaveBeenCalledWith(TRANSACTION_ID, rate, true);
            // computeTimeAmount(5000, 8) = 40000
            expect(setMoneyRequestAmountSpy).toHaveBeenCalledWith(TRANSACTION_ID, 40000, CONST.CURRENCY.USD);
            expect(setMoneyRequestMerchantSpy).toHaveBeenCalledWith(TRANSACTION_ID, '8 hours @ $50.00 / hour', true);
        });
    });

    describe('currency handling', () => {
        it('should use transaction currency for calculations', async () => {
            const hours = 6;
            const rate = 4000; // €40.00 in cents

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    currency: CONST.CURRENCY.EUR,
                    comment: {
                        units: {
                            count: hours,
                            rate,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            const saveButton = screen.getByTestId('next-button');
            fireEvent.press(saveButton);
            await waitForBatchedUpdatesWithAct();

            // computeTimeAmount(4000, 6) = 24000
            expect(setMoneyRequestAmountSpy).toHaveBeenCalledWith(TRANSACTION_ID, 24000, CONST.CURRENCY.EUR);
        });

        it('should display currency symbol without a pressable wrapper', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    currency: 'GBP',
                    comment: {
                        units: {
                            count: 7,
                            rate: 4500,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            // Currency symbol is displayed
            expect(screen.getByText('£')).toBeDefined();
            // The currency symbol should not be inside a pressable (isCurrencyPressable={false})
            expect(screen.queryByLabelText(/select.*currency/i)).toBeNull();
        });
    });
});
