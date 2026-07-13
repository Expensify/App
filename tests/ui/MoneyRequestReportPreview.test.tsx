import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import type * as MoneyRequestReportPreviewContext from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext';
import type ReportPreviewActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton';
import type {MoneyRequestReportPreviewProps} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import ScreenWrapper from '@components/ScreenWrapper';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';

import useNetwork from '@hooks/useNetwork';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import * as ReportActions from '@libs/actions/Report';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getFormattedCreated, isManagedCardTransaction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import * as ReportActionUtils from '@src/libs/ReportActionsUtils';
import {getReportName} from '@src/libs/ReportNameUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';

import type {OnyxCollection, OnyxEntry, OnyxMergeInput} from 'react-native-onyx';

import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {actionR14932 as mockAction} from '../../__mocks__/reportData/actions';
import {chatReportR14932 as mockChatReport, iouReportR14932 as mockIOUReport} from '../../__mocks__/reportData/reports';
import {transactionR14932 as mockTransaction} from '../../__mocks__/reportData/transactions';
import {violationsR14932 as mockViolations} from '../../__mocks__/reportData/violations';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockSecondTransactionID = `${mockTransaction.transactionID}2`;
const defaultPreviewTransactions = [mockTransaction, {...mockTransaction, transactionID: mockSecondTransactionID}];
const defaultReportWithTransactionsAndViolations: [OnyxEntry<Report>, Transaction[], OnyxCollection<TransactionViolation[]>] = [
    mockIOUReport,
    defaultPreviewTransactions,
    {violations: mockViolations},
];
let mockDeferredValueOverride: boolean | undefined;

jest.mock('react', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual() returns the real React module for partial mocking
    const actualReact = jest.requireActual('react');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- returning the real React module plus one overridden hook is the standard Jest partial-mock pattern
    return {
        ...actualReact,
        useDeferredValue: (value: boolean) => mockDeferredValueOverride ?? value,
    };
});

jest.mock('@react-navigation/native');

jest.mock('@hooks/useNetwork');
const mockUseNetwork = jest.mocked(useNetwork);

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

const mockUseReportWithTransactionsAndViolations = jest.fn(() => defaultReportWithTransactionsAndViolations);

jest.mock('@src/hooks/useReportWithTransactionsAndViolations', () => ({
    __esModule: true,
    default: (...args: Parameters<typeof mockUseReportWithTransactionsAndViolations>) => mockUseReportWithTransactionsAndViolations(...args),
}));

// Lets a single test force the narrow (mobile) layout. When left undefined every other test
// runs the real hook unchanged, so the existing wide-layout tests keep their behavior.
let mockResponsiveLayoutOverride: ResponsiveLayoutResult | undefined;
jest.mock('@hooks/useResponsiveLayout', () => {
    const actual = jest.requireActual<{default: () => ResponsiveLayoutResult}>('@hooks/useResponsiveLayout');
    return {
        __esModule: true,
        default: () => mockResponsiveLayoutOverride ?? actual.default(),
    };
});

const narrowResponsiveLayout: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: false,
    isExtraLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: true,
    onboardingIsMediumOrLargerScreenWidth: false,
    isInLandscapeMode: false,
};

const wideResponsiveLayout: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isInLandscapeMode: false,
};

// The preview reads `iouReport` from a prop (provided stable by the parent) and its transactions from the
// scoped `useReportTransactionsCollection` hook, so the test drives those two sources directly.
let mockIOUReportProp: OnyxEntry<Report> = mockIOUReport;

const mockUseReportTransactionsCollection = jest.fn(() => toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, defaultPreviewTransactions, (transaction) => transaction.transactionID));

jest.mock('@hooks/useReportTransactionsCollection', () => ({
    __esModule: true,
    default: () => mockUseReportTransactionsCollection(),
}));

type OnHoldMenuOpen = (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean, methodID?: number) => void;

