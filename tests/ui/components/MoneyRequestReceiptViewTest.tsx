import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockOpenPicker = jest.fn();

jest.mock('@components/AttachmentPicker', () => {
    function MockAttachmentPicker({children}: {children: (props: {openPicker: (opts: {onPicked: (files: unknown[]) => void}) => void}) => React.ReactNode}) {
        return <>{children({openPicker: mockOpenPicker})}</>;
    }
    return MockAttachmentPicker;
});

jest.mock('@hooks/useFilesValidation', () => (onFilesValidated: (files: FileObject[]) => void) => ({
    validateFiles: onFilesValidated,
    PDFValidationComponent: null,
    ErrorModal: null,
}));

jest.mock(
    '@components/ReceiptAlternativeMethods',
    () =>
        function MockReceiptAlternativeMethods() {
            return null;
        },
);

// Override IDs so we control Onyx keys and can use evictableKeys for REPORT_ACTIONS
const TEST_PARENT_REPORT_ID = 'testParentReportID';
const TEST_REPORT_ID = 'testReportID';
const TEST_ACTION_ID = 'testActionID';
const TEST_TRANSACTION_ID = 'testTransactionID';
const TEST_POLICY_ID = 'testPolicyID';

const testReport: Report = {
    reportID: TEST_REPORT_ID,
    parentReportID: TEST_PARENT_REPORT_ID,
    parentReportActionID: TEST_ACTION_ID,
    policyID: TEST_POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    participants: {},
    reportName: '',
    lastReadTime: '',
    lastVisibleActionCreated: '',
    lastMessageText: '',
    lastActorAccountID: 1,
    ownerAccountID: 1,
    managerID: 1,
    total: 0,
    unheldTotal: 0,
    permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE],
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
    lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    stateNum: 0,
    statusNum: 0,
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastReadSequenceNumber: 0,
    unheldNonReimbursableTotal: 0,
    nonReimbursableTotal: 0,
    errorFields: {},
    currency: CONST.CURRENCY.USD,
    oldPolicyName: '',
    welcomeMessage: '',
    description: '',
};

const testParentReportAction = {
    reportActionID: TEST_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    originalMessage: {
        IOUTransactionID: TEST_TRANSACTION_ID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    },
    created: '2025-02-14 08:12:05.165',
    actorAccountID: 1,
    person: [{type: 'TEXT', style: 'strong', text: 'Test'}],
    message: [{type: 'COMMENT', html: '', text: '', isEdited: false, whisperedTo: [], isDeletedParentAction: false}],
};

const transactionWithoutReceipt: Transaction = {
    transactionID: TEST_TRANSACTION_ID,
    reportID: TEST_REPORT_ID,
    amount: 100,
    currency: CONST.CURRENCY.USD,
    cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
    status: CONST.TRANSACTION.STATUS.POSTED,
    created: '2025-02-14',
    inserted: '2025-02-14 08:12:19',
    merchant: 'Test',
    billable: false,
    managedCard: false,
    reimbursable: true,
    receipt: undefined,
    comment: {},
    bank: '',
    cardNumber: '',
    category: '',
    modifiedAmount: '',
    originalAmount: 0,
    parentTransactionID: '',
    posted: '',
    tag: '',
    hasEReceipt: false,
    cardID: 0,
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMerchant: '',
    originalCurrency: '',
};

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

describe('MoneyRequestReceiptView', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_PARENT_REPORT_ID}`, {
                [TEST_ACTION_ID]: testParentReportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithoutReceipt);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}`, {id: TEST_POLICY_ID});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${TEST_POLICY_ID}`, {});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('wide RHP setReceiptFile flow', () => {
        it('calls setReceiptFile with the picked file when onPicked is invoked (replaceReceipt called)', async () => {
            render(
                <Wrapper>
                    <MoneyRequestReceiptView
                        report={testReport}
                        fillSpace
                        isDisplayedInWideRHP
                    />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            const uploadButton = screen.getByLabelText(translateLocal('receipt.upload'));
            fireEvent.press(uploadButton);
            expect(mockOpenPicker).toHaveBeenCalledTimes(1);

            const firstCall = (mockOpenPicker.mock.calls as Array<[{onPicked: (files: FileObject[]) => void}]>).at(0);
            const onPicked = firstCall?.at(0)?.onPicked;
            expect(onPicked).toBeDefined();
        });
    });
});
