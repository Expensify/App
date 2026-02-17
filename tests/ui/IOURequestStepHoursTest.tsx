import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestStepHours from '@pages/iou/request/step/IOURequestStepHours';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useFocusEffect: jest.fn((callback: () => void) => callback()),
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
    usePreventRemove: jest.fn(),
}));

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
const POLICY_ID = 'policy-1';

function createPolicyWithTimeTracking(): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test Policy'),
        id: POLICY_ID,
        outputCurrency: CONST.CURRENCY.USD,
        units: {
            time: {
                enabled: true,
                rate: 50,
            },
        },
    };
}

describe('IOURequestStepHours', () => {
    let setMoneyRequestAmountSpy: jest.SpyInstance;
    let setMoneyRequestMerchantSpy: jest.SpyInstance;
    let setMoneyRequestTimeCountSpy: jest.SpyInstance;
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
        setMoneyRequestTimeCountSpy = jest.spyOn(require('@libs/actions/IOU'), 'setMoneyRequestTimeCount');
        setMoneyRequestTimeRateSpy = jest.spyOn(require('@libs/actions/IOU'), 'setMoneyRequestTimeRate');

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPolicyWithTimeTracking());
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    function renderComponent(
        routeName: typeof SCREENS.MONEY_REQUEST.STEP_HOURS | typeof SCREENS.MONEY_REQUEST.STEP_HOURS_EDIT | typeof SCREENS.MONEY_REQUEST.CREATE = SCREENS.MONEY_REQUEST.STEP_HOURS,
        action: IOUAction = CONST.IOU.ACTION.CREATE,
    ) {
        return render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepHours
                            route={{
                                key: 'IOURequestStepHours',
                                params: {
                                    iouType: CONST.IOU.TYPE.SUBMIT,
                                    reportID: REPORT_ID,
                                    transactionID: TRANSACTION_ID,
                                    action,
                                    reportActionID: '1',
                                },
                                name: routeName,
                            }}
                            // @ts-expect-error we don't need navigation param here
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
    }

    describe('rendering', () => {
        it('should render the hours input component', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            // Verify the hours input (NumberWithSymbolForm) rendered with its "hrs" symbol
            expect(screen.getByText('hrs')).toBeDefined();
            // Verify the Next button is present
            expect(screen.getByText(/next/i)).toBeDefined();
        });

        it('should display existing hours from transaction', async () => {
            const existingHours = 999;

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    comment: {
                        units: {
                            count: existingHours,
                            rate: 5000,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            // NumberWithSymbolForm should display the existing hours value
            expect(screen.getByText(String(existingHours))).toBeDefined();
        });
    });

    describe('hours input validation', () => {
        it('should show error for zero hours', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    comment: {
                        units: {
                            rate: 5000,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            // Find and press the save/next button
            const nextButton = screen.getByText(/next|save/i);
            fireEvent.press(nextButton);

            await waitFor(() => {
                expect(screen.getByText(/greater than zero/i)).toBeDefined();
            });

            expect(setMoneyRequestAmountSpy).not.toHaveBeenCalled();
        });

        it('should accept valid hours', async () => {
            const hours = 2.5;

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    comment: {
                        units: {
                            count: hours,
                            rate: 5000,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            const nextButton = screen.getByText(/next|save/i);
            fireEvent.press(nextButton);

            await waitFor(() => {
                expect(setMoneyRequestTimeCountSpy).toHaveBeenCalledWith(TRANSACTION_ID, hours, true);
            });

            // Should compute amount: 5000 * 2.5 = 12500
            expect(setMoneyRequestAmountSpy).toHaveBeenCalledWith(TRANSACTION_ID, 12500, CONST.CURRENCY.USD);
        });
    });

    describe('time expense transaction fields', () => {
        it('should set all required transaction fields', async () => {
            const hours = 8;
            const rate = 5000;

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {outputCurrency: CONST.CURRENCY.EUR});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                    reportID: REPORT_ID,
                    policyID: POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
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

            const nextButton = screen.getByText(/next|save/i);
            fireEvent.press(nextButton);

            await waitFor(() => {
                expect(setMoneyRequestTimeCountSpy).toHaveBeenCalledWith(TRANSACTION_ID, hours, true);
            });

            // Verify all transaction updates
            expect(setMoneyRequestAmountSpy).toHaveBeenCalledWith(TRANSACTION_ID, 40000, CONST.CURRENCY.EUR);
            expect(setMoneyRequestMerchantSpy).toHaveBeenCalledWith(TRANSACTION_ID, '8 hours @ €50.00 / hour', true);
            expect(setMoneyRequestTimeRateSpy).toHaveBeenCalledWith(TRANSACTION_ID, rate, true);
        });
    });

    describe('rate handling', () => {
        it('should use rate from transaction if available', async () => {
            const hours = 4;
            const customRate = 7500; // $75.00 (different from policy default)

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    comment: {
                        units: {
                            count: hours,
                            rate: customRate,
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            const nextButton = screen.getByText(/next|save/i);
            fireEvent.press(nextButton);

            await waitFor(() => {
                expect(setMoneyRequestAmountSpy).toHaveBeenCalledWith(TRANSACTION_ID, 30000, CONST.CURRENCY.USD);
            });
        });

        it('should use policy default rate if no transaction rate', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                    reportID: REPORT_ID,
                    policyID: POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    comment: {
                        units: {
                            count: 2,
                            // No rate specified
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            const nextButton = screen.getByText(/next|save/i);
            fireEvent.press(nextButton);

            await waitFor(() => {
                // Policy default rate is 50 ($50.00), converted to 5000 (cents). Amount: 5000 * 2 = 10000
                expect(setMoneyRequestAmountSpy).toHaveBeenCalledWith(TRANSACTION_ID, 10000, CONST.CURRENCY.USD);
            });
        });

        it('should not save if rate is undefined', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {units: {time: {enabled: true, rate: undefined}}});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    comment: {
                        units: {
                            count: 5,
                            // No rate specified
                        },
                    },
                });
            });

            renderComponent();

            await waitForBatchedUpdatesWithAct();

            const nextButton = screen.getByText(/next|save/i);
            fireEvent.press(nextButton);

            await waitForBatchedUpdatesWithAct();

            // Should not call any setMoneyRequest functions if rate is undefined
            expect(setMoneyRequestAmountSpy).not.toHaveBeenCalled();
            expect(setMoneyRequestTimeCountSpy).not.toHaveBeenCalled();
        });
    });
});
