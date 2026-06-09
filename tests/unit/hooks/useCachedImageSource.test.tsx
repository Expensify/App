import {renderHook, waitFor} from '@testing-library/react-native';
import type {ImageSource} from 'expo-image';
import React from 'react';
import {AttachmentIDContext} from '../../../src/components/Attachments/AttachmentIDContext';
import type useCachedImageSource from '../../../src/hooks/useCachedImageSource';

const MOCK_URI = 'https://example.com/image.png';
// eslint-disable-next-line @typescript-eslint/naming-convention
const MOCK_HEADERS = {'X-Chat-Attachment-Token': 'token123'};
const MOCK_CACHED_URI = 'blob:http://localhost/cached-url';

const mockUseOnyx = jest.fn();
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockUseOnyx(...args),
}));

const mockGetCachedAttachment = jest.fn();
const mockGetAttachmentLocalSource = jest.fn();
jest.mock('@libs/actions/Attachment', () => ({
    getCachedAttachment: (...args: unknown[]) => mockGetCachedAttachment(...args),
    getAttachmentLocalSource: (...args: unknown[]) => mockGetAttachmentLocalSource(...args),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        addListener: jest.fn(() => jest.fn()),
    }),
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        hmmm: jest.fn(),
        info: jest.fn(),
        alert: jest.fn(),
        warn: jest.fn(),
    },
}));

const createWrapper = (attachmentID?: string) =>
    function Wrapper({children}: {children: React.ReactNode}) {
        return <AttachmentIDContext.Provider value={{attachmentID}}>{children}</AttachmentIDContext.Provider>;
    };

beforeEach(() => {
    jest.clearAllMocks();
    mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
    mockGetCachedAttachment.mockResolvedValue(MOCK_CACHED_URI);
    mockGetAttachmentLocalSource.mockReturnValue(undefined);
    global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useCachedImageSource (web)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, import/extensions
    const useCachedImageSourceWeb: typeof useCachedImageSource = require('../../../src/hooks/useCachedImageSource/index.ts').default;

    it('should return undefined when source is undefined', () => {
        const {result} = renderHook(() => useCachedImageSourceWeb(undefined), {wrapper: createWrapper()});
        expect(result.current).toBeUndefined();
    });

    it('should return source as-is when it has no headers and no attachmentID', () => {
        const source: ImageSource = {uri: MOCK_URI};
        const {result} = renderHook(() => useCachedImageSourceWeb(source), {wrapper: createWrapper()});
        expect(result.current).toBe(source);
    });

    it('should return cached URI from getAttachmentLocalSource synchronously', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetAttachmentLocalSource.mockReturnValue(MOCK_CACHED_URI);

        const {result} = renderHook(() => useCachedImageSourceWeb(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_CACHED_URI});
        });

        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should return cached URI when getCachedAttachment resolves', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: '/path/to/file'}, {status: 'loaded'}]);

        const {result} = renderHook(() => useCachedImageSourceWeb(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_CACHED_URI});
        });
    });

    it('should fall back to original source when getCachedAttachment returns undefined', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockResolvedValue(undefined);

        const {result} = renderHook(() => useCachedImageSourceWeb(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toBe(source);
        });
    });

    it('should fall back to original source when getCachedAttachment rejects', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockRejectedValue(new Error('Network error'));

        const {result} = renderHook(() => useCachedImageSourceWeb(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toBe(source);
        });
    });

    it('should return source when URI starts with blob: and cachedUri is null', () => {
        const source: ImageSource = {uri: 'blob:http://localhost/existing-blob'};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        const {result} = renderHook(() => useCachedImageSourceWeb(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toBe(source);
    });

    it('should not call getCachedAttachment when attachmentMetadata is loading', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

        renderHook(() => useCachedImageSourceWeb(source), {wrapper: createWrapper('test-id')});

        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should revoke previous URL only after new URL is ready', async () => {
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        const secondCachedUri = 'blob:http://localhost/second-cached-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: '/path/to/file'}, {status: 'loaded'}]);

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedImageSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: createWrapper('test-id'),
        });

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));

        (global.URL.revokeObjectURL as jest.Mock).mockClear();
        mockGetCachedAttachment.mockResolvedValue(secondCachedUri);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        rerender({source: source2});

        expect(global.URL.revokeObjectURL).not.toHaveBeenCalledWith(MOCK_CACHED_URI);

        await waitFor(() => expect(result.current).toEqual({uri: secondCachedUri}));
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(MOCK_CACHED_URI);
    });

    it('should keep previous image visible during slow URI transition', async () => {
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        const secondCachedUri = 'blob:http://localhost/second-cached-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: '/path/to/file'}, {status: 'loaded'}]);

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedImageSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: createWrapper('test-id'),
        });

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));

        let resolveSecondFetch: (value: string) => void;
        mockGetCachedAttachment.mockReturnValue(
            new Promise<string>((resolve) => {
                resolveSecondFetch = resolve;
            }),
        );
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        rerender({source: source2});

        expect(result.current).toEqual({uri: MOCK_CACHED_URI});

        resolveSecondFetch!(secondCachedUri);
        await waitFor(() => expect(result.current).toEqual({uri: secondCachedUri}));
    });
});

describe('useCachedImageSource (native)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const useCachedImageSourceNative: typeof useCachedImageSource = require('../../../src/hooks/useCachedImageSource/index.native').default;

    it('should return undefined when source is undefined', () => {
        const {result} = renderHook(() => useCachedImageSourceNative(undefined), {wrapper: createWrapper()});
        expect(result.current).toBeUndefined();
    });

    it('should return source as-is when no attachmentID', () => {
        const source: ImageSource = {uri: MOCK_URI};
        const {result} = renderHook(() => useCachedImageSourceNative(source), {wrapper: createWrapper()});
        expect(result.current).toBe(source);
    });

    it('should return cached URI when getCachedAttachment resolves', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: '/path/to/file'}, {status: 'loaded'}]);
        mockGetCachedAttachment.mockResolvedValue('file:///path/to/file');

        const {result} = renderHook(() => useCachedImageSourceNative(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => expect(result.current).toEqual({uri: 'file:///path/to/file'}));
    });

    it('should fall back to original source when getCachedAttachment returns undefined', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockResolvedValue(undefined);

        const {result} = renderHook(() => useCachedImageSourceNative(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => expect(result.current).toBe(source));
    });

    it('should fall back to original source when getCachedAttachment rejects', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockRejectedValue(new Error('Cache error'));

        const {result} = renderHook(() => useCachedImageSourceNative(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => expect(result.current).toBe(source));
    });

    it('should return source when URI starts with file: and cachedUri is null', () => {
        const source: ImageSource = {uri: 'file:///path/to/local/file.jpg'};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);

        const {result} = renderHook(() => useCachedImageSourceNative(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toBe(source);
    });

    it('should not call getCachedAttachment when attachmentMetadata is loading', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

        renderHook(() => useCachedImageSourceNative(source), {wrapper: createWrapper('test-id')});

        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });
});
