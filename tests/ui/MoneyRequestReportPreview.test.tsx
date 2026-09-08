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

// Left undefined, every other test runs the real hook, so the wide-layout tests keep their behavior.
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

let mockIOUReportProp: OnyxEntry<Report> = mockIOUReport;

const mockUseReportTransactionsCollection = jest.fn(() => toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, defaultPreviewTransactions, (transaction) => transaction.transactionID));

jest.mock('@hooks/useReportTransactionsCollection', () => ({
    __esModule: true,
    default: () => mockUseReportTransactionsCollection(),
}));

type OnHoldMenuOpen = (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean, methodID?: number) => void;

// Capture onHoldMenuOpen so a held-expense payment can be triggered with a chosen bank account.
const mockOnHoldMenuOpenHolder: {current?: OnHoldMenuOpen} = {current: undefined};
jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton', () => {
    const actualReact = jest.requireActual<typeof React>('react');
    const actualModule = jest.requireActual<{default: typeof ReportPreviewActionButton}>('@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewActionButton');
    const {useReportPreviewActions} = jest.requireActual<typeof MoneyRequestReportPreviewContext>('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext');
    return {
        __esModule: true,
        default: function MockReportPreviewActionButton() {
            const {onHoldMenuOpen} = useReportPreviewActions();
            mockOnHoldMenuOpenHolder.current = onHoldMenuOpen;
            return actualReact.createElement(actualModule.default);
        },
    };
});

// The RHP widths never reach the rendered output, so capture the calls to assert they are requested and released.
const mockMarkReportRHPWidth = jest.fn();
const mockUnmarkReportRHPWidth = jest.fn();
jest.mock('@components/WideRHPContextProvider', () => ({
    ...jest.requireActual<typeof WideRHPContextProvider>('@components/WideRHPContextProvider'),
    useWideRHPActions: () => ({
        markReportRHPWidth: mockMarkReportRHPWidth,
        unmarkReportRHPWidth: mockUnmarkReportRHPWidth,
    }),
}));

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

