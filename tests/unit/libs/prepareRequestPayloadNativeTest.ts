import type PrepareRequestPayload from '@libs/prepareRequestPayload/types';

const mockCheckFileExists = jest.fn<Promise<boolean>, [string | undefined]>();
jest.mock('@libs/fileDownload/checkFileExists', () => ({
    __esModule: true,
    default: mockCheckFileExists,
}));

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(() => Promise.resolve(null)),
}));

const mockValidateFormDataParameter = jest.fn();
jest.mock('@libs/validateFormDataParameter', () => ({
    __esModule: true,
    default: mockValidateFormDataParameter,
}));

const mockLogReceiptDropped = jest.fn();
jest.mock('@libs/telemetry/ReceiptObservability', () => ({
    logReceiptDropped: mockLogReceiptDropped,
}));

const RECEIPTS_FOLDER = '/Containers/Data/Application/CURRENT/Documents/Receipts-Upload';
const mockSettle = jest.fn<Promise<void>, [string]>(() => Promise.resolve());

jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        locate: (source?: string) => {
            const name = source?.includes('/Receipts-Upload/') ? source.split('/').pop() : undefined;
            const uri = name ? `file://${RECEIPTS_FOLDER}/${name}` : source;
            return mockCheckFileExists(uri).then((exists: boolean) => (exists ? uri : undefined));
        },
        settle: (durableName: string) => mockSettle(durableName),
    },
}));

// Bypass the global jest/setup.ts mock to test the real native implementation.
// Dependencies above are still resolved through their respective mocks.

const {default: prepareRequestPayload}: {default: PrepareRequestPayload} = jest.requireActual('@libs/prepareRequestPayload/index.native.ts');

