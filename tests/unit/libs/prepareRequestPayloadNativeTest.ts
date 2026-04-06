import type PrepareRequestPayload from '@libs/prepareRequestPayload/types';

const mockCheckFileExists = jest.fn<Promise<boolean>, [string | undefined]>();
jest.mock('@libs/fileDownload/checkFileExists', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: mockCheckFileExists,
}));

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@libs/validateFormDataParameter', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));

const mockLogAlert = jest.fn();
jest.mock('@libs/Log', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {alert: mockLogAlert},
}));

// Bypass the global jest/setup.ts mock to test the real native implementation.
// Dependencies above are still resolved through their respective mocks.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
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

    it('should log an alert and omit receipt from FormData when file does not exist', async () => {
        mockCheckFileExists.mockResolvedValue(false);

        const receipt = {
            source: 'file:///var/mobile/Library/Caches/ImageManipulator/receipt.jpg',
            name: 'receipt.jpg',
            type: 'image/jpeg',
            uri: 'file:///var/mobile/Library/Caches/ImageManipulator/receipt.jpg',
        };

        const formData = await prepareRequestPayload('RequestMoney', {receipt, amount: '100'}, false);

        expect(formData.has('receipt')).toBe(false);
        expect(formData.get('amount')).toBe('100');
        expect(mockLogAlert).toHaveBeenCalledWith('[prepareRequestPayload] Receipt file missing at upload time', {
            command: 'RequestMoney',
            source: 'file:///var/mobile/Library/Caches/ImageManipulator/receipt.jpg',
            fileName: 'receipt.jpg',
        });
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
});