// Capture the onHoldMenuOpen callback the preview passes to the pay button so a held-expense payment can be triggered
// directly with a selected bank account, mirroring a user picking an account in the dropdown for a held report.
// The wrapper still renders the real component so these tests keep exercising it.
const mockOnHoldMenuOpenHolder: {current?: OnHoldMenuOpen} = {current: undefined};
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton', () => {
    const actualReact = jest.requireActual<typeof React>('react');
    const actualModule = jest.requireActual<{default: typeof ReportPreviewActionButton}>('@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton');
    const {useReportPreviewActions} = jest.requireActual<typeof MoneyRequestReportPreviewContext>('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext');
    return {
        __esModule: true,
        default: function MockReportPreviewActionButton() {
            // ReportPreviewActionButton now reads from context instead of props; capture onHoldMenuOpen from the context.
            const {onHoldMenuOpen} = useReportPreviewActions();
            mockOnHoldMenuOpenHolder.current = onHoldMenuOpen;
            return actualReact.createElement(actualModule.default);
        },
    };
});

// Capture the props the preview forwards to the hold menu so the selected bank account that reaches it can be asserted.
const mockHoldMenuPropsHolder: {current?: {isVisible?: boolean; paymentType?: PaymentMethodType; methodID?: number}} = {current: undefined};
jest.mock('@components/ProcessMoneyReportHoldMenu', () => ({
    __esModule: true,
    default: (props: {isVisible?: boolean; paymentType?: PaymentMethodType; methodID?: number}) => {
        mockHoldMenuPropsHolder.current = props;
        return null;
    },
}));

const SELECTED_BANK_ACCOUNT_ID = 9999;

const getIOUActionForReportID = (reportID: string | undefined, transactionID: string | undefined) => {
    if (!reportID || !transactionID) {
        return undefined;
    }
    return {...mockAction, originalMessage: {...mockAction, IOUTransactionID: transactionID}};
};

const hasViolations = (
    reportID: string | undefined,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    _currentUserAccountID: number,
    _currentUserEmailParam: string,
    shouldShowInReview?: boolean,
) => (shouldShowInReview === undefined || shouldShowInReview) && Object.values(transactionViolations ?? {}).length > 0;

const mockContextMenuStateValue = {
    anchor: null,
    report: mockChatReport,
    isReportArchived: false,
    action: mockAction,
    transactionThreadReport: undefined,
    isDisabled: false,
    shouldDisplayContextMenu: true,
    originalReportID: mockChatReport.reportID,
};

const mockContextMenuActionsValue = {
    checkIfContextMenuActive: () => {},
    onShowContextMenu: (callback: () => void) => callback(),
};

const renderPage = ({isWhisper = false, isHovered = false}: Partial<MoneyRequestReportPreviewProps>) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <ScreenWrapper testID="test">
                <PortalProvider>
                    <ShowContextMenuStateContext.Provider value={mockContextMenuStateValue}>
                        <ShowContextMenuActionsContext.Provider value={mockContextMenuActionsValue}>
                            <MoneyRequestReportPreview
                                policyID={mockChatReport.policyID}
                                action={mockAction}
                                iouReportID={mockIOUReport.reportID}
                                iouReport={mockIOUReportProp}
                                chatReportID={mockChatReport.reportID}
                                chatReport={mockChatReport}
                                onPaymentOptionsShow={() => {}}
                                onPaymentOptionsHide={() => {}}
                                isHovered={isHovered}
                                isWhisper={isWhisper}
                            />
                        </ShowContextMenuActionsContext.Provider>
                    </ShowContextMenuStateContext.Provider>
                </PortalProvider>
            </ScreenWrapper>
        </ComposeProviders>,
    );
};

const getTransactionDisplayAmountAndHeaderText = (transaction: Transaction) => {
    const created = getFormattedCreated(transaction);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    const isTransactionMadeWithCard = isManagedCardTransaction(transaction);
    const cashOrCard = isTransactionMadeWithCard ? TestHelper.translateLocal('iou.card') : TestHelper.translateLocal('iou.cash');
    const transactionHeaderText = `${date} ${CONST.DOT_SEPARATOR} ${cashOrCard}`;
    const transactionDisplayAmount = convertToDisplayString(-transaction.amount, transaction.currency);
    return {transactionHeaderText, transactionDisplayAmount};
};

const setCurrentWidth = () => {
    fireEvent(screen.getByTestId('MoneyRequestReportPreviewContent-wrapper'), 'layout', {
        nativeEvent: {layout: {width: 600}},
    });
    fireEvent(screen.getByTestId('carouselWidthSetter'), 'layout', {
        nativeEvent: {layout: {width: 500}},
    });
};

