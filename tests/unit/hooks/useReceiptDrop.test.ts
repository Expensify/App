/// <reference types="node" />
/** Exercises the actual receipt callback and its separate real shared-validation delivery. */
import {act, renderHook, waitFor} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useFilesValidation from '@hooks/useFilesValidation';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';

import type * as FileUtilsModule from '@libs/fileDownload/FileUtils';
import {getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';
import type ReportUtilsModule = require('@libs/ReportUtils');
import {isSelfDM} from '@libs/ReportUtils';
import type * as SnapshotPickedFileModule from '@libs/snapshotPickedFile';
import type * as SubscriptionUtilsModule from '@libs/SubscriptionUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type validateAttachmentFile from '@libs/validateAttachmentFile';

import Navigation from '@navigation/Navigation';

import useReceiptDrop from '@pages/inbox/report/ReportActionCompose/useReceiptDrop';

import type * as MoneyRequestModule from '@userActions/IOU/MoneyRequest';
import {initMoneyRequest, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import type * as ReceiptModule from '@userActions/IOU/Receipt';
import {replaceReceipt, setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import type * as TransactionEditModule from '@userActions/TransactionEdit';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import {readFileSync} from 'node:fs';
import {nextTick} from 'node:process';
import {promiseHooks} from 'node:v8';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useFilesValidation', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn());
jest.mock('@hooks/useDelegateAccountID', () => jest.fn());
jest.mock('@hooks/usePermissions', () => jest.fn());
jest.mock('@hooks/usePersonalPolicy', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@components/FullScreenLoaderContext', () => ({useFullScreenLoaderActions: () => ({setIsLoaderVisible: jest.fn()})}));
jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal').default);
jest.mock('@components/Modal/Global/ModalContext', () => jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal').createMockModalContextModule());
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/SubscriptionUtils', () => ({...jest.requireActual<typeof SubscriptionUtilsModule>('@libs/SubscriptionUtils'), shouldRestrictUserBillableActions: jest.fn()}));
jest.mock('@libs/ReportUtils', () => ({...jest.requireActual<typeof ReportUtilsModule>('@libs/ReportUtils'), isSelfDM: jest.fn()}));
jest.mock('@libs/fileDownload/FileUtils', () => ({...jest.requireActual<typeof FileUtilsModule>('@libs/fileDownload/FileUtils'), getFilesFromClipboardEvent: jest.fn()}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<typeof MoneyRequestModule>('@userActions/IOU/MoneyRequest'),
    initMoneyRequest: jest.fn(),
    setMoneyRequestParticipantsFromReport: jest.fn(),
}));
jest.mock('@userActions/IOU/Receipt', () => ({
    ...jest.requireActual<typeof ReceiptModule>('@userActions/IOU/Receipt'),
    replaceReceipt: jest.fn(),
    setMoneyRequestReceipt: jest.fn(),
}));
jest.mock('@userActions/TransactionEdit', () => ({
    ...jest.requireActual<typeof TransactionEditModule>('@userActions/TransactionEdit'),
    buildOptimisticTransactionAndCreateDraft: jest.fn(),
}));

const registeredFileUtils = jest.requireMock<typeof FileUtilsModule>('@libs/fileDownload/FileUtils');

const realFilesValidation = jest.requireActual<{default: typeof useFilesValidation}>('@hooks/useFilesValidation').default;
const realInitMoneyRequest = jest.requireActual<typeof MoneyRequestModule>('@userActions/IOU/MoneyRequest').initMoneyRequest;
const report = createMock<Report>({reportID: '100', type: CONST.REPORT.TYPE.CHAT});
const metadata: FileObject = {uri: 'file://guard.text', name: 'guard.text', type: 'text/plain', size: 240};
let receiptCallback: Parameters<typeof useFilesValidation>[0] | undefined;
const validateFiles = jest.fn<ReturnType<ReturnType<typeof useFilesValidation>['validateFiles']>, Parameters<ReturnType<typeof useFilesValidation>['validateFiles']>>();

/** Captures only the real no-PDF validation root that invokes the receipt callback. */
function observeReceiptValidationRejection(message: string) {
    const receiptSourcePath = require.resolve('@pages/inbox/report/ReportActionCompose/useReceiptDrop');
    const validationSourcePath = require.resolve('@hooks/useFilesValidation');
    const validationSource = readFileSync(validationSourcePath, 'utf8');
    const rootDeclaration = '    const validateAndResizeFiles = async ';
    const rootOffset = validationSource.indexOf(rootDeclaration);
    if (rootOffset < 0 || validationSource.indexOf(rootDeclaration, rootOffset + 1) !== -1) {
        throw new Error('Expected one real attachment validation root');
    }
    const rootLine = validationSource.slice(0, rootOffset).split('\n').length;
    const receiptSource = readFileSync(receiptSourcePath, 'utf8');
    const callbackStart = receiptSource.indexOf('    const onFilesValidated = ');
    const callbackEnd = receiptSource.indexOf('    const {validateFiles, PDFValidationComponent} = ', callbackStart);
    if (callbackStart < 0 || callbackEnd < callbackStart) {
        throw new Error('Expected the original receipt callback source');
    }
    const literalThrow = `throw new TypeError('${message}');`;
    const throwOffset = receiptSource.indexOf(literalThrow, callbackStart);
    if (throwOffset < callbackStart || throwOffset >= callbackEnd || receiptSource.indexOf(literalThrow, throwOffset + 1) !== -1) {
        throw new Error('Expected one selected receipt TypeError throw inside the original callback');
    }
    const newTypeErrorOffset = throwOffset + 'throw '.length;
    const throwLine = receiptSource.slice(0, newTypeErrorOffset).split('\n').length;
    const throwColumn = newTypeErrorOffset - receiptSource.lastIndexOf('\n', newTypeErrorOffset);
    let rejectObserved: (reason: unknown) => void = () => {};
    let resolveObserved: (value: unknown) => void = () => {};
    const observed = new Promise<unknown>((resolve, reject) => {
        resolveObserved = resolve;
        rejectObserved = reject;
    });
    const assertion = observed.then(
        () => {
            throw new Error('Expected the real receipt validation root to reject');
        },
        (reason: unknown) => {
            expect(reason).toBeInstanceOf(TypeError);
            if (!(reason instanceof TypeError)) {
                throw new Error('Expected the receipt guard TypeError');
            }
            expect(reason.name).toBe('TypeError');
            expect(reason.message).toBe(message);
            const frames = reason.stack?.split('\n').slice(1);
            if (!frames?.length) {
                throw new Error('Expected receipt rejection stack frames');
            }
            const firstThrowFrame = frames.at(0);
            if (!firstThrowFrame) {
                throw new Error('Expected the first receipt throw frame');
            }
            expect(firstThrowFrame.trim()).toMatch(/^at /);
            expect(firstThrowFrame.trim().replace(/\)$/, '')).toMatch(new RegExp(`(?:^at |\\()${receiptSourcePath.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}:${throwLine}:${throwColumn}$`));
            expect(frames.some((frame) => frame.includes(`${validationSourcePath}:`) && /\bhandleNext\b/.test(frame))).toBe(true);
        },
    );
    // Handle only this owned assertion immediately. Tests still await its original rejection.
    const settledAssertion = Promise.allSettled([assertion]);
    let creationFrame: string | undefined;
    let rootPromise: Promise<unknown> | undefined;
    let captureCount = 0;
    const stop = promiseHooks.onInit((promise, parent) => {
        if (parent !== undefined) {
            return;
        }
        const frame = new Error().stack
            ?.split('\n')
            .slice(1)
            .find((line) => line.includes(`${validationSourcePath}:${rootLine}:`));
        if (!frame) {
            return;
        }
        creationFrame = frame;
        rootPromise = promise;
        captureCount += 1;
        stop();
        nextTick(() => {
            promise.then(resolveObserved, rejectObserved);
        });
    });
    const cleanup = async () => {
        stop();
        if (!rootPromise) {
            rejectObserved(new Error('Expected capture of the actual validation root'));
        }
        await settledAssertion;
    };
    return {assertion, stop, cleanup, getCreationFrame: () => creationFrame, getCaptureCount: () => captureCount, getRootPromise: () => rootPromise};
}

describe('receipt drop callback boundaries', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        receiptCallback = undefined;
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue(createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({accountID: 1}));
        jest.mocked(useDelegateAccountID).mockReturnValue(undefined);
        jest.mocked(usePermissions).mockReturnValue(createMock<ReturnType<typeof usePermissions>>({isBetaEnabledOrUnknown: () => false}));
        jest.mocked(usePersonalPolicy).mockReturnValue(undefined);
        jest.mocked(shouldRestrictUserBillableActions).mockReturnValue(false);
        jest.mocked(isSelfDM).mockReturnValue(false);
        jest.mocked(initMoneyRequest).mockImplementation(realInitMoneyRequest);
        jest.mocked(buildOptimisticTransactionAndCreateDraft).mockReturnValue(createMock<Transaction>({transactionID: 'later-id'}));
        jest.mocked(useFilesValidation).mockImplementation((callback) => {
            receiptCallback = callback;
            return {validateFiles, PDFValidationComponent: undefined};
        });
        await waitForBatchedUpdatesWithAct();
    });

    it.each([metadata, new Blob(['byte data'], {type: 'text/plain'})])('rejects unsupported replacement category %j before callback effects', (file) => {
        // Given metadata and a bare Blob are defensive callback values rather than ordinary FileList replacement producers.
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const url = jest.spyOn(URL, 'createObjectURL');
        try {
            // When the real callback inspects only its first replacement value.
            const invoke = () => callback([file], []);
            expect(invoke).toThrow(TypeError);
            expect(invoke).toThrow('Receipt replacement requires a File.');
            // Then replacement and scan effects remain absent before the explicit guard.
            expect(url).not.toHaveBeenCalled();
            expect(replaceReceipt).not.toHaveBeenCalled();
            expect(initMoneyRequest).not.toHaveBeenCalled();
            expect(buildOptimisticTransactionAndCreateDraft).not.toHaveBeenCalled();
            expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
            expect(setMoneyRequestParticipantsFromReport).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        } finally {
            url.mockRestore();
        }
    });

    it.each([null, undefined])('rejects malformed first replacement %s at the exact invalid element', (file) => {
        // Given K-INVALID-001 deliberately injects a value outside FileObject into this callback.
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        // When the precise malformed element reaches the real guard.
        // @ts-expect-error -- Null and undefined are deliberately malformed FileObject callback elements.
        const invoke = () => callback([file], []);
        // Then delivery is a synchronous local TypeError without replacement or scan effects.
        expect(invoke).toThrow(TypeError);
        expect(invoke).toThrow('Receipt replacement requires a File.');
        expect(replaceReceipt).not.toHaveBeenCalled();
        expect(initMoneyRequest).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([0, 1, 2])('rejects the whole scan before all effects when metadata occurs at %s', (invalidIndex) => {
        // Given a valid byte prefix must never create a draft before a later unsupported value is detected.
        const first = new File(['first'], 'first.text', {type: 'text/plain'});
        const last = new File(['last'], 'last.text', {type: 'text/plain'});
        const files: FileObject[] = [first, last, first];
        files[invalidIndex] = metadata;
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: undefined, shouldAddOrReplaceReceipt: false}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const url = jest.spyOn(URL, 'createObjectURL');
        try {
            // When the actual callback checks the complete scan batch.
            const invoke = () => callback(files, []);
            expect(invoke).toThrow(TypeError);
            expect(invoke).toThrow('Receipt scan requires Blob-backed files.');
            // Then even a valid prefix leaves no callback URL, draft, receipt, participant or navigation writes.
            expect(url).not.toHaveBeenCalled();
            expect(initMoneyRequest).not.toHaveBeenCalled();
            expect(buildOptimisticTransactionAndCreateDraft).not.toHaveBeenCalled();
            expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
            expect(setMoneyRequestParticipantsFromReport).not.toHaveBeenCalled();
            expect(replaceReceipt).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        } finally {
            url.mockRestore();
        }
    });

    it('replaces only the first real File even when later metadata is unsupported', () => {
        // Given replacement has always selected only the first file.
        const file = new File(['first'], 'first.text', {type: 'text/plain'});
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const url = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:replacement');
        try {
            // When the actual callback receives a valid first File and a later unsupported item.
            callback([file, metadata], []);
            // Then the identical first File reaches replacement without scan effects.
            expect(url.mock.calls).toEqual([[file]]);
            expect(replaceReceipt).toHaveBeenCalledTimes(1);
            const selected = jest.mocked(replaceReceipt).mock.calls.at(0);
            expect(selected).toBeDefined();
            if (!selected) {
                throw new Error('Expected the replacement call');
            }
            expect(selected[0]).toEqual({
                isVendorMatchingBetaEnabled: false,
                transaction: undefined,
                file,
                source: 'blob:replacement',
                transactionPolicy: undefined,
                transactionPolicyCategories: undefined,
                transactionPolicyTagList: undefined,
                transactionViolations: undefined,
                transactionReport: undefined,
                delegateAccountID: undefined,
                currentUserPersonalDetails: createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({accountID: 1}),
                transactionThreadReport: undefined,
            });
            expect(selected[0].file).toBe(file);
            expect(initMoneyRequest).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        } finally {
            url.mockRestore();
        }
    });

    it.each([
        {parentTransactionID: 'tx', hasLoadedThread: false, expectedThread: 'current'},
        {parentTransactionID: 'other-tx', hasLoadedThread: false, expectedThread: 'none'},
        {parentTransactionID: undefined, hasLoadedThread: false, expectedThread: 'none'},
        {parentTransactionID: 'tx', hasLoadedThread: true, expectedThread: 'loaded'},
    ])('resolves replacement thread for parent=$parentTransactionID and loaded=$hasLoadedThread', async ({parentTransactionID, hasLoadedThread, expectedThread}) => {
        // Given IOU actions link their original transaction to a child thread, including a thread opened before its lookup is loaded.
        const parentActionID = 'parent-action';
        const expenseActionID = 'expense-action';
        const transactionKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}tx` = `${ONYXKEYS.COLLECTION.TRANSACTION}tx`;
        const transactionReportKey: `${typeof ONYXKEYS.COLLECTION.REPORT}expense-report` = `${ONYXKEYS.COLLECTION.REPORT}expense-report`;
        const currentReportKey: `${typeof ONYXKEYS.COLLECTION.REPORT}100` = `${ONYXKEYS.COLLECTION.REPORT}100`;
        const expenseReportActionsKey: `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}expense-report` = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}expense-report`;
        const loadedThreadKey: `${typeof ONYXKEYS.COLLECTION.REPORT}loaded-thread` = `${ONYXKEYS.COLLECTION.REPORT}loaded-thread`;
        const transaction = createMock<Transaction>({transactionID: 'tx', reportID: 'expense-report'});
        const transactionReport = createMock<Report>({reportID: 'expense-report', type: CONST.REPORT.TYPE.IOU});
        const currentReport = createMock<Report>({reportID: '100', parentReportID: 'parent-report', parentReportActionID: parentActionID, type: CONST.REPORT.TYPE.CHAT});
        const loadedThread = createMock<Report>({reportID: 'loaded-thread', type: CONST.REPORT.TYPE.CHAT});
        await Onyx.multiSet({
            [transactionKey]: transaction,
            [transactionReportKey]: transactionReport,
            [currentReportKey]: currentReport,
        });
        if (parentTransactionID !== undefined) {
            const parentAction = createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>({
                reportActionID: parentActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {IOUTransactionID: parentTransactionID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}parent-report`, {[parentActionID]: parentAction});
        }
        if (hasLoadedThread) {
            const expenseAction = createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>({
                reportActionID: expenseActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: loadedThread.reportID,
                originalMessage: {IOUTransactionID: transaction.transactionID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
            });
            await Onyx.multiSet({
                [expenseReportActionsKey]: {[expenseActionID]: expenseAction},
                [loadedThreadKey]: loadedThread,
            });
        }
        renderHook(() => useReceiptDrop({reportID: '100', report: currentReport, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
        await waitForBatchedUpdatesWithAct();
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const file = new File(['receipt'], 'receipt.text', {type: 'text/plain'});
        const url = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:thread-replacement');
        try {
            // When replacement runs through the real parent hook and thread resolver after Onyx subscribers finish loading.
            callback([file], []);
            // Then the selected replacement keeps the loaded thread first and otherwise falls back only for a matching IOU parent.
            expect(replaceReceipt).toHaveBeenCalledTimes(1);
            const selected = jest.mocked(replaceReceipt).mock.calls.at(0);
            expect(selected).toBeDefined();
            if (!selected) {
                throw new Error('Expected the replacement call');
            }
            let expectedReport: Report | undefined;
            if (expectedThread === 'loaded') {
                expectedReport = loadedThread;
            } else if (expectedThread === 'current') {
                expectedReport = currentReport;
            }
            expect(selected[0]).toEqual({
                isVendorMatchingBetaEnabled: false,
                transaction,
                file,
                source: 'blob:thread-replacement',
                transactionPolicy: undefined,
                transactionPolicyCategories: undefined,
                transactionPolicyTagList: undefined,
                transactionViolations: undefined,
                transactionReport,
                delegateAccountID: undefined,
                currentUserPersonalDetails: createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({accountID: 1}),
                transactionThreadReport: expectedReport,
            });
            if (expectedThread === 'current') {
                expect(selected[0].transactionThreadReport).toBe(currentReport);
            }
            expect(selected[0].file).toBe(file);
            expect(url.mock.calls).toEqual([[file]]);
            expect(initMoneyRequest).not.toHaveBeenCalled();
            expect(buildOptimisticTransactionAndCreateDraft).not.toHaveBeenCalled();
            expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
            expect(setMoneyRequestParticipantsFromReport).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        } finally {
            url.mockRestore();
        }
    });

    it.each([true, false])('keeps empty callback return for replacement=%s', (shouldAddOrReplaceReceipt) => {
        // Given empty delivery remains an existing no-op before either guard.
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        // When the real callback receives an empty array.
        expect(callback([], [])).toBeUndefined();
        // Then no callback mutation or navigation is introduced.
        expect(initMoneyRequest).not.toHaveBeenCalled();
        expect(replaceReceipt).not.toHaveBeenCalled();
        expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([
        {selfDM: false, blobSecond: false},
        {selfDM: true, blobSecond: false},
        {selfDM: false, blobSecond: true},
        {selfDM: true, blobSecond: true},
    ])('scans original byte order with selfDM=$selfDM and blob=$blobSecond', async ({selfDM, blobSecond}) => {
        // Given the real SCAN initializer returns an optimistic draft and bare Blob scan input owns bytes.
        jest.mocked(isSelfDM).mockReturnValue(selfDM);
        const first = new File(['first'], 'first.text', {type: 'text/plain'});
        const second = blobSecond ? Object.assign(new Blob(['second'], {type: 'text/plain'}), {name: '', uri: 'blob:original'}) : new File(['second'], 'second.text', {type: 'text/plain'});
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: undefined, shouldAddOrReplaceReceipt: false}));
        await waitForBatchedUpdatesWithAct();
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const url = jest.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
        try {
            // When the real callback processes the validated byte category.
            callback([first, second], []);
            await waitForBatchedUpdatesWithAct();
            // Then IDs, byte identity, names, participant ordering and one final navigation remain unchanged.
            expect(url.mock.calls).toEqual([[first], [second]]);
            expect(initMoneyRequest).toHaveBeenCalledTimes(1);
            const initialResult = jest.mocked(initMoneyRequest).mock.results.at(0);
            if (!initialResult || initialResult.type !== 'return') {
                throw new Error('Expected the real receipt initializer return');
            }
            const initial = initialResult.value;
            if (!initial) {
                throw new Error('Expected the initial SCAN transaction');
            }
            expect(initial.transactionID).toBe(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            expect(initial.category).toBeNull();
            expect(initMoneyRequest).toHaveBeenCalledWith({
                reportID: '100',
                personalPolicy: undefined,
                newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                report,
                parentReport: undefined,
                currentDate: undefined,
                hasOnlyPersonalPolicies: true,
                draftTransactionIDs: [],
            });
            expect(buildOptimisticTransactionAndCreateDraft).toHaveBeenCalledWith({initialTransaction: {...initial, category: undefined}, reportID: '100'});
            expect(jest.mocked(setMoneyRequestReceipt).mock.calls).toEqual([
                [CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 'blob:first', 'first.text', true, 'text/plain'],
                ['later-id', 'blob:second', blobSecond ? '' : 'second.text', true, 'text/plain'],
            ]);
            expect(jest.mocked(setMoneyRequestParticipantsFromReport).mock.calls).toEqual([
                [CONST.IOU.OPTIMISTIC_TRANSACTION_ID, report, 1],
                ['later-id', report, 1],
            ]);
            const firstReceiptOrder = jest.mocked(setMoneyRequestReceipt).mock.invocationCallOrder.at(0);
            const firstParticipantOrder = jest.mocked(setMoneyRequestParticipantsFromReport).mock.invocationCallOrder.at(0);
            const secondReceiptOrder = jest.mocked(setMoneyRequestReceipt).mock.invocationCallOrder.at(1);
            if (firstReceiptOrder === undefined || firstParticipantOrder === undefined || secondReceiptOrder === undefined) {
                throw new Error('Expected receipt and participant call-order evidence');
            }
            expect(firstReceiptOrder).toBeLessThan(firstParticipantOrder);
            expect(firstParticipantOrder).toBeLessThan(secondReceiptOrder);
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, selfDM ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, '100'),
            );
        } finally {
            url.mockRestore();
        }
    });

    it('preserves the defensive absent-initializer optimistic fallback and later empty builder input', () => {
        // Given K-INVALID-001 injects void below the subject even though this actual SCAN call produces a draft.
        jest.mocked(initMoneyRequest).mockReturnValue(undefined);
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: undefined, shouldAddOrReplaceReceipt: false}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const url = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:scan');
        try {
            // When valid bytes reach the actual callback with only the initializer result substituted.
            callback([new File(['a'], 'first.text'), new File(['b'], 'second.text')], []);
            // Then the first fallback and later builder remain active rather than returning early.
            expect(jest.mocked(setMoneyRequestReceipt).mock.calls.at(0)?.[0]).toBe(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            expect(buildOptimisticTransactionAndCreateDraft).toHaveBeenCalledWith({initialTransaction: {}, reportID: '100'});
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        } finally {
            url.mockRestore();
        }
    });

    it('validates only the first drop File for replacement and keeps all original items', () => {
        // Given the normal browser drop producer supplies ordered Files and DataTransfer items.
        const first = new File(['a'], 'first.text');
        const second = new File(['b'], 'second.text');
        jest.mocked(getFilesFromClipboardEvent).mockReturnValue([first, second]);
        const items = [createMock<DataTransferItem>({kind: 'file'}), createMock<DataTransferItem>({kind: 'file'})];
        const event = createMock<DragEvent>({dataTransfer: {items}});
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
        // When the actual public drop handler runs its existing first-only branch.
        result.current.onReceiptDropped(event);
        // Then validation receives the original first File and unchanged item list.
        expect(validateFiles).toHaveBeenCalledWith([first], items);
        expect(initMoneyRequest).not.toHaveBeenCalled();
    });

    it('rejects a null scan element before any valid-prefix callback effect', () => {
        // Given null is a surgical malformed callback value, unlike supported FileObject metadata.
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: undefined, shouldAddOrReplaceReceipt: false}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const first = new File(['first'], 'first.text');
        const url = jest.spyOn(URL, 'createObjectURL');
        try {
            // When only the exact invalid element crosses the normally typed callback boundary.
            // @ts-expect-error -- Null deliberately violates only the scan array element category.
            const invoke = () => callback([first, null], []);
            expect(invoke).toThrow(TypeError);
            expect(invoke).toThrow('Receipt scan requires Blob-backed files.');
            // Then complete proof prevents every callback effect even with a valid prefix.
            expect(url).not.toHaveBeenCalled();
            expect(initMoneyRequest).not.toHaveBeenCalled();
            expect(buildOptimisticTransactionAndCreateDraft).not.toHaveBeenCalled();
            expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
            expect(setMoneyRequestParticipantsFromReport).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        } finally {
            url.mockRestore();
        }
    });

    it('ignores a later malformed replacement entry after the first real File', () => {
        // Given replacement reads only index zero, including for a deliberately malformed later entry.
        renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
        const callback = receiptCallback;
        expect(callback).toBeDefined();
        if (!callback) {
            throw new Error('Expected the actual receipt callback');
        }
        const first = new File(['first'], 'first.text');
        const url = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:first');
        try {
            // When the exact invalid later element stays outside replacement's selected first-value proof.
            // @ts-expect-error -- Undefined is intentionally malformed only at the unused later element.
            callback([first, undefined], []);
            // Then the unchanged first-only behavior remains successful.
            expect(url.mock.calls).toEqual([[first]]);
            expect(replaceReceipt).toHaveBeenCalledTimes(1);
            expect(initMoneyRequest).not.toHaveBeenCalled();
            expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        } finally {
            url.mockRestore();
        }
    });

    it('checks the subscription restriction before clipboard extraction or validation', async () => {
        // Given a report policy can block this billable operation at the original public drop boundary.
        const policy = createMock<Policy>({id: 'policy-1'});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}policy-1`, policy);
        });
        jest.mocked(shouldRestrictUserBillableActions).mockReturnValue(true);
        const {result} = renderHook(() => useReceiptDrop({reportID: '100', report: {...report, policyID: 'policy-1'}, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
        await waitForBatchedUpdatesWithAct();
        // When the real drop handler sees the active restriction.
        result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}));
        // Then the existing restricted route is selected without any extraction or callback effects.
        expect(shouldRestrictUserBillableActions).toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute('policy-1'));
        expect(getFilesFromClipboardEvent).not.toHaveBeenCalled();
        expect(validateFiles).not.toHaveBeenCalled();
        expect(initMoneyRequest).not.toHaveBeenCalled();
        expect(replaceReceipt).not.toHaveBeenCalled();
    });

    describe('real no-PDF validation delivery', () => {
        beforeEach(() => {
            jest.mocked(useFilesValidation).mockImplementation(realFilesValidation);
        });

        it('delivers unsupported replacement metadata as the actual outer async rejection', async () => {
            // Given metadata is injected below clipboard extraction, without claiming FileList byte provenance.
            // @ts-expect-error Deliberately inject URI metadata outside the clipboard File producer to exercise real validation delivery.
            jest.mocked(getFilesFromClipboardEvent).mockReturnValue([metadata]);
            const validator = jest.spyOn(jest.requireActual<{default: typeof validateAttachmentFile}>('@libs/validateAttachmentFile'), 'default');
            const {result} = renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
            const url = jest.spyOn(URL, 'createObjectURL');
            const observation = observeReceiptValidationRejection('Receipt replacement requires a File.');
            try {
                // When the real hook and validator deliver the accepted metadata to the actual receipt callback.
                act(() => {
                    expect(result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}))).toBeUndefined();
                });
                await act(async () => {
                    await observation.assertion;
                });
                // Then callback rejection skips the following reset and no receipt callback effects occur.
                expect(observation.getCreationFrame()).toBeDefined();
                expect(observation.getCaptureCount()).toBe(1);
                expect(observation.getRootPromise()).toBeInstanceOf(Promise);
                expect(url).not.toHaveBeenCalled();
                expect(replaceReceipt).not.toHaveBeenCalled();
                expect(initMoneyRequest).not.toHaveBeenCalled();
                expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
                expect(setMoneyRequestParticipantsFromReport).not.toHaveBeenCalled();
                expect(Navigation.navigate).not.toHaveBeenCalled();
                expect(buildOptimisticTransactionAndCreateDraft).not.toHaveBeenCalled();
                expect(validator).toHaveBeenCalledTimes(1);
                expect(validator).toHaveBeenCalledWith(metadata, undefined, true);
                const count = jest.mocked(getFilesFromClipboardEvent).mock.calls.length;
                act(() => {
                    result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}));
                });
                expect(getFilesFromClipboardEvent).toHaveBeenCalledTimes(count + 1);
                expect(validator).toHaveBeenCalledTimes(1);
                expect(url).not.toHaveBeenCalled();
            } finally {
                observation.stop();
                await observation.cleanup();
                url.mockRestore();
                validator.mockRestore();
            }
        });

        it('rejects a real validated File then metadata batch before any receipt callback effect', async () => {
            // Given actual validator normalization is the only substituted byte dependency below the shared hook.
            const first = new File(['a'.repeat(240)], 'first.text', {type: 'text/plain'});
            first.uri = 'blob:validation-first';
            const input: FileObject = {uri: 'blob:validation-first', name: 'first.text', type: 'text/plain', size: 240};
            const second: FileObject = {...metadata, uri: 'file://normalization-second'};
            // @ts-expect-error Deliberately inject URI metadata outside the clipboard File producer to exercise real validation delivery.
            jest.mocked(getFilesFromClipboardEvent).mockReturnValue([input, second]);
            const normalize = jest.spyOn(registeredFileUtils, 'normalizeFileObject').mockResolvedValueOnce(first);
            const snapshot = jest.spyOn(jest.requireActual<{default: typeof SnapshotPickedFileModule.default}>('@libs/snapshotPickedFile'), 'default').mockResolvedValue(first);
            const url = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:validation-first');
            const {result} = renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: undefined, shouldAddOrReplaceReceipt: false}));
            const validator = jest.spyOn(jest.requireActual<{default: typeof validateAttachmentFile}>('@libs/validateAttachmentFile'), 'default');
            const observation = observeReceiptValidationRejection('Receipt scan requires Blob-backed files.');
            try {
                // When real validation accepts both shapes and invokes the actual complete-batch guard.
                act(() => {
                    expect(result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}))).toBeUndefined();
                });
                await act(async () => {
                    await observation.assertion;
                });
                // Then the only URL belongs to upstream validation and no callback prefix can create a draft.
                expect(observation.getCreationFrame()).toBeDefined();
                expect(observation.getCaptureCount()).toBe(1);
                expect(observation.getRootPromise()).toBeInstanceOf(Promise);
                expect(normalize.mock.calls).toEqual([[input], [second]]);
                expect(validator.mock.calls).toEqual([
                    [input, undefined, true],
                    [second, undefined, true],
                ]);
                const firstReturn = validator.mock.results.at(0);
                const secondReturn = validator.mock.results.at(1);
                if (!firstReturn || firstReturn.type !== 'return' || !secondReturn || secondReturn.type !== 'return') {
                    throw new Error('Expected both real validator Promise returns');
                }
                const firstResult = await firstReturn.value;
                const secondResult = await secondReturn.value;
                expect(firstResult.isValid).toBe(true);
                expect(secondResult.isValid).toBe(true);
                if (!firstResult.isValid || !secondResult.isValid) {
                    throw new Error('Expected real valid attachment results');
                }
                expect(firstResult.file).toBe(first);
                expect(secondResult.file).toBe(second);
                act(() => {
                    result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}));
                });
                expect(validator).toHaveBeenCalledTimes(2);
                expect(url.mock.calls).toEqual([[first]]);
                expect(initMoneyRequest).not.toHaveBeenCalled();
                expect(buildOptimisticTransactionAndCreateDraft).not.toHaveBeenCalled();
                expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
                expect(setMoneyRequestParticipantsFromReport).not.toHaveBeenCalled();
                expect(Navigation.navigate).not.toHaveBeenCalled();
            } finally {
                observation.stop();
                await observation.cleanup();
                url.mockRestore();
                snapshot.mockRestore();
                normalize.mockRestore();
                validator.mockRestore();
            }
        });

        it('delivers two actual validated Files in original order and resets for a later scan', async () => {
            // Given only the byte-normalization and snapshot dependencies are substituted below the real validator.
            const first = new File(['a'.repeat(240)], 'first.text', {type: 'text/plain'});
            const second = new File(['b'.repeat(240)], 'second.text', {type: 'text/plain'});
            first.uri = 'blob:valid-first';
            second.uri = 'blob:valid-second';
            const firstInput: FileObject = {uri: first.uri, name: first.name, type: first.type, size: first.size};
            const secondInput: FileObject = {uri: second.uri, name: second.name, type: second.type, size: second.size};
            // @ts-expect-error Deliberately inject URI metadata outside the clipboard File producer to exercise real validation delivery.
            jest.mocked(getFilesFromClipboardEvent).mockReturnValue([firstInput, secondInput]);
            const normalize = jest
                .spyOn(registeredFileUtils, 'normalizeFileObject')
                .mockResolvedValueOnce(first)
                .mockResolvedValueOnce(second)
                .mockResolvedValueOnce(first)
                .mockResolvedValueOnce(second);
            const snapshot = jest
                .spyOn(jest.requireActual<{default: typeof SnapshotPickedFileModule.default}>('@libs/snapshotPickedFile'), 'default')
                .mockImplementation(async (file) => file);
            const validator = jest.spyOn(jest.requireActual<{default: typeof validateAttachmentFile}>('@libs/validateAttachmentFile'), 'default');
            const url = jest
                .spyOn(URL, 'createObjectURL')
                .mockReturnValueOnce('blob:valid-first')
                .mockReturnValueOnce('blob:valid-second')
                .mockReturnValueOnce('blob:receipt-first')
                .mockReturnValueOnce('blob:receipt-second');
            const {result} = renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: undefined, shouldAddOrReplaceReceipt: false}));
            try {
                // When the real shared hook validates both Files and invokes the original successful scan callback.
                act(() => {
                    expect(result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}))).toBeUndefined();
                });
                await waitFor(() => expect(Navigation.navigate).toHaveBeenCalledTimes(1));
                // Then upstream and callback URL identities, IDs and receipt/participant order remain distinct and exact.
                expect(validator.mock.calls).toEqual([
                    [firstInput, undefined, true],
                    [secondInput, undefined, true],
                ]);
                expect(url.mock.calls).toEqual([[first], [second], [first], [second]]);
                expect(jest.mocked(setMoneyRequestReceipt).mock.calls).toEqual([
                    [CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 'blob:receipt-first', 'first.text', true, 'text/plain'],
                    ['later-id', 'blob:receipt-second', 'second.text', true, 'text/plain'],
                ]);
                expect(jest.mocked(setMoneyRequestParticipantsFromReport).mock.calls).toEqual([
                    [CONST.IOU.OPTIMISTIC_TRANSACTION_ID, report, 1],
                    ['later-id', report, 1],
                ]);
                const firstReceiptOrder = jest.mocked(setMoneyRequestReceipt).mock.invocationCallOrder.at(0);
                const firstParticipantOrder = jest.mocked(setMoneyRequestParticipantsFromReport).mock.invocationCallOrder.at(0);
                const secondReceiptOrder = jest.mocked(setMoneyRequestReceipt).mock.invocationCallOrder.at(1);
                if (firstReceiptOrder === undefined || firstParticipantOrder === undefined || secondReceiptOrder === undefined) {
                    throw new Error('Expected receipt and participant call-order evidence');
                }
                expect(firstReceiptOrder).toBeLessThan(firstParticipantOrder);
                expect(firstParticipantOrder).toBeLessThan(secondReceiptOrder);
                expect(Navigation.navigate).toHaveBeenCalledWith(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, '100'),
                );
                await waitForBatchedUpdatesWithAct();
                url.mockReturnValue('blob:next');
                act(() => {
                    result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}));
                });
                await waitFor(() => expect(Navigation.navigate).toHaveBeenCalledTimes(2));
                expect(validator).toHaveBeenCalledTimes(4);
            } finally {
                url.mockRestore();
                snapshot.mockRestore();
                normalize.mockRestore();
                validator.mockRestore();
            }
        });

        it('refuses an unrelated validation error as receipt guard evidence', async () => {
            // Given normalization can fail before the real receipt callback without proving its guard ran.
            // @ts-expect-error Deliberately inject URI metadata outside the clipboard File producer to exercise real validation delivery.
            jest.mocked(getFilesFromClipboardEvent).mockReturnValue([metadata]);
            const unrelated = new Error('Unrelated receipt normalization failure');
            const normalize = jest.spyOn(registeredFileUtils, 'normalizeFileObject').mockRejectedValueOnce(unrelated);
            const {result} = renderHook(() => useReceiptDrop({reportID: '100', report, transactionID: 'tx', shouldAddOrReplaceReceipt: true}));
            const observation = observeReceiptValidationRejection('Receipt replacement requires a File.');
            const matcherFailure = expect(observation.assertion).rejects.toThrow();
            try {
                // When that Error rejects the actual outer native Promise.
                act(() => {
                    result.current.onReceiptDropped(createMock<DragEvent>({dataTransfer: {items: []}}));
                });
                await act(async () => {
                    await matcherFailure;
                });
                // Then the exact category/message/guard-origin matcher fails instead of accepting arbitrary failure.
                expect(observation.getCaptureCount()).toBe(1);
                expect(observation.getRootPromise()).toBeInstanceOf(Promise);
                expect(normalize).toHaveBeenCalledWith(metadata);
                const normalization = normalize.mock.results.at(0);
                if (!normalization || normalization.type !== 'return') {
                    throw new Error('Expected the actual receipt normalization Promise');
                }
                await expect(normalization.value).rejects.toBe(unrelated);
                expect(replaceReceipt).not.toHaveBeenCalled();
                expect(initMoneyRequest).not.toHaveBeenCalled();
                expect(Navigation.navigate).not.toHaveBeenCalled();
            } finally {
                observation.stop();
                await observation.cleanup();
                normalize.mockRestore();
            }
        });
    });
});
