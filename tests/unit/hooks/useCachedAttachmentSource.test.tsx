import {act, render, renderHook, waitFor} from '@testing-library/react-native';

import type {ImageSource} from 'expo-image';

import React from 'react';

import type BaseImageType from '../../../src/components/Image/BaseImage.native';
import type useCachedAttachmentSource from '../../../src/hooks/useCachedAttachmentSource';

import {AttachmentIDContext} from '../../../src/components/Attachments/AttachmentIDContext';

// Captures the recyclingKey expo-image receives, to assert the flash-bug fix holds.
const mockImageComponent: jest.Mock = jest.fn(() => null);
jest.mock('expo-image', () => ({
    get Image() {
        return mockImageComponent;
    },
}));

const MOCK_URI = 'https://example.com/image.png';
// eslint-disable-next-line @typescript-eslint/naming-convention
const MOCK_HEADERS = {'X-Chat-Attachment-Token': 'token123'};
const MOCK_CACHED_URI = 'blob:http://localhost/cached-url';
const REMOTE_SOURCE = 'https://cdn.example.com/remote.png';
const NATIVE_LOCAL_SOURCE = '/path/to/file';
const NATIVE_CACHED_URI = 'file:///path/to/cached/file.jpg';

const mockUseOnyx = jest.fn();
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockUseOnyx(...args) as unknown,
}));

const mockGetCachedAttachment = jest.fn();
const mockGetAttachmentLocalSource = jest.fn();
jest.mock('@libs/actions/Attachment', () => ({
    getCachedAttachment: (...args: unknown[]) => mockGetCachedAttachment(...args) as unknown,
    getAttachmentLocalSource: (...args: unknown[]) => mockGetAttachmentLocalSource(...args) as unknown,
}));

const mockLogHmmm = jest.fn();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        hmmm: (...args: unknown[]) => mockLogHmmm(...args) as unknown,
        info: jest.fn(),
        alert: jest.fn(),
        warn: jest.fn(),
    },
}));

const revokeObjectURLMock = jest.fn();

const createWrapper = (attachmentID?: string) => {
    const contextValue = {attachmentID};
    // eslint-disable-next-line react/function-component-definition
    const Wrapper = ({children}: {children: React.ReactNode}) => <AttachmentIDContext.Provider value={contextValue}>{children}</AttachmentIDContext.Provider>;
    return Wrapper;
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
    mockGetCachedAttachment.mockResolvedValue(MOCK_CACHED_URI);
    mockGetAttachmentLocalSource.mockReturnValue(undefined);
    global.URL.revokeObjectURL = revokeObjectURLMock;
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useCachedAttachmentSource (web)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const useCachedAttachmentSourceWeb: typeof useCachedAttachmentSource = require('../../../src/hooks/useCachedAttachmentSource/index.ts').default;

    it('should return undefined when source is undefined', () => {
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(undefined), {wrapper: createWrapper()});
        expect(result.current).toBeUndefined();
    });

    it('should return source as-is when it has no auth token and no attachmentID', () => {
        const source: ImageSource = {uri: MOCK_URI};
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper()});
        expect(result.current).toBe(source);
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should fetch via auth token when no attachmentID is present', async () => {
        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};

        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper()});

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_CACHED_URI});
        });

        expect(mockGetCachedAttachment).toHaveBeenCalledWith({
            uri: MOCK_URI,
            attachmentID: undefined,
            remoteSource: undefined,
            authToken: 'token123',
        });
    });

    it('should return local source synchronously without fetching', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetAttachmentLocalSource.mockReturnValue(MOCK_CACHED_URI);

        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toEqual({uri: MOCK_CACHED_URI});
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should pass the correct arguments to getCachedAttachment and return the cached uri', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);

        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toEqual({uri: MOCK_CACHED_URI});
        });

        expect(mockGetCachedAttachment).toHaveBeenCalledWith({
            uri: MOCK_URI,
            attachmentID: 'test-id',
            remoteSource: REMOTE_SOURCE,
            authToken: undefined,
        });
    });

    it('should fall back to original source without revoking when getCachedAttachment returns undefined', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockResolvedValue(undefined);

        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });

    it('should fall back to original source, log, and not revoke when getCachedAttachment rejects', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        const error = new Error('Network error');
        mockGetCachedAttachment.mockRejectedValue(error);

        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(mockLogHmmm).toHaveBeenCalledWith('[AttachmentCache] Failed to get cached attachment', {message: error.message});
        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });

    it('should return source when URI starts with blob: and cachedUri is null', () => {
        const source: ImageSource = {uri: 'blob:http://localhost/existing-blob'};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toBe(source);
    });

    it('should not call getCachedAttachment when attachmentMetadata is loading', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

        renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper('test-id')});

        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should return null while cache fetch is in progress', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);

        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toBeNull();
    });

    it('should revoke previous object URL only after the new one is ready', async () => {
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        const secondCachedUri = 'blob:http://localhost/second-cached-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: createWrapper('test-id'),
        });

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));

        revokeObjectURLMock.mockClear();
        mockGetCachedAttachment.mockResolvedValue(secondCachedUri);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        rerender({source: source2});

        expect(revokeObjectURLMock).not.toHaveBeenCalledWith(MOCK_CACHED_URI);

        await waitFor(() => expect(result.current).toEqual({uri: secondCachedUri}));
        expect(revokeObjectURLMock).toHaveBeenCalledWith(MOCK_CACHED_URI);
    });

    it('should not revoke object URL when the cached source is unchanged', async () => {
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        mockGetCachedAttachment.mockResolvedValue(MOCK_CACHED_URI);

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: createWrapper('test-id'),
        });

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));

        revokeObjectURLMock.mockClear();
        rerender({source: source2});

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));
        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });

    it('should keep previous image visible during slow URI transition', async () => {
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        const secondCachedUri = 'blob:http://localhost/second-cached-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: createWrapper('test-id'),
        });

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));

        const resolvers: Array<(value: string) => void> = [];
        mockGetCachedAttachment.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    resolvers.push(resolve);
                }),
        );
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        rerender({source: source2});

        expect(result.current).toEqual({uri: MOCK_CACHED_URI});

        resolvers.at(0)?.(secondCachedUri);
        await waitFor(() => expect(result.current).toEqual({uri: secondCachedUri}));
    });

    it('should ignore stale resolutions after the source changes', async () => {
        const source1: ImageSource = {uri: 'https://example.com/a.png'};
        const source2: ImageSource = {uri: 'https://example.com/b.png'};
        const staleUri = 'blob:http://localhost/stale-url';
        const freshUri = 'blob:http://localhost/fresh-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);

        const resolvers: Array<(value: string) => void> = [];
        mockGetCachedAttachment.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    resolvers.push(resolve);
                }),
        );

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: createWrapper('test-id'),
        });

        rerender({source: source2});

        // Resolving the first (stale) fetch must not update state.
        await act(async () => {
            resolvers.at(0)?.(staleUri);
        });
        expect(result.current).toBeNull();

        // The fresh fetch is what the hook should settle on.
        await act(async () => {
            resolvers.at(1)?.(freshUri);
        });
        expect(result.current).toEqual({uri: freshUri});
    });
});