const mockSecondTransaction: Transaction = {
    ...mockTransaction,
    amount: mockTransaction.amount * 2,
    transactionID: mockSecondTransactionID,
};

const mockOnyxTransactions: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, Transaction> = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`]: mockTransaction,
    [`${ONYXKEYS.COLLECTION.TRANSACTION}${mockSecondTransaction.transactionID}`]: mockSecondTransaction,
};

const mockOnyxViolations: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${string}`, TransactionViolations> = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mockTransaction.transactionID}`]: mockViolations,
    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mockSecondTransaction.transactionID}`]: mockViolations,
};

const arrayOfTransactions = Object.values(mockOnyxTransactions);

const setReportPreviewData = (
    overrides: {
        iouReport?: OnyxEntry<Report>;
        transactions?: Transaction[];
    } = {},
) => {
    const {iouReport, transactions} = overrides;
    const hasIouReportOverride = Object.prototype.hasOwnProperty.call(overrides, 'iouReport');

    mockIOUReportProp = hasIouReportOverride ? iouReport : mockIOUReport;
    mockUseReportTransactionsCollection.mockImplementation(() =>
        toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, transactions ?? defaultPreviewTransactions, (transaction) => transaction.transactionID),
    );
};

const setHasOnceLoadedReportActions = async (hasOnceLoadedReportActions: boolean) => {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${mockChatReport.reportID}`, {
        hasOnceLoadedReportActions,
    });
};

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

describe('MoneyRequestReportPreview', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
        jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(getIOUActionForReportID);
        jest.spyOn(ReportUtils, 'hasViolations').mockImplementation(hasViolations);
        await TestHelper.signInWithTestUser();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockDeferredValueOverride = undefined;
        mockOnHoldMenuOpenHolder.current = undefined;
        mockHoldMenuPropsHolder.current = undefined;
        setReportPreviewData();
        return act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('renders transaction details and associated report name correctly', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, mockOnyxTransactions);
            await waitForBatchedUpdatesWithAct();
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(getReportName(mockIOUReport))).toBeOnTheScreen();

        for (const transaction of arrayOfTransactions) {
            const {transactionDisplayAmount, transactionHeaderText} = getTransactionDisplayAmountAndHeaderText(transaction);

            expect(screen.getAllByText(transactionDisplayAmount).length).toBeGreaterThan(0);
            expect(screen.getAllByText(transactionHeaderText)).toHaveLength(arrayOfTransactions.length);
            expect(screen.getAllByText(transaction.merchant)).toHaveLength(arrayOfTransactions.length);
        }
    });

    it('renders the report total when the preview has more than one transaction', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, mockOnyxTransactions);
            await waitForBatchedUpdatesWithAct();
        });
        await waitForBatchedUpdatesWithAct();

        const {totalDisplaySpend} = ReportUtils.getMoneyRequestSpendBreakdown(mockIOUReport);
        expect(screen.getByText(TestHelper.translateLocal('common.total'))).toBeOnTheScreen();
        expect(screen.getAllByText(convertToDisplayString(totalDisplaySpend, mockIOUReport.currency)).length).toBeGreaterThan(0);
    });

    it('hides the report total when the preview has a single transaction', async () => {
        setReportPreviewData({transactions: [mockTransaction]});

        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`, mockTransaction);
            await waitForBatchedUpdatesWithAct();
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(TestHelper.translateLocal('common.total'))).not.toBeOnTheScreen();
    });

    it('forwards the selected bank account to the hold menu when paying a held expense from the preview', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, mockOnyxTransactions);
            await waitForBatchedUpdatesWithAct();
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockOnHoldMenuOpenHolder.current).toBeDefined();

        act(() => {
            mockOnHoldMenuOpenHolder.current?.(CONST.IOU.REPORT_ACTION_TYPE.PAY, CONST.IOU.PAYMENT_TYPE.VBBA, true, SELECTED_BANK_ACCOUNT_ID);
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockHoldMenuPropsHolder.current?.isVisible).toBe(true);
        expect(mockHoldMenuPropsHolder.current?.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.VBBA);
        expect(mockHoldMenuPropsHolder.current?.methodID).toBe(SELECTED_BANK_ACCOUNT_ID);
    });

    it('does not open the hold menu for request types other than pay or approve', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, mockOnyxTransactions);
            await waitForBatchedUpdatesWithAct();
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockOnHoldMenuOpenHolder.current).toBeDefined();

        act(() => {
            mockOnHoldMenuOpenHolder.current?.(CONST.IOU.REPORT_ACTION_TYPE.CREATE, CONST.IOU.PAYMENT_TYPE.VBBA, true, SELECTED_BANK_ACCOUNT_ID);
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockHoldMenuPropsHolder.current).toBeUndefined();
    });

    it('renders RBR for every transaction with violations', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.multiSet({...mockOnyxTransactions, ...mockOnyxViolations});
        });
        await waitForBatchedUpdatesWithAct();
        expect(screen.getAllByText(TestHelper.translateLocal('violations.reviewRequired'))).toHaveLength(2);
    });

    it('renders a skeleton if the transaction is empty', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`, {} as OnyxMergeInput<`transactions_${string}`>);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${mockSecondTransactionID}`, {} as OnyxMergeInput<`transactions_${string}`>);
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getAllByTestId('TransactionPreviewSkeletonView')).toHaveLength(2);
    });

    it('renders the empty placeholder immediately without waiting for width', async () => {
        setReportPreviewData({transactions: []});

        renderPage({});
        await act(async () => {
            await setHasOnceLoadedReportActions(true);
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.getByText(TestHelper.translateLocal('search.moneyRequestReport.emptyStateTitle'))).toBeOnTheScreen();
    });

    it('renders the access placeholder immediately without waiting for width', async () => {
        setReportPreviewData({iouReport: undefined, transactions: []});

        renderPage({});
        await act(async () => {
            await setHasOnceLoadedReportActions(true);
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.getByText(TestHelper.translateLocal('search.moneyRequestReport.accessPlaceHolder'))).toBeOnTheScreen();
    });

    it('keeps showing loading during the deferred transition before transactions populate', async () => {
        setReportPreviewData({transactions: []});
        mockDeferredValueOverride = true;

        renderPage({});
        await act(async () => {
            await setHasOnceLoadedReportActions(true);
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.queryByText(TestHelper.translateLocal('search.moneyRequestReport.emptyStateTitle'))).not.toBeOnTheScreen();
    });

    describe('pressing a transaction in the carousel', () => {
        const navigateSpy = jest.spyOn(Navigation, 'navigate');
        const openExpenseOverParentReportSpy = jest.spyOn(Navigation, 'openExpenseOverParentReport');

        // Give every transaction its own thread report so the assertion proves the *pressed* card
        // drives navigation, instead of every card sharing one parent-report handler.
        const buildActionWithThread = (reportID: string | undefined, transactionID: string | undefined) => {
            if (!reportID || !transactionID) {
                return undefined;
            }
            return {...mockAction, childReportID: `thread_${transactionID}`, originalMessage: {...mockAction, IOUTransactionID: transactionID}};
        };

        const renderAndPopulateCarousel = async () => {
            renderPage({});
            await waitForBatchedUpdatesWithAct();
            setCurrentWidth();
            await act(async () => {
                await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, mockOnyxTransactions);
                await waitForBatchedUpdatesWithAct();
            });
            await waitForBatchedUpdatesWithAct();
        };

        const pressSecondTransaction = async () => {
            const {transactionDisplayAmount} = getTransactionDisplayAmountAndHeaderText(mockSecondTransaction);
            fireEvent.press(screen.getByText(transactionDisplayAmount));
            await waitForBatchedUpdatesWithAct();
        };

        beforeEach(() => {
            navigateSpy.mockImplementation(() => {});
            jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue('');
            // The narrow path delegates to openExpenseOverParentReport (its native-stack mechanics are covered by
            // on-device testing); mock it so the component's delegation can be asserted directly.
            openExpenseOverParentReportSpy.mockImplementation(() => {});
        });

        afterEach(() => {
            mockResponsiveLayoutOverride = undefined;
            // Restore the globally-enabled fake timers in case a test opted into real timers.
            jest.useFakeTimers();
        });

        it('opens the report in the wide RHP and then the pressed expense on top (after a short delay) on wide layouts', async () => {
            // The pressed expense opens on a short setTimeout so the report's wide RHP settles first. Use real
            // timers so that delayed navigation actually fires (afterEach restores the global fake timers).
            jest.useRealTimers();
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            // The report opens in the wide RHP first so it sits below, then the pressed expense opens on top
            // of it (back returns to the report, not the Inbox).
            const reportRoute = ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''});
            expect(navigateSpy).toHaveBeenCalledTimes(2);
            expect(navigateSpy).toHaveBeenNthCalledWith(1, reportRoute);
            expect(navigateSpy).toHaveBeenNthCalledWith(2, ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: reportRoute}));
        });

        it('opens the pressed expense with the parent report beneath it so OS/swipe back returns to the report on narrow layouts', async () => {
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            // On narrow layouts the expense opens with the parent report placed as a real stack entry beneath it
            // (a single forward slide), so the OS/hardware back and the iOS swipe-back return to the report,
            // matching the header back button.
            expect(openExpenseOverParentReportSpy).toHaveBeenCalledWith(mockIOUReport.reportID, `thread_${mockSecondTransactionID}`, '');
        });

        it('seeds the optimistic transaction thread before opening an existing (possibly uncached) expense', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            const seedSpy = jest.spyOn(ReportActions, 'setOptimisticTransactionThread').mockImplementation(() => {});
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            // The thread already exists but may not be cached (offline / after a cache clear), so its optimistic
            // report shell is seeded before navigating — otherwise the tap can land on a blank expense.
            expect(seedSpy).toHaveBeenCalledWith(`thread_${mockSecondTransactionID}`, mockIOUReport.reportID, expect.anything(), expect.anything());
        });

        it('opens the parent report (like View) instead of a dead tap when offline and the thread is unresolved', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            mockUseNetwork.mockReturnValue({isOffline: true});
            const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            // Offline, and the IOU action isn't loaded, so the thread can't be resolved at press time.
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            // openReport can't fetch offline, so rather than leaving the tap dead we open the cached parent report.
            expect(openReportSpy).not.toHaveBeenCalled();
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
        });

        it('fetches the report actions and opens the pressed expense once they load, instead of the parent report, after a cache clear', async () => {
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            // Simulate a cache clear: the IOU report's actions are not loaded yet, so the pressed expense's
            // thread cannot be resolved at press time.
            const getIOUActionSpy = jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            // The press fetches the IOU report's actions and waits, rather than falling back to the parent report.
            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: mockIOUReport.reportID}));
            expect(navigateSpy).not.toHaveBeenCalled();
            expect(openExpenseOverParentReportSpy).not.toHaveBeenCalled();

            // Once the actions arrive the thread resolves and the pressed expense opens (report placed underneath).
            getIOUActionSpy.mockImplementation(buildActionWithThread);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[`${mockAction.reportActionID}_loaded`]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });

            expect(openExpenseOverParentReportSpy).toHaveBeenCalledWith(mockIOUReport.reportID, `thread_${mockSecondTransactionID}`, '');
        });

        it('falls back to opening the parent report when the pressed expense has no thread', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActions, 'createTransactionThreadReport').mockReturnValue(undefined);
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation((reportID, transactionID) => {
                if (!reportID || !transactionID) {
                    return undefined;
                }
                return {...mockAction, childReportID: undefined, originalMessage: {...mockAction, IOUTransactionID: transactionID}};
            });

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
        });

        it('opens the report instead of the lone expense for a single-expense report', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            setReportPreviewData({transactions: [mockTransaction]});
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            renderPage({});
            await waitForBatchedUpdatesWithAct();
            setCurrentWidth();
            await act(async () => {
                await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, mockOnyxTransactions);
                await waitForBatchedUpdatesWithAct();
            });
            await waitForBatchedUpdatesWithAct();

            const {transactionDisplayAmount} = getTransactionDisplayAmountAndHeaderText(mockTransaction);
            fireEvent.press(screen.getByText(transactionDisplayAmount));
            await waitForBatchedUpdatesWithAct();

            // A single-expense report opens the report itself, never the lone expense thread.
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockTransaction.transactionID}`, backTo: ''}));
        });
    });
});
