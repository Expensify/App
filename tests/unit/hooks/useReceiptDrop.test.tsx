import {act, renderHook, waitFor} from '@testing-library/react-native';

import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import type usePermissions from '@hooks/usePermissions';
import type usePersonalPolicy from '@hooks/usePersonalPolicy';

import Navigation from '@navigation/Navigation';

import useReceiptDrop from '@pages/inbox/report/ReportActionCompose/useReceiptDrop';

import {initMoneyRequest, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {replaceReceipt, setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, Transaction} from '@src/types/onyx';

import {format} from 'date-fns';
import ImageSize from 'react-native-image-size';
import Onyx from 'react-native-onyx';

import type * as TransactionEditModule from '../../../src/libs/actions/TransactionEdit';
import type * as MockConfirmModalModule from '../../utils/mockUseConfirmModal';

import createMock from '../../utils/createMock';
import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal} from '../../utils/mockUseConfirmModal';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockReceiptUser = createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({accountID: 7});
const mockReceiptPermissions = {isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false} satisfies ReturnType<typeof usePermissions>;
const mockReceiptPersonalPolicy = createMock<ReturnType<typeof usePersonalPolicy>>({id: 'personal', type: CONST.POLICY.TYPE.PERSONAL});
const receiptReport = createMock<Report>({reportID: '100', type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM});

jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof MockConfirmModalModule>('../../utils/mockUseConfirmModal').default);
jest.mock('@components/Modal/Global/ModalContext', () => jest.requireActual<typeof MockConfirmModalModule>('../../utils/mockUseConfirmModal').createMockModalContextModule());
jest.mock('@components/FullScreenLoaderContext', () => ({useFullScreenLoaderActions: () => ({setIsLoaderVisible: jest.fn()})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({invisiblePDF: {}}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => mockReceiptUser);
jest.mock('@hooks/usePermissions', () => () => mockReceiptPermissions);
jest.mock('@hooks/usePersonalPolicy', () => () => mockReceiptPersonalPolicy);
jest.mock('@hooks/useDelegateAccountID', () => () => undefined);
jest.mock('react-native-image-size');
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn<ReturnType<typeof Navigation.navigate>, Parameters<typeof Navigation.navigate>>()}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({
    initMoneyRequest: jest.fn<ReturnType<typeof initMoneyRequest>, Parameters<typeof initMoneyRequest>>(),
    setMoneyRequestParticipantsFromReport: jest.fn<ReturnType<typeof setMoneyRequestParticipantsFromReport>, Parameters<typeof setMoneyRequestParticipantsFromReport>>(),
}));
jest.mock('@userActions/IOU/Receipt', () => ({
    replaceReceipt: jest.fn<ReturnType<typeof replaceReceipt>, Parameters<typeof replaceReceipt>>(),
    setMoneyRequestReceipt: jest.fn<ReturnType<typeof setMoneyRequestReceipt>, Parameters<typeof setMoneyRequestReceipt>>(),
}));
jest.mock('@userActions/TransactionEdit', () => ({
    buildOptimisticTransactionAndCreateDraft: jest.fn<ReturnType<typeof buildOptimisticTransactionAndCreateDraft>, Parameters<typeof buildOptimisticTransactionAndCreateDraft>>(),
}));

const realBuildOptimisticTransactionAndCreateDraft = jest.requireActual<typeof TransactionEditModule>('../../../src/libs/actions/TransactionEdit').buildOptimisticTransactionAndCreateDraft;

function receiptDropEvent(files: File[]): DragEvent {
    const fileList = createMock<FileList>({length: files.length});
    for (const [index, file] of files.entries()) {
        Object.defineProperty(fileList, index, {value: file});
    }
    return createMock<DragEvent>({dataTransfer: {files: fileList, items: createMock<DataTransferItemList>({length: 0})}});
}

describe('useReceiptDrop real clipboard and validation integration', () => {
    const mockCreateObjectURL = jest.fn<ReturnType<typeof URL.createObjectURL>, Parameters<typeof URL.createObjectURL>>();
    const mockRevokeObjectURL = jest.fn<ReturnType<typeof URL.revokeObjectURL>, Parameters<typeof URL.revokeObjectURL>>();
    let originalCreateObjectURL: PropertyDescriptor | undefined;
    let originalRevokeObjectURL: PropertyDescriptor | undefined;

    beforeEach(async () => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        await act(async () => {
            await Onyx.clear();
        });
        mockCreateObjectURL.mockReset().mockImplementation(() => `blob:receipt-${mockCreateObjectURL.mock.calls.length}`);
        originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
        originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
        Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: mockCreateObjectURL});
        Object.defineProperty(URL, 'revokeObjectURL', {configurable: true, value: mockRevokeObjectURL});
        jest.mocked(ImageSize.getSize).mockResolvedValue({width: 320, height: 240});
        jest.mocked(initMoneyRequest).mockReturnValue(createMock<NonNullable<ReturnType<typeof initMoneyRequest>>>({transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID}));
        jest.mocked(buildOptimisticTransactionAndCreateDraft).mockReturnValue(createMock<ReturnType<typeof buildOptimisticTransactionAndCreateDraft>>({transactionID: 'later-draft'}));
    });

    afterEach(() => {
        if (originalCreateObjectURL) {
            Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
        } else {
            Reflect.deleteProperty(URL, 'createObjectURL');
        }
        if (originalRevokeObjectURL) {
            Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
        } else {
            Reflect.deleteProperty(URL, 'revokeObjectURL');
        }
    });

    it('replaces with the validated renamed File and keeps object URL operation order', async () => {
        // Given a browser File's illegal name requires validation to produce a replacement File.
        const payload = 'receipt bytes'.repeat(20);
        const original = new File([payload], 'bad:name.jpg', {type: 'image/jpeg'});
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report: receiptReport, shouldAddOrReplaceReceipt: true, transactionID: 'existing'}));
        await waitForBatchedUpdatesWithAct();

        // When the real drop hook crosses actual clipboard extraction and actual file validation.
        act(() => result.current.onReceiptDropped(receiptDropEvent([original])));
        await waitFor(() => expect(replaceReceipt).toHaveBeenCalledTimes(1));
        const replacement = jest.mocked(replaceReceipt).mock.calls.at(0)?.[0];
        expect(replacement).toBeDefined();
        if (!replacement) {
            throw new Error('Validated receipt replacement must be present');
        }
        expect(replacement.file).toBeInstanceOf(File);
        if (!(replacement.file instanceof File)) {
            throw new Error('Validated receipt replacement must contain an actual File');
        }
        const replacementFile = replacement.file;
        const replacementBytes = await new Promise<FileReader['result']>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(replacementFile);
        });

        expect(mockShowConfirmModal).not.toHaveBeenCalled();

        // Then the transformed File retains bytes/MIME and URLs use the original, then replacement twice.
        expect(replacementFile).toBeInstanceOf(File);
        expect(replacementFile).not.toBe(original);
        expect(replacementFile.name).toBe('bad_name.jpg');
        expect(replacementFile.type).toBe(original.type);
        expect(replacementFile.size).toBe(original.size);
        expect(replacementBytes).toBe(payload);
        expect(mockCreateObjectURL.mock.calls.map(([file]) => file)).toEqual([original, replacementFile, replacementFile]);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:receipt-1');
        expect(replacement.source).toBe('blob:receipt-3');
        expect(initMoneyRequest).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([false, true])('keeps first/later IDs and scan routing when initial transaction is absent=%s', async (withoutInitialTransaction) => {
        // Given a scan drop can initialize without a returned transaction and still create later drafts.
        const first = new File(['first receipt'.repeat(20)], 'first.jpg', {type: 'image/jpeg'});
        const second = new File(['second receipt'.repeat(20)], 'second.jpg', {type: 'image/jpeg'});
        if (withoutInitialTransaction) {
            jest.mocked(initMoneyRequest).mockReturnValue(undefined);
        }
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report: receiptReport, shouldAddOrReplaceReceipt: false, transactionID: undefined}));
        await waitForBatchedUpdatesWithAct();

        // When the real validator accepts both Files in their original order.
        act(() => result.current.onReceiptDropped(receiptDropEvent([first, second])));
        await waitFor(() => expect(setMoneyRequestReceipt).toHaveBeenCalledTimes(2));

        expect(mockShowConfirmModal).not.toHaveBeenCalled();

        // Then the first optimistic and later generated IDs keep their receipt/participant pairing.
        expect(jest.mocked(setMoneyRequestReceipt).mock.calls.map(([id]) => id)).toEqual([CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 'later-draft']);
        expect(jest.mocked(setMoneyRequestReceipt).mock.calls.map(([, , name]) => name)).toEqual(['first.jpg', 'second.jpg']);
        expect(jest.mocked(setMoneyRequestParticipantsFromReport).mock.calls.map(([id]) => id)).toEqual([CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 'later-draft']);
        expect(buildOptimisticTransactionAndCreateDraft).toHaveBeenCalledWith({
            initialTransaction: withoutInitialTransaction ? {} : {transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID},
            reportID: '100',
        });
        const receiptURLCalls = mockCreateObjectURL.mock.calls.slice(-2);
        expect(receiptURLCalls).toHaveLength(2);
        expect(receiptURLCalls.at(0)?.[0]).toBeInstanceOf(File);
        expect(receiptURLCalls.at(1)?.[0]).toBeInstanceOf(File);
        expect(mockCreateObjectURL.mock.invocationCallOrder.at(-1)).toBeLessThan(jest.mocked(setMoneyRequestReceipt).mock.invocationCallOrder.at(-1) ?? 0);
        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, '100'),
        );
    });

    it.each([false, true])('executes the real builder with the original null-category seed or empty fallback (absent=%s)', async (absent) => {
        // Given the money-request producer can return its original null category or no seed at all.
        const seed = createMock<NonNullable<ReturnType<typeof initMoneyRequest>>>({
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            category: null,
            currency: 'USD',
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            isFromGlobalCreate: true,
            isFromFloatingActionButton: false,
        });
        jest.mocked(initMoneyRequest).mockReturnValue(absent ? undefined : seed);
        jest.mocked(buildOptimisticTransactionAndCreateDraft).mockImplementation(realBuildOptimisticTransactionAndCreateDraft);
        const onyxSet = jest.spyOn(Onyx, 'set');
        const first = new File(['first real receipt'.repeat(20)], 'first.jpg', {type: 'image/jpeg'});
        const second = new File(['second real receipt'.repeat(20)], 'second.jpg', {type: 'image/jpeg'});
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report: receiptReport, shouldAddOrReplaceReceipt: false, transactionID: undefined}));
        await waitForBatchedUpdatesWithAct();
        try {
            // When the real hook forwards the seed into the actual TransactionEdit builder for a later receipt.
            act(() => result.current.onReceiptDropped(receiptDropEvent([first, second])));
            await waitFor(() => expect(setMoneyRequestReceipt).toHaveBeenCalledTimes(2));
            const builderCall = jest.mocked(buildOptimisticTransactionAndCreateDraft).mock.calls.at(0)?.[0];
            const builderResult = jest.mocked(buildOptimisticTransactionAndCreateDraft).mock.results.at(0);
            expect(builderCall).toBeDefined();
            expect(builderResult?.type).toBe('return');
            if (!builderCall || !builderResult || builderResult.type !== 'return') {
                throw new Error('Actual later-draft builder must return before checking receipt payloads');
            }
            const draft: ReturnType<typeof buildOptimisticTransactionAndCreateDraft> = builderResult.value;
            expect(draft).toBeDefined();
            expect(draft.transactionID).toEqual(expect.any(String));
            expect(draft.transactionID).not.toBe(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);

            expect(mockShowConfirmModal).not.toHaveBeenCalled();

            // Then seed identity/category survive and the generated draft/receipts retain exact fields and order.
            expect(builderCall.initialTransaction).toEqual(absent ? {} : seed);
            if (!absent) {
                expect(builderCall.initialTransaction).toBe(seed);
                expect(seed.category).toBeNull();
            }
            expect(draft).toEqual({
                amount: 0,
                created: format(new Date(), 'yyyy-MM-dd'),
                currency: absent ? undefined : 'USD',
                iouRequestType: absent ? undefined : CONST.IOU.REQUEST_TYPE.SCAN,
                reportID: '100',
                transactionID: draft.transactionID,
                isFromGlobalCreate: absent ? undefined : true,
                isFromFloatingActionButton: absent ? undefined : false,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            });
            expect(onyxSet).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draft.transactionID}`, draft);
            expect(jest.mocked(setMoneyRequestReceipt).mock.calls.map(([id]) => id)).toEqual([CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draft.transactionID]);
            expect(jest.mocked(setMoneyRequestParticipantsFromReport).mock.calls.map(([id]) => id)).toEqual([CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draft.transactionID]);
            expect(mockCreateObjectURL.mock.calls.slice(-2).map(([file]) => file)).toEqual([first, second]);
            expect(mockCreateObjectURL.mock.invocationCallOrder.at(-1)).toBeLessThan(jest.mocked(setMoneyRequestReceipt).mock.invocationCallOrder.at(-1) ?? 0);
            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, '100'),
            );
        } finally {
            onyxSet.mockRestore();
        }
    });

    it('executes the real builder for a legacy partial transaction without changing its input', () => {
        // Given existing callers supply a Partial<Transaction> with optional legacy fields.
        const initialTransaction = {currency: 'EUR', iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, category: 'legacy', isFromGlobalCreate: false} satisfies Partial<Transaction>;
        const original = {...initialTransaction};
        const onyxSet = jest.spyOn(Onyx, 'set');
        try {
            // When the real builder generates a later draft from the existing input contract.
            const draft = realBuildOptimisticTransactionAndCreateDraft({initialTransaction, reportID: 'legacy-report'});

            // Then its existing projection and Onyx write retain the intended transaction fields.
            expect(initialTransaction).toEqual(original);
            expect(draft.transactionID).toEqual(expect.any(String));
            expect(draft).toEqual({
                amount: 0,
                created: format(new Date(), 'yyyy-MM-dd'),
                currency: 'EUR',
                iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                reportID: 'legacy-report',
                transactionID: draft.transactionID,
                isFromGlobalCreate: false,
                isFromFloatingActionButton: undefined,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            });
            expect(onyxSet).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draft.transactionID}`, draft);
        } finally {
            onyxSet.mockRestore();
        }
    });

    it('rejects a real File one byte below the receipt minimum before running receipt actions', async () => {
        // Given the actual receipt validator requires the production minimum byte count.
        const tooSmall = new File(['x'.repeat(CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1)], 'small.jpg', {type: 'image/jpeg'});
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report: receiptReport, shouldAddOrReplaceReceipt: false, transactionID: undefined}));
        await waitForBatchedUpdatesWithAct();

        // When the real extraction and validator receive a File below that boundary.
        act(() => result.current.onReceiptDropped(receiptDropEvent([tooSmall])));
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        // Then the existing error modal explains the size failure before any receipt or draft action.
        expect(tooSmall.size).toBe(CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
        expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentTooSmall');
        expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.sizeNotMet');
        expect(replaceReceipt).not.toHaveBeenCalled();
        expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
        expect(setMoneyRequestParticipantsFromReport).not.toHaveBeenCalled();
        expect(initMoneyRequest).not.toHaveBeenCalled();
        expect(buildOptimisticTransactionAndCreateDraft).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does nothing for an empty replacement drop', async () => {
        // Given replacing an existing receipt requires at least one clipboard File.
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report: receiptReport, shouldAddOrReplaceReceipt: true, transactionID: 'existing'}));
        await waitForBatchedUpdatesWithAct();

        // When an empty transfer reaches the actual drop entrypoint.
        act(() => result.current.onReceiptDropped(receiptDropEvent([])));

        // Then no Blob consumer, receipt action or navigation runs.
        expect(mockCreateObjectURL).not.toHaveBeenCalled();
        expect(replaceReceipt).not.toHaveBeenCalled();
        expect(initMoneyRequest).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('routes restricted billing actions before creating clipboard URLs', async () => {
        // Given a paid workspace is beyond its billing grace period with an unpaid balance.
        const restrictedReport = createMock<Report>({reportID: '100', policyID: 'restricted'});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}restricted`, {id: 'restricted', type: CONST.POLICY.TYPE.CORPORATE, ownerAccountID: mockReceiptUser.accountID});
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, 1);
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
        });
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report: restrictedReport, shouldAddOrReplaceReceipt: false, transactionID: undefined}));
        await waitForBatchedUpdatesWithAct();

        // When the real billing predicate gates a receipt drop.
        act(() => result.current.onReceiptDropped(receiptDropEvent([new File(['receipt'], 'receipt.jpg', {type: 'image/jpeg'})])));

        // Then restrictions keep their route and run ahead of clipboard URL creation.
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute('restricted'));
        expect(mockCreateObjectURL).not.toHaveBeenCalled();
        expect(initMoneyRequest).not.toHaveBeenCalled();
    });
});
