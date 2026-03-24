import {renderHook, waitFor} from '@testing-library/react-native';
import type {ImageSource} from 'expo-image';
import useCachedImageSource from '@hooks/useCachedImageSource';
import CONST from '@src/CONST';

const MOCK_URI = 'https://example.com/image.png';
// eslint-disable-next-line @typescript-eslint/naming-convention
const MOCK_HEADERS = {'X-Auth-Token': 'token123'};
const MOCK_BLOB = new Blob(['image-data'], {type: 'image/png'});
const MOCK_BLOB_URL = 'blob:http://localhost/mock-blob-url';

let mockCacheMatch: jest.Mock;
let mockCachePut: jest.Mock;
let mockCachesOpen: jest.Mock;
let mockCachesDelete: jest.Mock;
let mockCreateObjectURL: jest.Mock;
let mockRevokeObjectURL: jest.Mock;

const createMockResponse = (ok = true) => {
    const response = {
        ok,
        blob: jest.fn().mockResolvedValue(MOCK_BLOB),
        clone: jest.fn(),
    };
    response.clone.mockReturnValue(response);
    return response as unknown as Response;
};

beforeEach(() => {
    mockCacheMatch = jest.fn().mockResolvedValue(null);
    mockCachePut = jest.fn().mockResolvedValue(undefined);
    mockCachesOpen = jest.fn().mockResolvedValue({match: mockCacheMatch, put: mockCachePut});
    mockCachesDelete = jest.fn().mockResolvedValue(true);

    const cachesMock = {
        open: mockCachesOpen,
        delete: mockCachesDelete,
        has: jest.fn().mockResolvedValue(false),
        keys: jest.fn().mockResolvedValue([]),
        match: jest.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(window, 'caches', {value: cachesMock, writable: true, configurable: true});

    jest.spyOn(global, 'fetch').mockResolvedValue(createMockResponse());
    mockCreateObjectURL = jest.fn().mockReturnValue(MOCK_BLOB_URL);
    mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useCachedImageSource', () => {
    it('should return source as-is when it has no headers', () => {
        const source: ImageSource = {uri: MOCK_URI};
        const {result} = renderHook(() => useCachedImageSource(source));
        expect(result.current).toBe(source);
    });

    it('should return undefined when source is undefined', () => {
        const {result} = renderHook(() => useCachedImageSource(undefined));
        expect(result.current).toBeUndefined();
    });

    it('should return null while cache fetch is in progress', () => {
        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const {result} = renderHook(() => useCachedImageSource(source));

        // Initially null while the async effect runs
        expect(result.current).toBeNull();
    });

    it('should return blob URL from cache hit', async () => {
        const cachedResponse = {blob: jest.fn().mockResolvedValue(MOCK_BLOB)};
        mockCacheMatch.mockResolvedValue(cachedResponse);

        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const {result} = renderHook(() => useCachedImageSource(source));

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_BLOB_URL});
        });

        expect(mockCachesOpen).toHaveBeenCalledWith(CONST.CACHE_NAME.AUTH_IMAGES);
        expect(mockCacheMatch).toHaveBeenCalledWith(MOCK_URI);
        expect(mockCreateObjectURL).toHaveBeenCalledWith(MOCK_BLOB);
    });

    it('should fetch, cache, and return blob URL on cache miss', async () => {
        const mockResponse = createMockResponse();
        jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const {result} = renderHook(() => useCachedImageSource(source));

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_BLOB_URL});
        });

        expect(global.fetch).toHaveBeenCalledWith(MOCK_URI, {headers: MOCK_HEADERS});
        expect(mockCachePut).toHaveBeenCalledWith(MOCK_URI, mockResponse);
        expect(mockCreateObjectURL).toHaveBeenCalledWith(MOCK_BLOB);
    });

    it('should fall back to original source when fetch fails', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue(createMockResponse(false));

        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const {result} = renderHook(() => useCachedImageSource(source));

        await waitFor(() => {
            expect(result.current).toBe(source);
        });
    });

    it('should clear cache and fall back on QuotaExceededError', async () => {
        const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
        mockCacheMatch.mockRejectedValue(quotaError);

        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const {result} = renderHook(() => useCachedImageSource(source));

        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(mockCachesDelete).toHaveBeenCalledWith(CONST.CACHE_NAME.AUTH_IMAGES);
    });

    it('should not clear cache on non-quota errors', async () => {
        mockCacheMatch.mockRejectedValue(new Error('Network error'));

        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const {result} = renderHook(() => useCachedImageSource(source));

        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(mockCachesDelete).not.toHaveBeenCalled();
    });

    it('should revoke object URL on unmount', async () => {
        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const {result, unmount} = renderHook(() => useCachedImageSource(source));

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_BLOB_URL});
        });

        unmount();

        expect(mockRevokeObjectURL).toHaveBeenCalledWith(MOCK_BLOB_URL);
    });

    it('should reset and re-fetch when URI changes', async () => {
        const source1: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};
        const source2: ImageSource = {uri: 'https://example.com/other.png', headers: MOCK_HEADERS};

        const secondBlobUrl = 'blob:http://localhost/second-blob-url';

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedImageSource(source), {initialProps: {source: source1}});

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_BLOB_URL});
        });

        mockCreateObjectURL.mockReturnValue(secondBlobUrl);

        rerender({source: source2});

        await waitFor(() => {
            expect(result.current).toEqual({uri: secondBlobUrl});
        });

        // Old URL should be revoked during cleanup
        expect(mockRevokeObjectURL).toHaveBeenCalledWith(MOCK_BLOB_URL);
    });
});
