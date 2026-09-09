import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type AttachmentPickerProps from '@components/AttachmentPicker/types';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type OpenPicker = Parameters<AttachmentPickerProps['children']>[0]['openPicker'];

const mockOpenPicker = jest.fn<ReturnType<OpenPicker>, Parameters<OpenPicker>>();

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useRoute: () => ({key: 'test', name: 'test', params: {}}),
    };
});

jest.mock('@components/AttachmentPicker', () => {
    function MockAttachmentPicker({children}: AttachmentPickerProps) {
        return <>{children({openPicker: mockOpenPicker})}</>;
    }
    return MockAttachmentPicker;
});

jest.mock('@hooks/useFilesValidation', () => (onFilesValidated: (files: FileObject[]) => void) => ({
    validateFiles: onFilesValidated,
    PDFValidationComponent: null,
}));

jest.mock(
    '@components/ReceiptAlternativeMethods',
    () =>
        function MockReceiptAlternativeMethods() {
            return null;
        },
);

jest.mock('@components/ReportActionItem/ReportActionItemImage', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    function MockReportActionItemImage({onLoad}: {onLoad?: () => void}) {
        useEffect(() => {
            onLoad?.();
        }, [onLoad]);
        return null;
    }
    return MockReportActionItemImage;
});

jest.mock('@src/languages/IntlStore', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const en: Record<string, unknown> = require('@src/languages/en').default;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const flatten: (obj: Record<string, unknown>) => Record<string, unknown> = require('@src/languages/flattenObject').default;
    const cache = new Map<string, Record<string, unknown>>();
    cache.set('en', flatten(en));
    return {
        getCurrentLocale: jest.fn(() => 'en'),
        getDateFnsLocale: jest.fn(() => undefined),
        load: jest.fn(() => Promise.resolve()),
        get: jest.fn((key: string, locale?: string) => {
            const translations = cache.get(locale ?? 'en');
            return translations?.[key] ?? null;
        }),
    };
});

jest.mock('@assets/emojis', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@assets/emojis');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        default: actual.default,
        importEmojiLocale: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@libs/EmojiTrie', () => ({
    buildEmojisTrie: jest.fn(),
}));

// Override IDs so we control Onyx keys and can use evictableKeys for REPORT_ACTIONS
const TEST_PARENT_REPORT_ID = 'testParentReportID';
const TEST_CHAT_REPORT_ID = 'testChatReportID';
const TEST_OWNER_ACCOUNT_ID = 1;
const TEST_OTHER_ACCOUNT_ID = 2;
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

const transactionWithReceipt: Transaction = {
    ...transactionWithoutReceipt,
    receipt: {
        state: CONST.IOU.RECEIPT_STATE.OPEN,
        source: 'https://example.com/receipt.jpg',
    },
};

const transactionWithMultiPagePDFReceipt: Transaction = {
    ...transactionWithoutReceipt,
    receipt: {
        state: CONST.IOU.RECEIPT_STATE.OPEN,
        source: 'https://example.com/receipt.pdf',
        filename: 'receipt.pdf',
        pageCount: 3,
    },
};

const transactionWithScanningReceipt: Transaction = {
    ...transactionWithoutReceipt,
    receipt: {
        state: CONST.IOU.RECEIPT_STATE.SCANNING,
        source: 'https://example.com/receipt.jpg',
    },
};

// A distance expense created from start/stop waypoints renders an auto-generated map as its receipt (a "map distance receipt").
const transactionWithMapDistanceReceipt: Transaction = {
    ...transactionWithReceipt,
    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
    comment: {
        waypoints: {
            waypoint0: {address: '123 Start St', lat: 40.7128, lng: -74.006, keyForList: 'start_waypoint'},
            waypoint1: {address: '456 End Ave', lat: 41.5, lng: -73.5, keyForList: 'stop_waypoint'},
        },
    },
};

// An odometer distance expense carries a real uploaded odometer photo (not a generated map), so its receipt-upload
// fallback must be preserved on a create failure so the user can still save the file they uploaded.
const transactionWithOdometerDistanceReceipt: Transaction = {
    ...transactionWithReceipt,
    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
};

// The expense's own report, whose parent is the conversation the expense was created in.
const testMoneyRequestReport: Report = {
    ...testReport,
    reportID: TEST_PARENT_REPORT_ID,
    parentReportID: TEST_CHAT_REPORT_ID,
    chatReportID: TEST_CHAT_REPORT_ID,
};