const getTransactionDisplayAmountAndMetadataText = (transaction: Transaction) => {
    const created = getFormattedCreated(transaction);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT, undefined);
    const isTransactionMadeWithCard = isManagedCardTransaction(transaction);
    // These transactions have no category and no status, so the date is the whole supporting line. Asserted exactly, so an
    // unexpected category or status can't slip through.
    const transactionSupportingText = date;
    const transactionTypeText = isTransactionMadeWithCard ? TestHelper.translateLocal('iou.card') : TestHelper.translateLocal('iou.cash');
    const transactionDisplayAmount = TestHelper.convertToDisplayString(-transaction.amount, transaction.currency);
    return {transactionSupportingText, transactionTypeText, transactionDisplayAmount};
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
            const {transactionDisplayAmount, transactionSupportingText, transactionTypeText} = getTransactionDisplayAmountAndMetadataText(transaction);

            expect(screen.getAllByText(transactionDisplayAmount).length).toBeGreaterThan(0);
            expect(screen.getAllByText(transactionSupportingText)).toHaveLength(arrayOfTransactions.length);
            expect(screen.getAllByText(transactionTypeText)).toHaveLength(arrayOfTransactions.length);
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

    it('renders the rejected report message when the report was rejected back to the submitter', async () => {
        setReportPreviewData({
            iouReport: {
                ...mockIOUReport,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                nextStep: {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: mockIOUReport.ownerAccountID,
                },
            },
        });

        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.multiSet(mockOnyxTransactions);
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('iou.rejectReport.rejectedReportMessage'))).toBeOnTheScreen();
    });

    it('does not render the rejected report message for a draft report that was never rejected', async () => {
        setReportPreviewData({
            iouReport: {
                ...mockIOUReport,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            },
        });

        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.multiSet(mockOnyxTransactions);
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(TestHelper.translateLocal('iou.rejectReport.rejectedReportMessage'))).not.toBeOnTheScreen();
    });

    it('does not render the rejected report message when the report was rejected to a previous approver', async () => {
        setReportPreviewData({
            iouReport: {
                ...mockIOUReport,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                nextStep: {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: mockIOUReport.managerID,
                },
            },
        });

        renderPage({});
        await waitForBatchedUpdatesWithAct();
        setCurrentWidth();
        await act(async () => {
            await Onyx.multiSet(mockOnyxTransactions);
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(TestHelper.translateLocal('iou.rejectReport.rejectedReportMessage'))).not.toBeOnTheScreen();
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

        // A distinct thread per transaction, so the assertions prove the *pressed* card drives navigation.
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
            const {transactionDisplayAmount} = getTransactionDisplayAmountAndMetadataText(mockSecondTransaction);
            fireEvent.press(screen.getByText(transactionDisplayAmount));
            await waitForBatchedUpdatesWithAct();
        };

        // Both layouts open the report first and the pressed expense on a short timer; let that timer run.
        const settleCascade = async () => {
            await act(async () => {
                jest.advanceTimersByTime(400);
                await Promise.resolve();
            });
            await waitForBatchedUpdatesWithAct();
        };

        const narrowReportRoute = () => ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID, undefined, undefined, '');

        beforeEach(() => {
            navigateSpy.mockImplementation(() => {});
            jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue('');
            // The cascade guards its delayed navigation on isActiveRoute; default to "still on the report".
            jest.spyOn(Navigation, 'isActiveRoute').mockReturnValue(true);
        });

        afterEach(() => {
            mockResponsiveLayoutOverride = undefined;
            jest.useFakeTimers();
        });

        it('opens the report in the wide RHP and then the pressed expense on top (after a short delay) on wide layouts', async () => {
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

            // The report opens first and sits below, so back returns to it rather than the Inbox.
            const reportRoute = ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''});
            expect(navigateSpy).toHaveBeenCalledTimes(2);
            expect(navigateSpy).toHaveBeenNthCalledWith(1, reportRoute);
            expect(navigateSpy).toHaveBeenNthCalledWith(2, ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: reportRoute}));
        });

        it('does not reopen the pressed expense if the user leaves the report during the wide-layout cascade delay', async () => {
            // Regression: navigating away before the timer fires must not reopen the expense over the new screen.
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

        it('keeps backTo pointing at the chat when a second card is pressed inside the cascade window', async () => {
            // Regression: the second press read backTo from the active route, which press 1 had already
            // moved to the report, so the report was pushed with a backTo pointing at itself.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            // The constant getActiveRoute mock in beforeEach hides this bug: let the route follow navigation.
            // The real getActiveRoute returns a leading slash that the route builders never emit, so model that too.
            let activeRoute = '';
            jest.spyOn(Navigation, 'getActiveRoute').mockImplementation(() => activeRoute);
            navigateSpy.mockImplementation((route) => {
                activeRoute = `/${String(route)}`;
            });

            await renderAndPopulateCarousel();

            const {transactionDisplayAmount: firstAmount} = getTransactionDisplayAmountAndMetadataText(mockTransaction);
            const {transactionDisplayAmount: secondAmount} = getTransactionDisplayAmountAndMetadataText(mockSecondTransaction);

            // The first amount also appears in the report total, so take the card.
            const [firstCard] = screen.getAllByText(firstAmount);
            fireEvent.press(firstCard);
            await waitForBatchedUpdatesWithAct();
            // Second press lands before the 180ms cascade timer fires, while the carousel is still mounted.
            fireEvent.press(screen.getByText(secondAmount));
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            // The report is pushed exactly once, with the chat as backTo, and the second expense lands on top of it.
            const chatBackedReportRoute = ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''});
            const reportRoutes = navigateSpy.mock.calls.map(([route]) => String(route)).filter((route) => route.startsWith(`e/${mockIOUReport.reportID}`));
            expect(reportRoutes).toEqual([chatBackedReportRoute]);
            expect(navigateSpy).toHaveBeenCalledTimes(2);
            expect(navigateSpy).toHaveBeenLastCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: chatBackedReportRoute}));
        });

        it('pushes the report once, with the chat as backTo, when "View" is pressed inside the cascade window', async () => {
            // Regression: "View" read backTo from the live route, which the card press had already moved to the
            // report, so the report was pushed a second time with a backTo pointing at itself.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            let activeRoute = '';
            jest.spyOn(Navigation, 'getActiveRoute').mockImplementation(() => activeRoute);
            navigateSpy.mockImplementation((route) => {
                activeRoute = `/${String(route)}`;
            });

            await renderAndPopulateCarousel();
            await pressSecondTransaction();
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.view')));
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            expect(navigateSpy).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
        });

        it('opens the report and then the pressed expense on top of it (after a short delay) on narrow layouts', async () => {
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
            // Deploy blocker #97183: removeScreenByKey only filters the root navigator, so a nested split screen can never be removed.
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

            const threadID = `thread_${mockSecondTransactionID}`;
            const threadAsReportScreen = navigateSpy.mock.calls.map(([route]) => String(route)).filter((route) => route.startsWith(`r/${threadID}`));
            expect(threadAsReportScreen).toEqual([]);
            expect(navigateSpy).toHaveBeenLastCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: threadID, backTo: narrowReportRoute()}));
        });

        it('does not open the pressed expense if the user leaves the report during the narrow cascade delay', async () => {
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
            // Cache-clear shape: no report actions, but each transaction still carries its own thread id.
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

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: narrowReportRoute()}));
            // The actions must still be fetched, or an arrow press mints a duplicate thread with no parent.
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

            // Opening the report explicitly must supersede the deferred press.
            navigateSpy.mockClear();
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.view')));
            await waitForBatchedUpdatesWithAct();
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(mockIOUReport.reportID, undefined, undefined, ''));
            // The suite pins getActiveRoute, so model the real navigation for the assertion below to mean anything.
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

            const {transactionDisplayAmount} = getTransactionDisplayAmountAndMetadataText(mockTransaction);
            const [firstCard] = screen.getAllByText(transactionDisplayAmount);
            fireEvent.press(firstCard);
            await waitForBatchedUpdatesWithAct();
            expect(navigateSpy).not.toHaveBeenCalled();

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

            // Online, delete-pending rows are already filtered upstream, so the seed must equal the full visible list.
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

            // Issue #26939: an offline-deleted expense stays visible but non-navigable, so both cards still render.
            const {transactionDisplayAmount} = getTransactionDisplayAmountAndMetadataText(mockTransaction);
            expect(screen.getAllByText(transactionDisplayAmount).length).toBeGreaterThanOrEqual(2);
        });

        it('keeps an offline-deleted sibling out of the expense view prev/next carousel', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            mockUseNetwork.mockReturnValue({isOffline: true});
            const setActiveTransactionIDsSpy = jest.spyOn(TransactionThreadNavigation, 'setActiveTransactionIDs');
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            mockUseReportTransactionsCollection.mockImplementation(() =>
                toCollectionDataSet(
                    ONYXKEYS.COLLECTION.TRANSACTION,
                    [mockTransaction, {...mockTransaction, transactionID: mockSecondTransactionID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
                    (transaction) => transaction.transactionID,
                ),
            );

            await renderAndPopulateCarousel();
            const {transactionDisplayAmount} = getTransactionDisplayAmountAndMetadataText(mockTransaction);
            const [liveRow] = screen.getAllByText(transactionDisplayAmount);
            fireEvent.press(liveRow);
            await waitForBatchedUpdatesWithAct();

            // Deploy blocker #97149: seeding a deleted sibling makes the next arrow land on "It's not here".
            expect(setActiveTransactionIDsSpy).toHaveBeenCalled();
            const seededIDs = setActiveTransactionIDsSpy.mock.calls.at(-1)?.at(0);
            expect(seededIDs).not.toContain(mockSecondTransactionID);
        });

        it('opens the parent report instead of an expense deleted while offline', async () => {
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            mockUseNetwork.mockReturnValue({isOffline: true});
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            // Deploy blocker #97149: the thread is already gone, so pressing the row must not land on "It's not here".
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

            // The thread may not be cached, so its optimistic shell is seeded before navigating.
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
            // Cache clear: the report's actions are not loaded, so the thread cannot resolve at press time.
            const getIOUActionSpy = jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: mockIOUReport.reportID}));
            expect(navigateSpy).not.toHaveBeenCalled();
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: ''}));

            getIOUActionSpy.mockImplementation(buildActionWithThread);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[`${mockAction.reportActionID}_loaded`]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });
            await settleCascade();

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: narrowReportRoute()}));
        });

        it('falls back to the parent report when the re-fetch settles with no report actions at all', async () => {
            // Nothing is ever cached here, so the fallback must key off the fetch settling, not off there being actions.
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
            // A legacy expense: the actions are loaded but this expense's IOU action is missing, and refetching finds nothing.
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockReturnValue(undefined);

            await renderAndPopulateCarousel();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[mockAction.reportActionID]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });
            await pressSecondTransaction();

            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: mockIOUReport.reportID}));
            expect(navigateSpy).not.toHaveBeenCalled();

            // Regression: the drain used to wait for an action-count change that never came, leaving the tap dead.
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
            // Partially seeded cache: some actions are present, but not the pressed expense's IOU action.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[mockAction.reportActionID]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });
            await pressSecondTransaction();

            // Regression: the press used to give up immediately because some actions were cached.
            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: mockIOUReport.reportID}));
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: ''}));
            expect(navigateSpy).not.toHaveBeenCalled();

            getIOUActionSpy.mockImplementation(buildActionWithThread);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`, {[`${mockAction.reportActionID}_loaded`]: mockAction});
                await waitForBatchedUpdatesWithAct();
            });

            // The expense must end up on top; stopping at the report would mean the press fell back to it.
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
            // Narrow has no super-wide RHP, so the fallback lands on the report screen itself.
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
            // Supplied newest-first and rendered oldest-first, so the arrows must walk render order, not collection order.
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

            fireEvent.press(screen.getByText(getTransactionDisplayAmountAndMetadataText(olderTransaction).transactionDisplayAmount));
            await waitForBatchedUpdatesWithAct();

            expect(setActiveTransactionIDsSpy).toHaveBeenCalledWith([olderTransaction.transactionID, newerTransaction.transactionID]);
            expect(setActiveTransactionIDsSpy).not.toHaveBeenCalledWith([newerTransaction.transactionID, olderTransaction.transactionID]);
        });

        it('does not open the pressed expense over the report when "View" is tapped during the cascade delay', async () => {
            // Regression: "View" opens the same report route, so the cascade's navigate-away guard does not catch it.
            jest.useRealTimers();
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);

            await renderAndPopulateCarousel();
            await pressSecondTransaction();

            // Tap "View" while the cascade timer is still pending.
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.view')));
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 350);
                });
            });

            const reportRoute = ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''});
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockSecondTransactionID}`, backTo: reportRoute}));
        });

        it('seeds every expense into the arrows, not just the ones the carousel renders', async () => {
            // Regression: seeding the capped list left the next arrow disabled on the last drawn card.
            mockResponsiveLayoutOverride = wideResponsiveLayout;
            const many = Array.from({length: 14}, (_, index) => ({
                ...mockTransaction,
                transactionID: `bulk_${index}`,
                created: `2026-08-${String(index + 1).padStart(2, '0')} 00:00:00`,
                amount: mockTransaction.amount - (index + 1) * 1300,
            }));
            mockUseReportWithTransactionsAndViolations.mockImplementation(() => [mockIOUReport, many, {}]);
            mockUseReportTransactionsCollection.mockImplementation(() => toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, many, (transaction) => transaction.transactionID));
            jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(buildActionWithThread);
            const setActiveTransactionIDsSpy = jest.spyOn(TransactionThreadNavigation, 'setActiveTransactionIDs');

            renderPage({});
            await waitForBatchedUpdatesWithAct();
            setCurrentWidth();
            await act(async () => {
                await Onyx.mergeCollection(
                    ONYXKEYS.COLLECTION.TRANSACTION,
                    Object.fromEntries(many.map((transaction) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction])) as Record<
                        `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`,
                        Transaction
                    >,
                );
                await waitForBatchedUpdatesWithAct();
            });
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText(getTransactionDisplayAmountAndMetadataText(many.at(0) ?? mockTransaction).transactionDisplayAmount));
            await waitForBatchedUpdatesWithAct();

            expect(setActiveTransactionIDsSpy).toHaveBeenCalledWith(many.map((transaction) => transaction.transactionID));
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

            const {transactionDisplayAmount} = getTransactionDisplayAmountAndMetadataText(mockTransaction);
            fireEvent.press(screen.getByText(transactionDisplayAmount));
            await waitForBatchedUpdatesWithAct();

            // A single-expense report opens the report itself, never the lone expense thread.
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: mockIOUReport.reportID, backTo: ''}));
            expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: `thread_${mockTransaction.transactionID}`, backTo: ''}));
        });
    });
});
