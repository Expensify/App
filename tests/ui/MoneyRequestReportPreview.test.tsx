import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import type {OnyxCollection, OnyxEntry, OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import type {MoneyRequestReportPreviewProps} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import ScreenWrapper from '@components/ScreenWrapper';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {getFormattedCreated, isManagedCardTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import * as ReportActionUtils from '@src/libs/ReportActionsUtils';
import {getReportName} from '@src/libs/ReportNameUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
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

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

const mockUseReportWithTransactionsAndViolations = jest.fn(() => defaultReportWithTransactionsAndViolations);

jest.mock('@src/hooks/useReportWithTransactionsAndViolations', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- __esModule is required by Jest to properly mock ES modules with default exports
    __esModule: true,
    default: (...args: Parameters<typeof mockUseReportWithTransactionsAndViolations>) => mockUseReportWithTransactionsAndViolations(...args),
}));

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

const renderPage = ({isWhisper = false, isHovered = false, contextMenuAnchor = null}: Partial<MoneyRequestReportPreviewProps>) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <OptionsListContextProvider>
                <ScreenWrapper testID="test">
                    <PortalProvider>
                        <MoneyRequestReportPreview
                            policyID={mockChatReport.policyID}
                            action={mockAction}
                            iouReportID={mockIOUReport.reportID}
                            chatReportID={mockChatReport.chatReportID}
                            contextMenuAnchor={contextMenuAnchor}
                            checkIfContextMenuActive={() => {}}
                            onPaymentOptionsShow={() => {}}
                            onPaymentOptionsHide={() => {}}
                            isHovered={isHovered}
                            isWhisper={isWhisper}
                        />
                    </PortalProvider>
                </ScreenWrapper>
            </OptionsListContextProvider>
        </ComposeProviders>,
    );
};

const getTransactionDisplayAmountAndHeaderText = (transaction: Transaction) => {
    const created = getFormattedCreated(transaction);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    const isTransactionMadeWithCard = isManagedCardTransaction(transaction);
    const cashOrCard = isTransactionMadeWithCard ? TestHelper.translateLocal('iou.card') : TestHelper.translateLocal('iou.cash');
    const transactionHeaderText = `${date} ${CONST.DOT_SEPARATOR} ${cashOrCard}`;
    const transactionDisplayAmount = convertToDisplayString(transaction.amount, transaction.currency);
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
        violations?: OnyxCollection<TransactionViolation[]>;
    } = {},
) => {
    const {iouReport, transactions, violations} = overrides;
    const hasIouReportOverride = Object.prototype.hasOwnProperty.call(overrides, 'iouReport');

    mockUseReportWithTransactionsAndViolations.mockImplementation(() => [
        hasIouReportOverride ? iouReport : mockIOUReport,
        transactions ?? defaultPreviewTransactions,
        violations ?? {violations: mockViolations},
    ]);
};

const setHasOnceLoadedReportActions = async (hasOnceLoadedReportActions: boolean) => {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockChatReport.chatReportID}`, {
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
        mockDeferredValueOverride = undefined;
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

            expect(screen.getByText(transactionDisplayAmount)).toBeOnTheScreen();
            expect(screen.getAllByText(transactionHeaderText)).toHaveLength(arrayOfTransactions.length);
            expect(screen.getAllByText(transaction.merchant)).toHaveLength(arrayOfTransactions.length);
        }
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
});
