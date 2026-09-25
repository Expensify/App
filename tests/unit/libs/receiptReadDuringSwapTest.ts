import {checkIfLocalFileIsAccessible, navigateToStartStepIfScanFileCannotBeRead} from '@libs/actions/IOU/Receipt';
import type ValidateReceiptFileNative from '@libs/fileDownload/validateReceiptFile/index.native';
import fileURIToPath from '@libs/fileURIToPath';
import ReceiptStorage from '@libs/ReceiptStorage';

import CONST from '@src/CONST';

const FOLDER = '/var/mobile/Containers/Data/Application/AAAA-1111/Documents/Receipts-Upload';
const RECEIPT = 'CAM-1.jpg';
const RECEIPT_PATH = `${FOLDER}/${RECEIPT}`;
const RECEIPT_URI = `file://${RECEIPT_PATH}`;

const mockExisting = new Set<string>();
const mockDirectories = new Set<string>();
const mockIsOnDisk = (path?: string) => mockExisting.has(fileURIToPath(path ?? ''));

let mockHoldRead: Promise<void> | undefined;
const mockStat = (path?: string) => (mockHoldRead ? mockHoldRead.then(() => mockIsOnDisk(path)) : Promise.resolve(mockIsOnDisk(path)));

jest.mock('react-native-fs', () => ({
    exists: (path: string) => Promise.resolve(mockExisting.has(path) || mockDirectories.has(path)),
    moveFile: jest.fn(),
    mkdir: () => Promise.resolve(),
    unlink: (path: string) => {
        mockExisting.delete(path);
        return Promise.resolve();
    },
    readDir: () => Promise.resolve([]),
}));

jest.mock('@libs/fileDownload/checkFileExists', () => ({
    __esModule: true,
    default: (path?: string) => mockStat(path),
    checkFileExistsWithReason: (path?: string) => mockStat(path).then((exists) => ({exists})),
}));

jest.mock('@libs/fileDownload/FileUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/fileDownload/FileUtils'),
    readFileAsync: (path: string, fileName: string, onSuccess: (file: {uri: string}) => void, onFailure: () => void) => {
        if (mockIsOnDisk(path)) {
            onSuccess({uri: path});
        } else {
            onFailure();
        }
        return Promise.resolve();
    },
}));

jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: () => FOLDER,
}));

// Jest resolves the bare specifier to the web implementation, which has no swap to race.
jest.mock('@libs/ReceiptStorage', () => jest.requireActual<Record<string, unknown>>('@libs/ReceiptStorage/index.native.ts'));

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

jest.mock('@libs/IOUUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/IOUUtils'),
    navigateToStartMoneyRequestStep: jest.fn(),
}));

const {default: validateReceiptFile}: {default: typeof ValidateReceiptFileNative} = jest.requireActual('@libs/fileDownload/validateReceiptFile/index.native.ts');

const mockMoveFile: jest.Mock<Promise<void>, [string, string]> = jest.requireMock<{moveFile: jest.Mock<Promise<void>, [string, string]>}>('react-native-fs').moveFile;

async function holdSwapWithReceiptMissing() {
    let release: () => void = () => {};
    const receiptMissing = new Promise<void>((resolve) => {
        mockMoveFile.mockImplementation((from: string, to: string) => {
            mockExisting.delete(from);
            if (from === `${RECEIPT_PATH}.receipt-swap-staged` && to === RECEIPT_PATH) {
                resolve();
                return new Promise<void>((settle) => {
                    release = () => {
                        mockExisting.add(to);
                        settle();
                    };
                });
            }
            mockExisting.add(to);
            return Promise.resolve();
        });
    });

    const swap = ReceiptStorage.overwrite(RECEIPT, '/var/mobile/tmp/still.jpg');
    await receiptMissing;

    return {
        finishSwap: () => {
            release();
            return swap;
        },
    };
}