describe('prepareRequestPayload (native)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should include receipt in FormData when the file exists', async () => {
        mockCheckFileExists.mockResolvedValue(true);

        const receipt = {
            source: 'file:///var/mobile/Documents/Receipts-Upload/receipt.jpg',
            name: 'receipt.jpg',
            type: 'image/jpeg',
            uri: 'file:///var/mobile/Documents/Receipts-Upload/receipt.jpg',
        };

        const formData = await prepareRequestPayload('RequestMoney', {receipt, amount: '100'}, false);

        expect(formData.has('receipt')).toBe(true);
        expect(formData.get('amount')).toBe('100');
    });

    it('should log a joinable [Receipt] dropped line and omit receipt from FormData when file does not exist', async () => {
        mockCheckFileExists.mockResolvedValue(false);

        const receipt = {
            source: 'file:///var/mobile/Library/Caches/ImageManipulator/receipt.jpg',
            name: 'receipt.jpg',
            type: 'image/jpeg',
            uri: 'file:///var/mobile/Library/Caches/ImageManipulator/receipt.jpg',
            receiptTraceId: 'trace-123',
        };

        const formData = await prepareRequestPayload('RequestMoney', {receipt, transactionID: 'txn-456', amount: '100'}, false);

        expect(formData.has('receipt')).toBe(false);
        expect(formData.get('amount')).toBe('100');
        // The drop carries the trace id and transaction id so it joins the capture/enqueue lines on the [Receipt] spine.
        expect(mockLogReceiptDropped).toHaveBeenCalledWith({
            receiptTraceId: 'trace-123',
            transactionID: 'txn-456',
            command: 'RequestMoney',
            source: 'file:///var/mobile/Library/Caches/ImageManipulator/receipt.jpg',
            fileName: 'receipt.jpg',
        });
    });

    it('should recover a queued receipt whose stored path names a stale container, by re-rooting the filename', async () => {
        mockCheckFileExists.mockResolvedValue(true);

        const receipt = {
            // Written before an app upgrade. The device no longer has this container.
            source: 'file:///Containers/Data/Application/STALE/Documents/Receipts-Upload/receipt_9.jpg',
            uri: 'file:///Containers/Data/Application/STALE/Documents/Receipts-Upload/receipt_9.jpg',
            name: 'receipt.jpg',
            type: 'image/jpeg',
        };

        const formData = await prepareRequestPayload('RequestMoney', {receipt, amount: '100'}, false);

        expect(mockCheckFileExists).toHaveBeenCalledWith(`file://${RECEIPTS_FOLDER}/receipt_9.jpg`);
        expect(formData.has('receipt')).toBe(true);
        expect(mockValidateFormDataParameter).toHaveBeenCalledWith('RequestMoney', 'receipt', expect.objectContaining({uri: `file://${RECEIPTS_FOLDER}/receipt_9.jpg`}));
        expect(mockLogReceiptDropped).not.toHaveBeenCalled();
    });

    it('should still report a genuinely missing file as dropped', async () => {
        mockCheckFileExists.mockResolvedValue(false);

        const receipt = {
            source: 'file:///Containers/Data/Application/CURRENT/Documents/Receipts-Upload/gone.jpg',
            uri: 'file:///Containers/Data/Application/CURRENT/Documents/Receipts-Upload/gone.jpg',
            name: 'receipt.jpg',
            type: 'image/jpeg',
        };

        const formData = await prepareRequestPayload('RequestMoney', {receipt, amount: '100'}, false);

        expect(formData.has('receipt')).toBe(false);
        expect(mockLogReceiptDropped).toHaveBeenCalledWith(expect.objectContaining({source: `file://${RECEIPTS_FOLDER}/gone.jpg`}));
    });

    it('should not check the filesystem for a bundled placeholder receipt', async () => {
        // Distance and per diem expenses carry a require() asset id. No file exists on disk.
        const receipt = {source: 686, name: 'receipt-generic.png', type: 'image/png'};

        const formData = await prepareRequestPayload('AddTrackedExpenseToPolicy', {receipt, amount: '100'}, false);

        expect(mockCheckFileExists).not.toHaveBeenCalled();
        expect(mockLogReceiptDropped).not.toHaveBeenCalled();
        expect(formData.has('receipt')).toBe(false);
        expect(formData.get('amount')).toBe('100');
    });

    it('should handle non-receipt data normally', async () => {
        const formData = await prepareRequestPayload('SomeCommand', {amount: '100', currency: 'USD'}, false);

        expect(formData.get('amount')).toBe('100');
        expect(formData.get('currency')).toBe('USD');
    });

    it('should skip undefined values', async () => {
        const formData = await prepareRequestPayload('SomeCommand', {amount: '100', undefinedField: undefined}, false);

        expect(formData.get('amount')).toBe('100');
        expect(formData.has('undefinedField')).toBe(false);
    });

    describe('a receipt sent as a file object, the way ReplaceReceipt sends it', () => {
        /** `clearAllMocks` keeps a `mockReturnValue`, so a deferred one would leak into the next test. */
        beforeEach(() => {
            mockSettle.mockReturnValue(Promise.resolve());
        });

        /** The payload walks one key per microtask, so settle the whole queue rather than counting hops. */
        const flushMicrotasks = () =>
            new Promise((resolve) => {
                setImmediate(resolve);
            });

        it('claims the file before reading it, and waits only while a claimed swap finishes renaming', async () => {
            let releaseCommittedSwap: () => void = () => {};
            mockSettle.mockReturnValue(
                new Promise<void>((resolve) => {
                    releaseCommittedSwap = resolve;
                }),
            );

            let hasPrepared = false;
            const prepared = prepareRequestPayload(
                'ReplaceReceipt',
                {
                    transactionID: '1',
                    receipt: {uri: `file://${RECEIPTS_FOLDER}/CAM-1.jpg`, name: 'CAM-1.jpg', type: 'image/jpeg'},
                },
                false,
            ).then((formData) => {
                hasPrepared = true;
                return formData;
            });
            await flushMicrotasks();

            expect(mockSettle).toHaveBeenCalledWith('CAM-1.jpg');
            // `settle` only holds the payload while a swap has already committed to its two renames, since
            // reading the receipt mid-rename would send the old bytes, the new ones, or nothing at all.
            expect(hasPrepared).toBe(false);

            releaseCommittedSwap();
            await prepared;
            expect(hasPrepared).toBe(true);
            expect(mockValidateFormDataParameter).toHaveBeenCalledWith('ReplaceReceipt', 'receipt', expect.objectContaining({name: 'CAM-1.jpg'}));
        });

        it('never reaches locate, since a file object carries no receipt source to resolve', async () => {
            await prepareRequestPayload(
                'ReplaceReceipt',
                {
                    transactionID: '1',
                    receipt: {uri: `file://${RECEIPTS_FOLDER}/CAM-1.jpg`, name: 'CAM-1.jpg', type: 'image/jpeg'},
                },
                false,
            );

            expect(mockCheckFileExists).not.toHaveBeenCalled();
            expect(mockLogReceiptDropped).not.toHaveBeenCalled();
        });
    });
});
