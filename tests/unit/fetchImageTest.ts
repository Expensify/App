import fetchImage from '@libs/fetchImage';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

import {getGlobalFetchMock} from '../utils/TestHelper';

const mockBlobUtilFetch = jest.fn<Promise<{path: () => string}>, [string, string, Record<string, string>]>(() => Promise.resolve({path: () => '/cache/temp_image.jpg'}));

jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {
        fs: {dirs: {CacheDir: '/cache'}},
        config: () => ({fetch: mockBlobUtilFetch}),
    },
}));

const ENCRYPTED_TOKEN = 'testEncryptedToken123';
const RECEIPT_URL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/w_receipt.jpg`;
const ATTACKER_IMAGE_URL = 'https://attacker.example/receipt.jpg';

/**
 * Jest resolves `@libs/fetchImage` to the native file, so the web file is loaded by its path.
 */
function loadWebFetchImage(): typeof fetchImage {
    let webFetchImage: typeof fetchImage | undefined;
    jest.isolateModules(() => {
        webFetchImage = jest.requireActual<{default: typeof fetchImage}>('../../src/libs/fetchImage/index.ts').default;
    });

    if (!webFetchImage) {
        throw new Error('Failed to load the web fetchImage');
    }
    return webFetchImage;
}

describe('fetchImage', () => {
    describe('native', () => {
        beforeEach(() => {
            mockBlobUtilFetch.mockClear();
        });

        it('sends the token header to an Expensify server', async () => {
            // Given a receipt image on an Expensify server
            // When downloading it to edit on device
            await fetchImage(RECEIPT_URL, ENCRYPTED_TOKEN);

            // Then the request carries the token the server needs
            expect(mockBlobUtilFetch).toHaveBeenCalledWith('GET', RECEIPT_URL, {
                [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: ENCRYPTED_TOKEN,
            });
        });

        it('sends no token header to a host outside Expensify', async () => {
            // Given an image on a host that is not an Expensify server
            // When downloading it to edit on device
            await fetchImage(ATTACKER_IMAGE_URL, ENCRYPTED_TOKEN);

            // Then the request goes out with no headers, so that host never sees the token
            expect(mockBlobUtilFetch).toHaveBeenCalledWith('GET', ATTACKER_IMAGE_URL, {});
        });
    });

    describe('web', () => {
        const originalFetch = global.fetch;
        const mockFetch = getGlobalFetchMock({blob: () => Promise.resolve(new Blob())});

        beforeAll(() => {
            global.fetch = mockFetch;
            jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:https://new.expensify.com/1234-5678');
        });

        afterAll(() => {
            global.fetch = originalFetch;
            jest.restoreAllMocks();
        });

        beforeEach(() => {
            mockFetch.mockClear();
        });

        it('sends the token header to an Expensify server', async () => {
            // Given a receipt image on an Expensify server
            const webFetchImage = loadWebFetchImage();

            // When downloading it to edit in the browser
            await webFetchImage(RECEIPT_URL, ENCRYPTED_TOKEN);

            // Then the request carries the token the server needs
            expect(mockFetch).toHaveBeenCalledWith(RECEIPT_URL, {
                headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: ENCRYPTED_TOKEN},
            });
        });

        it('sends no token header to a host outside Expensify', async () => {
            // Given an image on a host that is not an Expensify server
            const webFetchImage = loadWebFetchImage();

            // When downloading it to edit in the browser
            await webFetchImage(ATTACKER_IMAGE_URL, ENCRYPTED_TOKEN);

            // Then the request goes out with no headers, so that host never sees the token
            expect(mockFetch).toHaveBeenCalledWith(ATTACKER_IMAGE_URL, {
                headers: undefined,
            });
        });
    });
});
