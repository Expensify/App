import {isMobile} from '@libs/Browser';
import validateAttachmentFile from '@libs/validateAttachmentFile';

import type {FileObject} from '@src/types/utils/Attachment';

import CONST from '../../src/CONST';
import * as FileUtils from '../../src/libs/fileDownload/FileUtils';

// Jest resolves the .native variant of platform-split modules; force the web implementation
// since the OS-file snapshot behavior under test is web-only.
jest.mock('@src/libs/snapshotPickedFile', () => jest.requireActual<{default: (file: File, name: string) => Promise<File>}>('@src/libs/snapshotPickedFile/index.ts'));

// The web snapshot only copies bytes on desktop browsers; make the browser type controllable per test.
jest.mock('@src/libs/Browser', () => ({
    ...jest.requireActual<Record<string, unknown>>('@src/libs/Browser'),
    isMobile: jest.fn(() => false),
}));

// Mock only normalizeFileObject and validateImageForCorruption; keep the rest real
jest.mock('@src/libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtils>('@src/libs/fileDownload/FileUtils');
    return {
        ...actual,
        normalizeFileObject: jest.fn(),
        validateImageForCorruption: jest.fn(),
    };
});

const mockFileUtils = jest.mocked(FileUtils);

describe('validateAttachmentFile OS-backed file snapshot (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFileUtils.normalizeFileObject.mockImplementation(async (file) => file);
        mockFileUtils.validateImageForCorruption.mockResolvedValue(undefined);
        jest.mocked(isMobile).mockReturnValue(false);
    });

    it('snapshots the picked file bytes into a new memory-backed File', async () => {
        const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-url');
        try {
            const file: FileObject = new File([new Blob(['content'], {type: 'text/plain'})], 'image.png', {type: 'image/png'});
            // The RN File polyfill in Jest has no arrayBuffer; emulate the web File API.
            const arrayBufferSpy = jest.fn().mockResolvedValue(new ArrayBuffer(7));
            Object.defineProperty(file, 'arrayBuffer', {value: arrayBufferSpy, configurable: true});

            const result = await validateAttachmentFile(file);

            expect(result.isValid).toBe(true);
            if (!result.isValid) {
                throw new Error('validateAttachmentFile should return a valid result');
            }
            expect(arrayBufferSpy).toHaveBeenCalled();
            // The returned File must be a fresh memory-backed copy, not the OS-backed original.
            expect(result.file).not.toBe(file);
        } finally {
            createObjectURLSpy.mockRestore();
        }
    });

    it('returns FILE_INVALID when the picked file can no longer be read (deleted or modified on disk)', async () => {
        const file: FileObject = new File([new Blob(['content'], {type: 'text/plain'})], 'image.png', {type: 'image/png'});
        // Chromium rejects the read when the backing OS file changed since it was picked.
        const arrayBufferSpy = jest.fn().mockRejectedValue(new DOMException('The requested file could not be read', 'NotReadableError'));
        Object.defineProperty(file, 'arrayBuffer', {value: arrayBufferSpy, configurable: true});

        const result = await validateAttachmentFile(file);

        expect(result.isValid).toBe(false);
        if (result.isValid) {
            throw new Error('validateAttachmentFile should return an invalid result');
        }
        expect(result.error).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
    });

    it('keeps the lazy OS-backed File on mobile browsers so a multi-file selection is not held in memory', async () => {
        jest.mocked(isMobile).mockReturnValue(true);
        const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-url');
        try {
            const file: FileObject = new File([new Blob(['content'], {type: 'text/plain'})], 'image.png', {type: 'image/png'});
            const arrayBufferSpy = jest.fn();
            Object.defineProperty(file, 'arrayBuffer', {value: arrayBufferSpy, configurable: true});

            const result = await validateAttachmentFile(file);

            expect(result.isValid).toBe(true);
            if (!result.isValid) {
                throw new Error('validateAttachmentFile should return a valid result');
            }
            // Mobile-picked files are sandboxed temp copies, so the bytes are not copied into memory.
            expect(arrayBufferSpy).not.toHaveBeenCalled();
            expect(result.file).toBe(file);
        } finally {
            createObjectURLSpy.mockRestore();
        }
    });

    it('keeps the lazy File on iPadOS Safari in desktop mode (Macintosh user agent with touch points)', async () => {
        const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-url');
        const originalUserAgent = navigator.userAgent;
        const originalMaxTouchPoints = navigator.maxTouchPoints;
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            configurable: true,
        });
        Object.defineProperty(navigator, 'maxTouchPoints', {value: 5, configurable: true});
        try {
            const file: FileObject = new File([new Blob(['content'], {type: 'text/plain'})], 'image.png', {type: 'image/png'});
            const arrayBufferSpy = jest.fn();
            Object.defineProperty(file, 'arrayBuffer', {value: arrayBufferSpy, configurable: true});

            const result = await validateAttachmentFile(file);

            expect(result.isValid).toBe(true);
            if (!result.isValid) {
                throw new Error('validateAttachmentFile should return a valid result');
            }
            expect(arrayBufferSpy).not.toHaveBeenCalled();
            expect(result.file).toBe(file);
        } finally {
            createObjectURLSpy.mockRestore();
            Object.defineProperty(navigator, 'userAgent', {value: originalUserAgent, configurable: true});
            Object.defineProperty(navigator, 'maxTouchPoints', {value: originalMaxTouchPoints, configurable: true});
        }
    });
});
