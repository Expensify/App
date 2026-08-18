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
import type * as WideRHPContextProvider from '@components/WideRHPContextProvider';

import useNetwork from '@hooks/useNetwork';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import * as ReportActions from '@libs/actions/Report';
import * as TransactionThreadNavigation from '@libs/actions/TransactionThreadNavigation';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getFormattedCreated, isManagedCardTransaction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import * as ReportActionUtils from '@src/libs/ReportActionsUtils';
import {getReportName} from '@src/libs/ReportNameUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
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

// The preview widens the RHP for the report it opens and narrows it back when a press is abandoned. Nothing in the
// rendered output reflects that, so capture the calls to assert the widths are actually requested and released.
const mockMarkReportRHPWidth = jest.fn();
const mockUnmarkReportRHPWidth = jest.fn();
jest.mock('@components/WideRHPContextProvider', () => ({
    ...jest.requireActual<typeof WideRHPContextProvider>('@components/WideRHPContextProvider'),
    useWideRHPActions: () => ({
        markReportRHPWidth: mockMarkReportRHPWidth,
        unmarkReportRHPWidth: mockUnmarkReportRHPWidth,
    }),
}));

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
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT, undefined);
    const isTransactionMadeWithCard = isManagedCardTransaction(transaction);
    const cashOrCard = isTransactionMadeWithCard ? TestHelper.translateLocal('iou.card') : TestHelper.translateLocal('iou.cash');
    const transactionHeaderText = `${date} ${CONST.DOT_SEPARATOR} ${cashOrCard}`;
    const transactionDisplayAmount = TestHelper.convertToDisplayString(-transaction.amount, transaction.currency);
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
        expect(screen.getAllByText(TestHelper.convertToDisplayString(totalDisplaySpend, mockIOUReport.currency)).length).toBeGreaterThan(0);
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

        // Both layouts open the report first and the pressed expense on a short timer on top of it. Let that timer
        // run so assertions see the expense, not just the report underneath it.
        const settleCascade = async () => {
            await act(async () => {
                jest.advanceTimersByTime(400);
                await Promise.resolve();
            });
            await waitForBatchedUpdatesWithAct();
        };

        // Route the narrow cascade opens beneath the pressed expense.
        const narrowReportRoute = () => ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID, undefined, undefined, '');

        beforeEach(() => {
            navigateSpy.mockImplementation(() => {});
            jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue('');
            // The wide-layout cascade guards its delayed expense navigation on isActiveRoute(reportRoute); default to
            // "still on the report" so the happy-path cascade fires.
            jest.spyOn(Navigation, 'isActiveRoute').mockReturnValue(true);
        });

        afterEach(() => {
            mockResponsiveLayoutOverride = undefined;
            // Restore the globally-enabled fake timers in case a test opted into real timers.
            jest.useFakeTimers();
        });

        it('opens the report in the wide RHP and then the pressed expense on top (after a short delay) on wide layouts', async () => {
            // The pressed expense opens on a short setTimeout so the report's wide RHP settles first. Use real
            // timers so that delayed navigation actually fires
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

        it('does not reopen the pressed expense if the user leaves the report during the wide-layout cascade delay', async () => {
            // Regression: the report opens, but if the user dismisses its wide RHP (or navigates away) before the
            // cascade timer fires, the delayed callback must not reopen the expense over whatever screen is now active.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            jest.spyOn(Navigation, 'isActiveRoute').mockReturnValue(false);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            const reportRoute = ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''});
            expect(navigateSpy).toHaveBeenCalledWith(reportRoute);
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: reportRoute}));
        });

        it('opens the report and then the pressed expense on top of it (after a short delay) on narrow layouts', async () => {
            // The pressed expense opens on a short setTimeout so the report settles first. Use real timers so that
            // delayed navigation actually fires.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            // Back returns to the report and back again to the chat, matching the wide layout's order.
            const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID, undefined, undefined, '');
            expect(navigateSpy).toHaveBeenCalledTimes(2);
            expect(navigateSpy).toHaveBeenNthCalledWith(1, reportRoute);
            expect(navigateSpy).toHaveBeenNthCalledWith(2, ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: reportRoute}));
        });

        it('keeps the pressed expense out of the split stack on narrow layouts', async () => {
            // The expense must open in the RHP, never as a split-navigator screen: the flows that clean up after a
            // thread (split-expense save, delete) assume it is not there. removeScreenByKey only filters the root
            // navigator's routes, so a nested split screen can never be removed by it.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            // The thread must never be navigated to as a report screen, whatever backTo it would carry.
            const threadID = `thread_${mockSecondTransactionID}`;
            const threadAsReportScreen = navigateSpy.mock.calls.map(([route]) => String(route)).filter((route) => route.startsWith(`r/${threadID}`));
            expect(threadAsReportScreen).toEqual([]);
            // ...and it did open, as the RHP route, so the assertion above is not passing merely because nothing opened.
            expect(navigateSpy).toHaveBeenLastCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: threadID, backTo: narrowReportRoute()}));
        });

        it('does not open the pressed expense if the user leaves the report during the narrow cascade delay', async () => {
            // Same guard the wide cascade has: the delayed navigation must not land on top of whatever screen the
            // user moved to while the timer was pending.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            jest.spyOn(Navigation, 'isActiveRoute').mockReturnValue(false);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID, undefined, undefined, '');
            expect(navigateSpy).toHaveBeenCalledWith(reportRoute);
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: reportRoute}));
        });

        it('fetches the report actions when the thread resolved only from the transaction, so the carousel can resolve siblings', async () => {
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            // Cache-clear shape: the IOU report's actions are absent, but each transaction still carries its own
            // transactionThreadReportID, so the press resolves a thread WITHOUT loading the report's actions.
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);
            mockUseReportTransactionsCollection.mockImplementation(() =>
                toCollectionDataSet(
                    ONYXKEYS.COLLECTION.TRANSACTION,
                    [
                        {...mockTransaction, transactionThreadReportID: `thread_${mockTransaction.transactionID}`},
                        {...mockTransaction, transactionID: mockSecondTransactionID, transactionThreadReportID: `thread_${mockSecondTransactionID}`},
                    ],
                    (transaction) => transaction.transactionID,
                ),
            );

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            await settleCascade();

            // The expense opens straight away from the transaction's own thread id...
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: narrowReportRoute()}));
            // ...but the report's actions must still be fetched. The prev/next carousel resolves each sibling through
            // those actions; without them an arrow press cannot find the sibling's existing thread and mints a
            // duplicate thread with no parent instead.
            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: mockIOUReport.reportID}));
        });

        it('does not let a deferred press hijack an explicit "View" of the report', async () => {
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            // Cold cache: the press cannot resolve a thread, so it defers and nothing opens.
            const getIOUActionSpy = jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            expect(navigateSpy).not.toHaveBeenCalled();

            // The tap looked dead, so the user opens the report the other way. That is an explicit choice and must
            // supersede the deferred press — otherwise the fetch landing yanks them into the expense.
            navigateSpy.mockClear();
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.view')));
            await waitForBatchedUpdatesWithAct();
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID, undefined, undefined, ''));
            // The app is now on the report, not the chat the press was made from. The suite pins getActiveRoute to a
            // constant, so model the real navigation for the assertion below to mean anything.
            jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID) as Route);

            navigateSpy.mockClear();
            getIOUActionSpy.mockImplementation(buildActionWithThread);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[`${mockAction.reportActionID}_late`]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });

            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('does not let a deferred press hijack a later press once its fetch lands', async () => {
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            // First card has no resolvable thread (its press defers); second card resolves immediately.
            const getIOUActionSpy = jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);
            mockUseReportTransactionsCollection.mockImplementation(() =>
                toCollectionDataSet(
                    ONYXKEYS.COLLECTION.TRANSACTION,
                    [mockTransaction, {...mockTransaction, transactionID: mockSecondTransactionID, transactionThreadReportID: `thread_${mockSecondTransactionID}`}],
                    (transaction) => transaction.transactionID,
                ),
            );

            await renderAndPopulateCarousel();

            // Press the first card — it defers, waiting on the report's actions.
            const {transactionDisplayAmount} = getTransactionDisplayAmountAndHeaderText(mockTransaction);
            const [firstCard] = screen.getAllByText(transactionDisplayAmount);
            fireEvent.press(firstCard);
            await waitForBatchedUpdatesWithAct();
            expect(navigateSpy).not.toHaveBeenCalled();

            // Now press the second card, which opens straight away. That is the expense the user is waiting on.
            navigateSpy.mockClear();
            await pressSecondTransaction();
            await settleCascade();
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: narrowReportRoute()}));

            // The first press's fetch finally lands. It must NOT navigate — the user has moved on.
            navigateSpy.mockClear();
            getIOUActionSpy.mockImplementation(buildActionWithThread);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[`${mockAction.reportActionID}_late`]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });

            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('seeds every transaction when online, so the new filter changes nothing there', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            mockUseNetwork.mockReturnValue({isOffline: false});
            const setActiveTransactionIDsSpy = jest.spyOn(TransactionThreadNavigation, 'setActiveTransactionIDs');
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            // Online, a delete-pending row is already filtered out of `transactions` upstream, so openableTransactionIDs
            // must equal the full visible list. This pins the filter as an offline-only refinement — it would fail if
            // someone widened the predicate (e.g. to one that also matches pendingFields) and started dropping live rows.
            expect(setActiveTransactionIDsSpy).toHaveBeenCalledWith(defaultPreviewTransactions.map((transaction) => transaction.transactionID));
        });

        it('still renders an offline-deleted expense card in the carousel', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            mockUseNetwork.mockReturnValue({isOffline: true});
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            mockUseReportTransactionsCollection.mockImplementation(() =>
                toCollectionDataSet(
                    ONYXKEYS.COLLECTION.TRANSACTION,
                    [mockTransaction, {...mockTransaction, transactionID: mockSecondTransactionID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
                    (transaction) => transaction.transactionID,
                ),
            );

            await renderAndPopulateCarousel();

            // Issue #26939: deleting an expense offline must leave the preview VISIBLE (greyed out) rather than
            // collapsing it. v2 only makes that row non-navigable — it must not disappear, so both cards still render.
            const {transactionDisplayAmount} = getTransactionDisplayAmountAndHeaderText(mockTransaction);
            expect(screen.getAllByText(transactionDisplayAmount).length).toBeGreaterThanOrEqual(2);
        });

        it('keeps an offline-deleted sibling out of the expense view prev/next carousel', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            mockUseNetwork.mockReturnValue({isOffline: true});
            const setActiveTransactionIDsSpy = jest.spyOn(TransactionThreadNavigation, 'setActiveTransactionIDs');
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            // First row is live, second is delete-pending. Offline keeps the deleted row visible in the carousel.
            mockUseReportTransactionsCollection.mockImplementation(() =>
                toCollectionDataSet(
                    ONYXKEYS.COLLECTION.TRANSACTION,
                    [mockTransaction, {...mockTransaction, transactionID: mockSecondTransactionID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
                    (transaction) => transaction.transactionID,
                ),
            );

            await renderAndPopulateCarousel();
            const {transactionDisplayAmount} = getTransactionDisplayAmountAndHeaderText(mockTransaction);
            const [liveRow] = screen.getAllByText(transactionDisplayAmount);
            fireEvent.press(liveRow);
            await waitForBatchedUpdatesWithAct();

            // Pressing the LIVE row must not seed the deleted sibling, otherwise the RHP's next arrow opens a thread
            // that no longer exists and lands on "It's not here" (deploy blocker #97149, arrow path).
            expect(setActiveTransactionIDsSpy).toHaveBeenCalled();
            const seededIDs = setActiveTransactionIDsSpy.mock.calls.at(-1)?.at(0);
            expect(seededIDs).not.toContain(mockSecondTransactionID);
        });

        it('opens the parent report instead of an expense deleted while offline', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            mockUseNetwork.mockReturnValue({isOffline: true});
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            // Offline deletes stay in the carousel, but the thread is already gone — pressing it must not land on
            // "It's not here" (deploy blocker #97149).
            mockUseReportTransactionsCollection.mockImplementation(() =>
                toCollectionDataSet(
                    ONYXKEYS.COLLECTION.TRANSACTION,
                    [mockTransaction, {...mockTransaction, transactionID: mockSecondTransactionID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
                    (transaction) => transaction.transactionID,
                ),
            );

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: ''}));
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
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: ''}));

            // Once the actions arrive the thread resolves and the pressed expense opens (report placed underneath).
            getIOUActionSpy.mockImplementation(buildActionWithThread);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[`${mockAction.reportActionID}_loaded`]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });
            await settleCascade();

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: narrowReportRoute()}));
        });

        it('falls back to the parent report when the re-fetch settles with no report actions at all', async () => {
            // Same shape as the test below, but nothing is ever cached for the report, so the action count stays 0.
            // The fallback must key off the fetch settling, not off there being actions, or the tap stays dead.
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            expect(navigateSpy).not.toHaveBeenCalled();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${mockIOUReport.reportID}`, {isLoadingInitialReportActions: true});
                await waitForBatchedUpdatesWithAct();
            });
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${mockIOUReport.reportID}`, {isLoadingInitialReportActions: false});
                await waitForBatchedUpdatesWithAct();
            });

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
        });

        it('falls back to the parent report once the re-fetch settles when the expense has no IOU action at all', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            // A legacy expense: the IOU report's actions are loaded, but none of them is this expense's IOU
            // action, and re-fetching surfaces nothing new.
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[mockAction.reportActionID]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });
            await pressSecondTransaction();

            // The press defers and re-fetches the report's actions (the missing action may simply not be cached).
            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: mockIOUReport.reportID}));
            expect(navigateSpy).not.toHaveBeenCalled();

            // The fetch settles without changing the cached actions. The loading flip alone must drain the press to
            // the parent report — regression: it used to wait for an action-count change that never came, leaving
            // the tap permanently dead.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${mockIOUReport.reportID}`, {isLoadingInitialReportActions: true});
                await waitForBatchedUpdatesWithAct();
            });
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${mockIOUReport.reportID}`, {isLoadingInitialReportActions: false});
                await waitForBatchedUpdatesWithAct();
            });

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
        });

        it('opens the pressed expense after re-fetching when only part of the report actions were cached', async () => {
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
            const getIOUActionSpy = jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            // Partially seeded cache: some of the report's actions are present (e.g. from the app-wide bootstrap),
            // but not the pressed expense's IOU action.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[mockAction.reportActionID]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });
            await pressSecondTransaction();

            // Regression: the press used to give up immediately (parent report) because some actions were cached;
            // it must re-fetch instead — the missing IOU action may just not have been seeded.
            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: mockIOUReport.reportID}));
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: ''}));
            expect(navigateSpy).not.toHaveBeenCalled();

            // The fetch lands the missing IOU action — the pressed expense opens (report beneath), not the parent report.
            getIOUActionSpy.mockImplementation(buildActionWithThread);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[`${mockAction.reportActionID}_loaded`]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });

            // The expense must end up on top. The report opening underneath it is the cascade's base, but stopping
            // there would mean the press fell back to the parent report instead of reaching the pressed expense.
            expect(navigateSpy).toHaveBeenLastCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: narrowReportRoute()}));
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

        it('falls back to the full report view, not the super-wide RHP, when the pressed expense has no thread on narrow layouts', async () => {
            // Every other fallback assertion here runs wide. Narrow has no super-wide RHP, so the fallback has to
            // land on the report screen itself — the route the deleted-expense and offline dead-tap paths rely on.
            mockResponsiveLayoutOverride = narrowResponsiveLayout;
            jest.spyOn(ReportActions, 'createTransactionThreadReport').mockReturnValue(undefined);
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation((reportID, transactionID) => {
                if (!reportID || !transactionID) {
                    return undefined;
                }
                return {...mockAction, childReportID: undefined, originalMessage: {...mockAction, IOUTransactionID: transactionID}};
            });

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID, undefined, undefined, ''));
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
        });

        it('widens the RHP for the report and the pressed expense, and narrows the expense back when the press is abandoned', async () => {
            // The widths are invisible in the rendered output, so without this the whole widen/release mechanism
            // could be deleted and every other test here would still pass.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            // The user leaves the report before the cascade fires, so the expense's reserved width must be released.
            jest.spyOn(Navigation, 'isActiveRoute').mockReturnValue(false);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith(mockIOUReport.reportID, 'super-wide');
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith(`thread_${mockSecondTransactionID}`, 'wide');
            expect(mockUnmarkReportRHPWidth).not.toHaveBeenCalled();

            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            expect(mockUnmarkReportRHPWidth).toHaveBeenCalledWith(`thread_${mockSecondTransactionID}`);
        });

        it('seeds the expense view carousel in the order the cards are rendered, not collection order', async () => {
            // The carousel sorts before rendering, so the collection order and the on-screen order can differ. The
            // arrows walk the seeded list, so seeding collection order makes "next" on the last card jump to the
            // first one. These two are supplied newest-first and render oldest-first.
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            const olderTransaction = {...mockTransaction, transactionID: 'ordering_older', created: '2026-08-01 00:00:00', amount: mockTransaction.amount * 3};
            const newerTransaction = {...mockTransaction, transactionID: 'ordering_newer', created: '2026-08-20 00:00:00', amount: mockTransaction.amount * 5};
            mockUseReportWithTransactionsAndViolations.mockImplementation(() => [mockIOUReport, [newerTransaction, olderTransaction], {}]);
            mockUseReportTransactionsCollection.mockImplementation(() =>
                toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, [newerTransaction, olderTransaction], (transaction) => transaction.transactionID),
            );
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            const setActiveTransactionIDsSpy = jest.spyOn(TransactionThreadNavigation, 'setActiveTransactionIDs');

            renderPage({});
            await waitForBatchedUpdatesWithAct();
            setCurrentWidth();
            await act(async () => {
                await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${olderTransaction.transactionID}`]: olderTransaction,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${newerTransaction.transactionID}`]: newerTransaction,
                });
                await waitForBatchedUpdatesWithAct();
            });
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText(getTransactionDisplayAmountAndHeaderText(olderTransaction).transactionDisplayAmount));
            await waitForBatchedUpdatesWithAct();

            expect(setActiveTransactionIDsSpy).toHaveBeenCalledWith([olderTransaction.transactionID, newerTransaction.transactionID]);
            expect(setActiveTransactionIDsSpy).not.toHaveBeenCalledWith([newerTransaction.transactionID, olderTransaction.transactionID]);
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