describe('reading a receipt while an upgrade swaps it', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExisting.clear();
        mockDirectories.clear();
        mockExisting.add(RECEIPT_PATH);
        mockExisting.add('/var/mobile/tmp/still.jpg');
        mockHoldRead = undefined;
    });

    const flushPendingWork = () =>
        new Promise<void>((resolve) => {
            setImmediate(resolve);
        });

    it('confirms the receipt is readable instead of reporting it unreadable', async () => {
        // Given an upgrade swap caught between its two renames, with nothing at the receipt's own path
        const {finishSwap} = await holdSwapWithReceiptMissing();
        expect(mockExisting.has(RECEIPT_PATH)).toBe(false);

        // When the confirmation page checks the receipt can be read
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        const check = checkIfLocalFileIsAccessible(RECEIPT, RECEIPT_URI, 'image/jpeg', onSuccess, onFailure);
        await finishSwap();
        await check;

        // Then the check sees the upgraded receipt. A failure here restarts the request and drops the receipt.
        expect(onFailure).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({uri: RECEIPT_URI}));
    });

    it('keeps the receipt when the participants step checks it mid-swap', async () => {
        // Given an upgrade swap caught between its two renames
        const {finishSwap} = await holdSwapWithReceiptMissing();

        // When the participants step checks the scanned file can be read
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        const check = navigateToStartStepIfScanFileCannotBeRead(RECEIPT, RECEIPT_URI, onSuccess, CONST.IOU.REQUEST_TYPE.MANUAL, CONST.IOU.TYPE.SUBMIT, '1', '2', 'image/jpeg', onFailure);
        await finishSwap();
        await check;

        // Then the receipt is kept. The failure path clears it from the transaction and sends the user back to scan.
        expect(onFailure).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
    });

    it('passes receipt validation on the confirmation page', async () => {
        // Given an upgrade swap caught between its two renames
        const {finishSwap} = await holdSwapWithReceiptMissing();

        // When the confirmation page validates the receipt file before submit
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        const check = validateReceiptFile(RECEIPT, RECEIPT_URI, 'image/jpeg', onSuccess, onFailure);
        await finishSwap();
        await check;

        // Then validation passes rather than flagging a receipt that is only being swapped
        expect(onFailure).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({uri: RECEIPT_URI}));
    });

    it('keeps the receipt when a validation that started before the swap lands in its gap', async () => {
        // Given an upgrade swap still staging its new file, before it has touched the receipt
        const holds: Record<'staging' | 'secondRename', () => void> = {
            staging: () => {},
            secondRename: () => {},
        };
        let stagingStarted: () => void = () => {};
        let gapOpened: () => void = () => {};
        const isStaging = new Promise<void>((resolve) => {
            stagingStarted = resolve;
        });
        const isInGap = new Promise<void>((resolve) => {
            gapOpened = resolve;
        });
        mockMoveFile.mockImplementation((from: string, to: string) => {
            const move = () => {
                mockExisting.delete(from);
                mockExisting.add(to);
            };
            const hold = (name: keyof typeof holds, signal: () => void) => {
                signal();
                return new Promise<void>((settle) => {
                    holds[name] = () => {
                        move();
                        settle();
                    };
                });
            };
            if (to === `${RECEIPT_PATH}.receipt-swap-staged`) {
                return hold('staging', stagingStarted);
            }
            if (from === `${RECEIPT_PATH}.receipt-swap-staged` && to === RECEIPT_PATH) {
                return hold('secondRename', gapOpened);
            }
            move();
            return Promise.resolve();
        });
        const swap = ReceiptStorage.overwrite(RECEIPT, '/var/mobile/tmp/still.jpg');
        await isStaging;

        // And a validation that has started reading the file, slowly
        let finishRead: () => void = () => {};
        mockHoldRead = new Promise<void>((resolve) => {
            finishRead = resolve;
        });
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        const check = validateReceiptFile(RECEIPT, RECEIPT_URI, 'image/jpeg', onSuccess, onFailure);
        await flushPendingWork();

        // When the swap reaches its gap and the read lands there, finding nothing at the receipt's path
        holds.staging();
        await isInGap;
        expect(mockExisting.has(RECEIPT_PATH)).toBe(false);
        mockHoldRead = undefined;
        finishRead();
        await flushPendingWork();

        // Then the missed read is not reported while the swap is still running
        expect(onFailure).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();

        // And once the swap is done, the recheck finds the upgraded receipt and it passes
        holds.secondRename();
        await swap;
        await check;
        expect(onFailure).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({uri: RECEIPT_URI}));
    });

    it('still reports a receipt that is really gone', async () => {
        // Given a receipt that is missing with no swap and no backup
        mockExisting.clear();

        // When the confirmation page validates it
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        await validateReceiptFile(RECEIPT, RECEIPT_URI, 'image/jpeg', onSuccess, onFailure);

        // Then the failure goes through, so a lost receipt is still sent back to scan
        expect(onFailure).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('still reports an unreadable receipt from the participants step', async () => {
        // Given a receipt that is missing with no swap and no backup
        mockExisting.clear();

        // When the participants step checks it can be read
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        await navigateToStartStepIfScanFileCannotBeRead(RECEIPT, RECEIPT_URI, onSuccess, CONST.IOU.REQUEST_TYPE.MANUAL, CONST.IOU.TYPE.SUBMIT, '1', '2', 'image/jpeg', onFailure);

        // Then the failure goes through once, after the recheck finds nothing
        expect(onFailure).toHaveBeenCalledTimes(1);
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('rejects a directory at the receipt path even after the recheck', async () => {
        // Given a directory where the receipt file should be, which exists but is not a file
        mockExisting.clear();
        mockDirectories.add(RECEIPT_PATH);

        // When the confirmation page validates the receipt
        const onSuccess = jest.fn();
        const onFailure = jest.fn();
        await validateReceiptFile(RECEIPT, RECEIPT_URI, 'image/jpeg', onSuccess, onFailure);

        // Then the recheck finding something at the path does not make it a valid receipt
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onFailure).toHaveBeenCalled();
    });
});