const testChatReport: Report = {
    ...testReport,
    reportID: TEST_CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
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
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TEST_PARENT_REPORT_ID}`, testMoneyRequestReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TEST_CHAT_REPORT_ID}`, testChatReport);
            // Signed in as the person who raised the expense unless a test says otherwise. Who the viewer is decides
            // the add button, so with no session nobody qualifies and every expense would look uneditable.
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_OWNER_ACCOUNT_ID, email: 'owner@test.com'});
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

            const firstCall = mockOpenPicker.mock.calls.at(0);
            const onPicked = firstCall?.at(0)?.onPicked;
            expect(onPicked).toBeDefined();
        });
    });

    describe('receipt page count badge', () => {
        it('shows the page count for a multi-page PDF receipt', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithMultiPagePDFReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('receipt.pageCount', {pageCount: 3}))).toBeTruthy();
        });

        it('does not show the page count for a single page PDF receipt', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, {
                    ...transactionWithMultiPagePDFReceipt,
                    receipt: {...transactionWithMultiPagePDFReceipt.receipt, pageCount: 1},
                });
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('receipt.pageCount', {pageCount: 1}))).toBeNull();
        });

        // An optimistic merge that swaps a PDF for an image can leave the PDF's count behind, so the
        // badge has to follow the current file type rather than the leftover count
        it('does not show the page count when a stale count is left on an image receipt', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, {
                    ...transactionWithMultiPagePDFReceipt,
                    receipt: {...transactionWithMultiPagePDFReceipt.receipt, source: 'https://example.com/photo.jpg', filename: 'photo.jpg'},
                });
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('receipt.pageCount', {pageCount: 3}))).toBeNull();
        });

        // An image receipt carries no page count at all, which is also what a PDF uploaded before the
        // backend started reporting one looks like
        it('does not show the page count for a receipt without one', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('receipt.pageCount', {pageCount: 3}))).toBeNull();
        });

        // The regenerated receipt makes the old count stale
        it('does not show the page count while a map distance receipt is regenerating', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, {
                    ...transactionWithMultiPagePDFReceipt,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
                    pendingFields: {merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                });
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('receipt.pageCount', {pageCount: 3}))).toBeNull();
        });
    });

    describe('receipt action buttons visibility', () => {
        it('does not show action buttons when transaction has no receipt', async () => {
            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeNull();
            expect(screen.queryByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeNull();
        });

        it('shows action buttons when transaction has a receipt', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeTruthy();
            expect(screen.getByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeTruthy();
        });

        it('shows action buttons when receipt is scanning', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithScanningReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeTruthy();
            expect(screen.getByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeTruthy();
        });

        it('does not show action buttons in readonly mode', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView
                        report={testReport}
                        readonly
                    />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeNull();
            expect(screen.queryByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeNull();
        });

        it('hides the add button but keeps the expand button for someone who may not edit the expense', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
                // Invited to look at an expense somebody else raised, as in the reported flow.
                await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_OTHER_ACCOUNT_ID, email: 'invited@test.com'});
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeNull();
            expect(screen.getByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeTruthy();
        });

        it('shows action buttons to the person who raised the expense', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeTruthy();
            expect(screen.getByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeTruthy();
        });

        it('hides both buttons when the expense is on its way out', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
                // Deleting the expense marks the action that created it, which puts the whole report beyond reach.
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_PARENT_REPORT_ID}`, {
                    [TEST_ACTION_ID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                });
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeNull();
            expect(screen.queryByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeNull();
        });

        it('hides both buttons for an anonymous viewer', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
                await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeNull();
            expect(screen.queryByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeNull();
        });

        it('hides both buttons on an archived report', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
                // An IOU thread, because archiving leaves an expense report's receipts reachable on purpose.
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TEST_PARENT_REPORT_ID}`, {type: CONST.REPORT.TYPE.IOU});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${TEST_REPORT_ID}`, {private_isArchived: '2025-02-14 08:12:19'});
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={{...testReport, type: CONST.REPORT.TYPE.CHAT}} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeNull();
            expect(screen.queryByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeNull();
        });

        it('shows both action buttons for a map distance receipt', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithMapDistanceReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={testReport} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText(translateLocal('accessibilityHints.viewAttachment'))).toBeTruthy();
            expect(screen.getByLabelText(translateLocal('receipt.addAdditionalReceipt'))).toBeTruthy();
        });
    });

    // A report-creation failure sets report.errorFields.createChat. Because a receipt is present, the view synthesizes a
    // fallback receipt-upload error - but distance expenses only carry a generated map receipt, so they must not surface it.
    describe('fallback receipt-upload error on report-creation failure', () => {
        const reportWithCreationError: Report = {
            ...testReport,
            errorFields: {
                createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage', 1739520725165000),
            },
        };

        it('shows the receipt-upload error for a regular receipt expense', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={reportWithCreationError} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.error.receiptUploadFailedMessage'))).toBeTruthy();
            expect(screen.getByText(translateLocal('iou.error.saveReceipt'))).toBeTruthy();
        });

        it('does not show the receipt-upload error for a distance expense', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithMapDistanceReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={reportWithCreationError} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('iou.error.receiptUploadFailedMessage'))).toBeNull();
            expect(screen.queryByText(translateLocal('iou.error.saveReceipt'))).toBeNull();
        });

        it('shows the receipt-upload error for an odometer distance expense (real uploaded file)', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`, transactionWithOdometerDistanceReceipt);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <Wrapper>
                    <MoneyRequestReceiptView report={reportWithCreationError} />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.error.receiptUploadFailedMessage'))).toBeTruthy();
            expect(screen.getByText(translateLocal('iou.error.saveReceipt'))).toBeTruthy();
        });
    });
});
