import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import type {MoneyRequestReportPreviewProps} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import ScreenWrapper from '@components/ScreenWrapper';
import TransactionPreviewSkeletonView from '@components/TransactionPreviewSkeletonView';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {translateLocal} from '@libs/Localize';
import {getFormattedCreated, isCardTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import * as ReportActionUtils from '@src/libs/ReportActionsUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {
    action as mockAction,
    chatReport as mockChatReport,
    iouReport as mockIOUReport,
    transaction as mockTransaction,
    violations as mockViolations,
} from '@src/stories/mockData/transactions';
import type {Report, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockSecondTransactionID = `${mockTransaction.transactionID.substring(0, mockTransaction.transactionID.length - 1)}2`;

jest.mock('@react-navigation/native');

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

jest.mock('@src/hooks/useReportWithTransactionsAndViolations', () =>
    jest.fn((): [OnyxEntry<Report>, Transaction[], OnyxCollection<TransactionViolation[]>] => {
        return [mockChatReport, [mockTransaction, {...mockTransaction, transactionID: mockSecondTransactionID}], {violations: mockViolations}];
    }),
);

const getIOUActionForReportID = (reportID: string | undefined, transactionID: string | undefined) => {
    if (!reportID || !transactionID) {
        return undefined;
    }
    return {...mockAction, originalMessage: {...mockAction, IOUTransactionID: transactionID}};
};

const hasViolations = (reportID: string | undefined, transactionViolations: OnyxCollection<TransactionViolation[]>, shouldShowInReview?: boolean) =>
    (shouldShowInReview === undefined || shouldShowInReview) && Object.values(transactionViolations ?? {}).length > 0;

const renderPage = ({isWhisper = false, isHovered = false, contextMenuAnchor = null}: Partial<MoneyRequestReportPreviewProps>) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider]}>
            <OptionsListContextProvider>
                <ScreenWrapper testID="test">
                    <PortalProvider>
                        <MoneyRequestReportPreview
                            policyID={mockChatReport.policyID}
                            action={mockAction}
                            iouReportID={mockIOUReport.iouReportID}
                            chatReportID={mockChatReport.chatReportID}
                            containerStyles={[]}
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
    const isTransactionMadeWithCard = isCardTransaction(transaction);
    const cashOrCard = isTransactionMadeWithCard ? translateLocal('iou.card') : translateLocal('iou.cash');
    const transactionHeaderText = `${date} ${CONST.DOT_SEPARATOR} ${cashOrCard}`;
    const transactionDisplayAmount = convertToDisplayString(transaction.amount, transaction.currency);
    return {transactionHeaderText, transactionDisplayAmount};
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
};

const arrayOfTransactions = Object.values(mockOnyxTransactions);

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
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('renders transaction details and associated report name correctly', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, mockOnyxTransactions).then(waitForBatchedUpdates);
        const {childReportName: moneyRequestReportPreviewName = ''} = mockAction;
        for (const transaction of arrayOfTransactions) {
            const {transactionDisplayAmount, transactionHeaderText} = getTransactionDisplayAmountAndHeaderText(transaction);

            expect(screen.getByText(moneyRequestReportPreviewName)).toBeOnTheScreen();
            expect(screen.getByText(transactionDisplayAmount)).toBeOnTheScreen();
            expect(screen.getAllByText(transactionHeaderText)).toHaveLength(arrayOfTransactions.length);
            expect(screen.getAllByText(transaction.merchant)).toHaveLength(arrayOfTransactions.length);
        }
    });

    it('renders RBR for both transaction and report if there are violations', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        await Onyx.multiSet({...mockOnyxTransactions, ...mockOnyxViolations});
        expect(screen.getAllByText(translateLocal('violations.reviewRequired'))).toHaveLength(2);
    });

    it('renders a skeleton if the transaction is empty', async () => {
        renderPage({});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getAllByTestId(TransactionPreviewSkeletonView.displayName)).toHaveLength(2);
    });
});
