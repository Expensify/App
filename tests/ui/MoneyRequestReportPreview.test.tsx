import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestSkeletonView from '@components/MoneyRequestSkeletonView';
import OnyxProvider from '@components/OnyxProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import type {MoneyRequestReportPreviewProps} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import ScreenWrapper from '@components/ScreenWrapper';
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
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native');

// Set up a global fetch mock for API requests in tests.
TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

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

const getIOUActionForReportID = (reportID: string | undefined, transactionID: string | undefined) => {
    if (!reportID || !transactionID) {
        return undefined;
    }
    return {...mockAction, originalMessage: {...mockAction, IOUTransactionID: transactionID}};
};

jest.mock('@src/hooks/useReportWithTransactionsAndViolations', () =>
    jest.fn((): [OnyxEntry<Report>, Transaction[], OnyxCollection<TransactionViolation[]>] => {
        return [mockChatReport, [mockTransaction, {...mockTransaction, transactionID: `${Number(mockTransaction.transactionID) + 1}`}], {violations: mockViolations}];
    }),
);

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

describe('MoneyRequestReportPreview', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
        jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(getIOUActionForReportID);
        await TestHelper.signInWithTestUser();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('renders all elements correctly', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${Number(mockTransaction.transactionID) + 1}`, {
            ...mockTransaction,
            amount: mockTransaction.amount * 2,
            transactionID: `${Number(mockTransaction.transactionID) + 1}`,
        });
        const {unmount} = renderPage({});
        await waitForBatchedUpdatesWithAct();
        const created = getFormattedCreated(mockTransaction);
        const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
        const isTransactionMadeWithCard = isCardTransaction(mockTransaction);
        const cashOrCard = isTransactionMadeWithCard ? translateLocal('iou.card') : translateLocal('iou.cash');
        const previewText = `${date} ${CONST.DOT_SEPARATOR} ${cashOrCard}`;
        expect(screen.getByText(convertToDisplayString(mockTransaction.amount, mockTransaction.currency))).toBeOnTheScreen();
        expect(screen.getByText(convertToDisplayString(mockTransaction.amount * 2, mockTransaction.currency))).toBeOnTheScreen();
        expect(screen.getAllByText(mockTransaction.merchant)).toHaveLength(2);
        expect(screen.getAllByText(previewText)).toHaveLength(2);
        if (mockAction.childReportName) {
            expect(screen.getByText(mockAction.childReportName)).toBeOnTheScreen();
        }
        unmount();
    });

    it('renders RBR for both transaction and report if there are violations', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`, mockTransaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mockTransaction.transactionID}`, mockViolations);
        jest.spyOn(ReportUtils, 'hasViolations').mockReturnValue(true);
        const {unmount} = renderPage({});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getAllByText(translateLocal('violations.reviewRequired'))).toHaveLength(2);
        unmount();
    });

    it('renders a skeleton if the transaction is empty', async () => {
        const {unmount} = renderPage({});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getAllByTestId(MoneyRequestSkeletonView.displayName)).toHaveLength(2);
        unmount();
    });
});