describe('useCachedAttachmentSource (native)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const useCachedAttachmentSourceNative: typeof useCachedAttachmentSource = require('../../../src/hooks/useCachedAttachmentSource/index.native').default;

    it('should return undefined when source is undefined', () => {
        const {result} = renderHook(() => useCachedAttachmentSourceNative(undefined), {wrapper: createWrapper()});
        expect(result.current).toBeUndefined();
    });

    it('should return source as-is when no attachmentID', () => {
        const source: ImageSource = {uri: MOCK_URI};
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper()});
        expect(result.current).toBe(source);
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should return local source synchronously without fetching', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetAttachmentLocalSource.mockReturnValue(NATIVE_CACHED_URI);

        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toEqual({uri: NATIVE_CACHED_URI});
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should pass the correct arguments to getCachedAttachment and return the cached uri', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);
        mockGetCachedAttachment.mockResolvedValue(NATIVE_CACHED_URI);

        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => expect(result.current).toEqual({uri: NATIVE_CACHED_URI}));

        expect(mockGetCachedAttachment).toHaveBeenCalledWith({
            uri: MOCK_URI,
            attachmentID: 'test-id',
            localSource: NATIVE_LOCAL_SOURCE,
        });
    });

    it('should fall back to original source when getCachedAttachment returns undefined', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockResolvedValue(undefined);

        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toBe(source);
        });
    });

    it('should fall back to original source and log when getCachedAttachment rejects', async () => {
        const source: ImageSource = {uri: MOCK_URI};
        const error = new Error('Cache error');
        mockGetCachedAttachment.mockRejectedValue(error);

        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper('test-id')});

        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(mockLogHmmm).toHaveBeenCalledWith('[AttachmentCache] Failed to get cached attachment', {message: error.message});
    });

    it('should return source when URI starts with file: and cachedUri is null', () => {
        const source: ImageSource = {uri: 'file:///path/to/local/file.jpg'};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);

        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toBe(source);
    });

    it('should not call getCachedAttachment when attachmentMetadata is loading', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

        renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper('test-id')});

        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should return null while cache fetch is in progress', () => {
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);

        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: createWrapper('test-id')});

        expect(result.current).toBeNull();
    });

    it('should ignore stale resolutions after the source changes', async () => {
        const source1: ImageSource = {uri: 'https://example.com/a.png'};
        const source2: ImageSource = {uri: 'https://example.com/b.png'};
        const staleUri = 'file:///stale-url';
        const freshUri = 'file:///fresh-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);

        const resolvers: Array<(value: string) => void> = [];
        mockGetCachedAttachment.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    resolvers.push(resolve);
                }),
        );

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceNative(source), {
            initialProps: {source: source1},
            wrapper: createWrapper('test-id'),
        });

        rerender({source: source2});

        // Resolving the first (stale) fetch must not update state.
        await act(async () => {
            resolvers.at(0)?.(staleUri);
        });
        expect(result.current).toBeNull();

        // The fresh fetch is what the hook should settle on.
        await act(async () => {
            resolvers.at(1)?.(freshUri);
        });
        expect(result.current).toEqual({uri: freshUri});
    });
});

// BaseImage derives its expo-image recycling key. The native flash/remount bug happened because the
// key was derived from the resolved cached source: when the cached URI changed for a fixed
// attachmentID, expo-image remounted. The fix pins the key to attachmentID.
describe('BaseImage (native) recycling key stays pinned to attachmentID', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const BaseImageNative: typeof BaseImageType = require('../../../src/components/Image/BaseImage.native').default;

    it('uses attachmentID as the recycling key, not the resolved cached source', async () => {
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);
        mockGetCachedAttachment.mockResolvedValue(NATIVE_CACHED_URI);

        render(
            <AttachmentIDContext.Provider value={{attachmentID: 'test-id'}}>
                <BaseImageNative source={{uri: MOCK_URI}} />
            </AttachmentIDContext.Provider>,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await waitFor(() => expect(mockImageComponent.mock.calls.at(-1)?.[0]?.recyclingKey).toBe('test-id'));
    });
});
