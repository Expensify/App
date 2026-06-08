/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getReceiverType, getSendInvoiceInformation, sendInvoice} from '@libs/actions/IOU/SendInvoice';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, RecentlyUsedCategories, RecentlyUsedTags, Report} from '@src/types/onyx';
import type {Participant as IOUParticipant} from '@src/types/onyx/IOU';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import type {InvoiceTestData} from '../../data/Invoice';
import * as InvoiceData from '../../data/Invoice';
import currencyList from '../../unit/currencyList.json';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => topMostReportID),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/SendInvoice', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getReceiverType', () => {
        it('returns INDIVIDUAL when receiver is undefined', () => {
            const result = getReceiverType(undefined);
            expect(result).toBe(CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL);
        });

        it('returns provided type when receiver has explicit type', () => {
            const receiver: InvoiceReceiver = {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: 123,
            };

            const result = getReceiverType(receiver);
            expect(result).toBe(CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL);
        });

        it('returns BUSINESS when participant has non-fake policyID and no explicit type', () => {
            const participant: IOUParticipant = {
                accountID: 1,
                policyID: 'somePolicyID',
            };

            const result = getReceiverType(participant);
            expect(result).toBe(CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS);
        });

        it('returns INDIVIDUAL when participant has fake policyID and no explicit type', () => {
            const participant: IOUParticipant = {
                accountID: 1,
                policyID: CONST.POLICY.ID_FAKE,
            };

            const result = getReceiverType(participant);
            expect(result).toBe(CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL);
        });
    });

    describe('getSendInvoiceInformation', () => {
        const baseParticipants = [
            {accountID: 123, isSender: true, policyID: 'workspace_test'},
            {accountID: 456, isSender: false},
        ];

        const baseSenderPolicyID = baseParticipants.find((p) => p.isSender)?.policyID;

        let baseSenderPolicyTags: PolicyTagLists;
        beforeEach(async () => {
            baseSenderPolicyTags = (await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${baseSenderPolicyID}`)) ?? {};
        });

        const baseTransaction = {
            transactionID: 'transaction_base',
            reportID: 'report_base',
            amount: 100,
            currency: 'USD',
            created: '2024-02-01',
            merchant: 'Test Merchant',
            participants: baseParticipants,
        };

        it('should merge policyRecentlyUsedCategories when provided', () => {
            const currentUserAccountID = 123;
            const existingRecentlyUsedCategories: OnyxEntry<RecentlyUsedCategories> = [];

            // When: Call getSendInvoiceInformation with policyRecentlyUsedCategories
            const result = getSendInvoiceInformation({
                transaction: baseTransaction as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReport: undefined,
                receiptFile: undefined,
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                companyName: undefined,
                companyWebsite: undefined,
                policyRecentlyUsedCategories: existingRecentlyUsedCategories,
                senderPolicyTags: baseSenderPolicyTags,
            });

            // Then: Verify optimistic data is generated when policyRecentlyUsedCategories are provided
            expect(result.onyxData.optimisticData).toBeDefined();
        });

        it('should merge policyRecentlyUsedCurrencies when currency is provided in transaction', () => {
            const testCurrency = CONST.CURRENCY.EUR;
            const initialCurrencies = [CONST.CURRENCY.USD, CONST.CURRENCY.GBP];

            const currentUserAccountID = 123;

            const result = getSendInvoiceInformation({
                transaction: {...baseTransaction, currency: CONST.CURRENCY.EUR} as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: initialCurrencies,
                invoiceChatReport: undefined,
                receiptFile: undefined,
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                companyName: undefined,
                companyWebsite: undefined,
                policyRecentlyUsedCategories: undefined,
                senderPolicyTags: baseSenderPolicyTags,
            });

            expect(result.onyxData.optimisticData).toBeDefined();

            const optimisticData = result.onyxData?.optimisticData;
            expect(optimisticData).toBeDefined();
            const currencyUpdate = optimisticData?.find((update) => update.key === ONYXKEYS.RECENTLY_USED_CURRENCIES && update.onyxMethod === Onyx.METHOD.SET);
            expect(currencyUpdate).toBeDefined();
            expect(currencyUpdate?.value).toEqual([testCurrency, ...initialCurrencies]);
        });

        it('should return correct invoice information with new chat report', () => {
            // Given: Mock transaction data
            const currentUserAccountID = 123;
            const mockPolicy = createRandomPolicy(1);

            const mockPolicyCategories = {
                Services: {
                    name: 'Services',
                    enabled: true,
                },
            };

            const mockPolicyTagList = {
                tagList: {
                    name: 'tagList',
                    orderWeight: 0,
                    required: false,
                    tags: {
                        projectB: {
                            name: 'Project B',
                            enabled: true,
                        },
                    },
                },
            };

            // When: Call getSendInvoiceInformation
            const result = getSendInvoiceInformation({
                transaction: baseTransaction as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReport: undefined,
                receiptFile: undefined,
                policy: mockPolicy,
                policyTagList: mockPolicyTagList as OnyxEntry<PolicyTagLists>,
                policyCategories: mockPolicyCategories,
                companyName: 'Test Company Inc.',
                companyWebsite: 'https://testcompany.com',
                policyRecentlyUsedCategories: ['Services', 'Consulting'],
                senderPolicyTags: mockPolicyTagList as PolicyTagLists,
            });

            // Then: Verify the result structure and key values
            expect(result).toMatchObject({
                senderWorkspaceID: 'workspace_test',
                invoiceReportID: expect.any(String),
                transactionID: expect.any(String),
                transactionThreadReportID: expect.any(String),
                createdIOUReportActionID: expect.any(String),
                reportActionID: expect.any(String),
                createdChatReportActionID: expect.any(String),
                reportPreviewReportActionID: expect.any(String),
            });

            // Verify receiver information
            expect(result.receiver).toBeDefined();
            expect(result.receiver.accountID).toBe(456);

            // Verify invoice room (chat report)
            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.reportID).toBeDefined();
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);

            // Verify Onyx data structure
            expect(result.onyxData).toBeDefined();
            expect(result.onyxData.optimisticData).toBeDefined();
            expect(result.onyxData.successData).toBeDefined();
            expect(result.onyxData.failureData).toBeDefined();
        });

        it('should return correct invoice information with existing chat report', () => {
            // Given: Existing invoice chat report
            const existingInvoiceChatReport = {
                reportID: 'invoice_chat_123',
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '123': {
                        accountID: 123,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '456': {
                        accountID: 456,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                invoiceReceiver: {
                    type: 'individual',
                    accountID: 456,
                    displayName: 'Client Company',
                    login: 'client@example.com',
                },
            };

            const currentUserAccountID = 123;

            // When: Call getSendInvoiceInformation with existing chat report
            const result = getSendInvoiceInformation({
                transaction: {
                    ...baseTransaction,
                    participants: [{...baseParticipants.at(0), policyID: 'workspace_456'}, baseParticipants.at(1)],
                } as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReport: existingInvoiceChatReport as OnyxEntry<Report>,
                receiptFile: undefined,
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                companyName: 'Client Company Ltd.',
                companyWebsite: 'https://clientcompany.com',
                policyRecentlyUsedCategories: [],
                senderPolicyTags: baseSenderPolicyTags,
            });

            // Then: Verify the result uses existing chat report
            expect(result.invoiceRoom.reportID).toBe('invoice_chat_123');
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);

            // Verify transaction data
            expect(result.transactionID).toBeDefined();
            expect(result.senderWorkspaceID).toBe('workspace_456');
        });

        it('should handle receipt attachment correctly', () => {
            // Given: Transaction with receipt

            const mockReceipt = {
                source: 'receipt_source_123',
                name: 'receipt.pdf',
                state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
            };

            const currentUserAccountID = 123;

            // When: Call getSendInvoiceInformation with receipt
            const result = getSendInvoiceInformation({
                transaction: baseTransaction as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReport: undefined,
                receiptFile: mockReceipt,
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                companyName: undefined,
                companyWebsite: undefined,
                policyRecentlyUsedCategories: [],
                senderPolicyTags: baseSenderPolicyTags,
            });

            // Then: Verify receipt handling
            expect(result.transactionID).toBeDefined();
            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);

            // Verify Onyx data includes receipt information
            expect(result.onyxData).toBeDefined();
            expect(result.onyxData.optimisticData).toBeDefined();
        });

        it('should handle missing transaction data gracefully', () => {
            // Given: Minimal transaction data
            const mockTransaction = {
                transactionID: 'transaction_minimal',
                reportID: 'report_minimal',
                amount: 100,
                currency: 'USD',
                created: '2024-01-30',
                merchant: 'Minimal Company',
                participants: [
                    {
                        accountID: 123,
                        isSender: true,
                    },
                    {
                        accountID: 456,
                        isSender: false,
                    },
                ],
            };

            const currentUserAccountID = 123;

            // When: Call getSendInvoiceInformation with minimal data
            const result = getSendInvoiceInformation({
                transaction: mockTransaction as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReport: undefined,
                receiptFile: undefined,
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                companyName: undefined,
                companyWebsite: undefined,
                policyRecentlyUsedCategories: [],
                senderPolicyTags: baseSenderPolicyTags,
            });

            // Then: Verify function handles missing data gracefully
            expect(result).toBeDefined();
            expect(result.transactionID).toBeDefined();
            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);
            expect(result.receiver).toBeDefined();
            expect(result.onyxData).toBeDefined();
        });

        it('should use provided invoiceChatReportID when creating new invoice chat', () => {
            const preGeneratedReportID = 'pre_generated_invoice_chat_123';

            const currentUserAccountID = 123;

            const result = getSendInvoiceInformation({
                transaction: baseTransaction as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReport: undefined,
                invoiceChatReportID: preGeneratedReportID,
                receiptFile: undefined,
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                companyName: undefined,
                companyWebsite: undefined,
                policyRecentlyUsedCategories: [],
                senderPolicyTags: baseSenderPolicyTags,
            });

            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.reportID).toBe(preGeneratedReportID);
            expect(result.invoiceRoom.chatType).toBe(CONST.REPORT.CHAT_TYPE.INVOICE);
        });

        it('should ignore invoiceChatReportID when existing invoiceChatReport matches receiver', () => {
            const preGeneratedReportID = 'should_be_ignored';
            const existingReportID = 'existing_invoice_chat';
            const receiverAccountID = 456;

            const existingInvoiceChatReport = {
                reportID: existingReportID,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '123': {
                        accountID: 123,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '456': {
                        accountID: receiverAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: receiverAccountID,
                },
            };

            const currentUserAccountID = 123;

            const result = getSendInvoiceInformation({
                transaction: baseTransaction as OnyxEntry<Transaction>,
                currentUserAccountID,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReport: existingInvoiceChatReport as OnyxEntry<Report>,
                invoiceChatReportID: preGeneratedReportID,
                receiptFile: undefined,
                policy: undefined,
                policyTagList: undefined,
                policyCategories: undefined,
                companyName: undefined,
                companyWebsite: undefined,
                policyRecentlyUsedCategories: [],
                senderPolicyTags: baseSenderPolicyTags,
            });

            expect(result.invoiceRoom).toBeDefined();
            expect(result.invoiceRoom.reportID).toBe(existingReportID);
            expect(result.invoiceRoom.reportID).not.toBe(preGeneratedReportID);
        });

        it('should build optimistic recently used tags from senderPolicyTags', async () => {
            // Given: A transaction with a tag and policy tags seeded in Onyx
            const policyID = 'workspace_tags_test';
            const tagListName = 'Department';
            const transactionTag = 'Engineering';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagListName]: {
                    name: tagListName,
                    orderWeight: 0,
                    required: false,
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                        Marketing: {name: 'Marketing', enabled: true},
                    },
                },
            });
            await waitForBatchedUpdates();

            const senderPolicyTags = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

            const policyRecentlyUsedTags: RecentlyUsedTags = {
                [tagListName]: ['Marketing'],
            };

            const mockTransaction = {
                transactionID: 'transaction_tags_test',
                reportID: 'report_tags_test',
                amount: 100,
                currency: 'USD',
                created: '2024-02-01',
                merchant: 'Tags Test',
                tag: transactionTag,
                participants: [
                    {accountID: 123, isSender: true, policyID},
                    {accountID: 456, isSender: false},
                ],
            };

            // When: Call getSendInvoiceInformation with senderPolicyTags read from Onyx
            const result = getSendInvoiceInformation({
                transaction: mockTransaction as OnyxEntry<Transaction>,
                currentUserAccountID: 123,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags,
                senderPolicyTags: senderPolicyTags ?? {},
            });

            // Then: optimisticData should contain a POLICY_RECENTLY_USED_TAGS update with the transaction tag prepended
            const recentlyUsedTagsUpdate = result.onyxData.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);

            expect(recentlyUsedTagsUpdate).toBeDefined();
            expect(recentlyUsedTagsUpdate?.value).toMatchObject({
                [tagListName]: [transactionTag, 'Marketing'],
            });
        });

        it('should not include recently used tags update when transaction has no tag', async () => {
            // Given: A transaction with no tag and policy tags seeded in Onyx
            const policyID = 'workspace_no_tags';
            const tagListName = 'Department';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagListName]: {
                    name: tagListName,
                    orderWeight: 0,
                    required: false,
                    tags: {Engineering: {name: 'Engineering', enabled: true}},
                },
            });
            await waitForBatchedUpdates();

            const senderPolicyTags = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

            const mockTransaction = {
                transactionID: 'transaction_no_tags',
                reportID: 'report_no_tags',
                amount: 100,
                currency: 'USD',
                created: '2024-02-01',
                merchant: 'No Tags Test',
                participants: [
                    {accountID: 123, isSender: true, policyID},
                    {accountID: 456, isSender: false},
                ],
            };

            // When: Call getSendInvoiceInformation without a tag on the transaction
            const result = getSendInvoiceInformation({
                transaction: mockTransaction as OnyxEntry<Transaction>,
                currentUserAccountID: 123,
                policyRecentlyUsedCurrencies: [],
                senderPolicyTags: senderPolicyTags ?? {},
            });

            // Then: No POLICY_RECENTLY_USED_TAGS update should be in optimisticData
            const recentlyUsedTagsUpdate = result.onyxData.optimisticData?.find((update) => String(update.key).startsWith(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS));

            expect(recentlyUsedTagsUpdate).toBeUndefined();
        });
    });
    describe('sendInvoice', () => {
        it('creates a new invoice chat when one has been converted from individual to business', async () => {
            // Mock API.write for this test
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            // Given a convertedInvoiceReport is stored in Onyx
            const {policy, transaction, convertedInvoiceChat}: InvoiceTestData = InvoiceData;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${convertedInvoiceChat?.reportID}`, convertedInvoiceChat ?? {});

            // And data for when a new invoice is sent to a user
            const currentUserAccountID = 32;
            const companyName = 'b1-53019';
            const companyWebsite = 'https://www.53019.com';

            // When the user sends a new invoice to an individual
            sendInvoice({
                currentUserAccountID,
                transaction,
                policyRecentlyUsedCurrencies: [],
                policy,
                companyName,
                companyWebsite,
                senderPolicyTags: undefined,
            });

            // Then a new invoice chat is created instead of incorrectly using the invoice chat which has been converted from individual to business
            expect(writeSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    invoiceRoomReportID: expect.not.stringMatching(convertedInvoiceChat.reportID) as string,
                }),
                expect.anything(),
            );
            writeSpy.mockRestore();
        });

        it('should not clear transaction pending action when send invoice fails', async () => {
            const testCurrency = CONST.CURRENCY.EUR;
            const transaction = {
                ...createRandomTransaction(1),
                currency: testCurrency,
            } as unknown as OnyxEntry<Transaction>;
            const initialCurrencies: string[] = [];
            await Onyx.set(ONYXKEYS.RECENTLY_USED_CURRENCIES, initialCurrencies);

            mockFetch?.pause?.();
            sendInvoice({
                currentUserAccountID: 1,
                transaction,
                policyRecentlyUsedCurrencies: initialCurrencies,
                senderPolicyTags: undefined,
            });

            mockFetch?.fail?.();
            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (allTransactions) => {
                        Onyx.disconnect(connection);
                        const transactionValue = Object.values(allTransactions).at(0);
                        expect(transactionValue?.errors).not.toBeUndefined();
                        expect(transactionValue?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                        resolve();
                    },
                });
            });

            const recentlyUsedCurrencies = await getOnyxValue(ONYXKEYS.RECENTLY_USED_CURRENCIES);
            expect(recentlyUsedCurrencies).toEqual([testCurrency]);
        });

        it('should handle policyRecentlyUsedCategories when provided', () => {
            // Given a basic transaction and policyRecentlyUsedCategories
            const transaction = createRandomTransaction(1) as unknown as OnyxEntry<Transaction>;
            const currentUserAccountID = 1;
            const policyRecentlyUsedCategories: OnyxEntry<RecentlyUsedCategories> = [];

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            // When sending an invoice
            sendInvoice({
                currentUserAccountID,
                transaction,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedCategories,
                senderPolicyTags: undefined,
            });

            // Then onyxData should be passed to API.write
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.SEND_INVOICE,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: expect.any(Array),
                }),
            );

            writeSpy.mockRestore();
        });

        it('should update policyRecentlyUsedTags when tag is provided', async () => {
            // Given a transaction with a tag
            const policyID = 'A';
            const transactionTag = 'new tag';
            const transaction: Transaction = {
                ...createRandomTransaction(1),
                tag: transactionTag,
                participants: [{isSender: true, policyID}],
            };
            const tagName = 'Tag';
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };
            // When sending an invoice
            sendInvoice({
                currentUserAccountID: 1,
                transaction,
                policyRecentlyUsedCurrencies: [],
                policyRecentlyUsedTags,
                senderPolicyTags: {
                    [tagName]: {
                        name: tagName,
                        required: false,
                        tags: {},
                        orderWeight: 0,
                    },
                },
            });
            await waitForBatchedUpdates();

            // Then the transaction tag should be added to the recently used tags collection
            const newPolicyRecentlyUsedTags = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
            expect(newPolicyRecentlyUsedTags?.[tagName]?.length).toBe(2);
            expect(newPolicyRecentlyUsedTags?.[tagName]?.at(0)).toBe(transactionTag);
        });

        it('should use invoiceChatReportID when creating new invoice chat via sendInvoice', () => {
            const preGeneratedReportID = 'pre_generated_report_id_456';
            const transaction = {
                ...createRandomTransaction(1),
                participants: [
                    {
                        accountID: 123,
                        isSender: true,
                        policyID: 'workspace_test',
                    },
                    {
                        accountID: 456,
                        isSender: false,
                    },
                ],
            } as unknown as OnyxEntry<Transaction>;

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            sendInvoice({
                currentUserAccountID: 123,
                transaction,
                policyRecentlyUsedCurrencies: [],
                invoiceChatReportID: preGeneratedReportID,
                senderPolicyTags: undefined,
            });

            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.SEND_INVOICE,
                expect.objectContaining({
                    invoiceRoomReportID: preGeneratedReportID,
                }),
                expect.anything(),
            );

            writeSpy.mockRestore();
        });
    });
});
