import {act, render, renderHook, waitFor} from '@testing-library/react-native';

import type {ImageSource} from 'expo-image';

import React from 'react';

import type BaseImageType from '../../../src/components/Image/BaseImage.native';
import type useCachedAttachmentSource from '../../../src/hooks/useCachedAttachmentSource';

import {AttachmentIDContextProvider} from '../../../src/components/Attachments/AttachmentIDContext';

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

let currentAttachmentID: string | undefined;

function Wrapper({children}: {children: React.ReactNode}) {
    return <AttachmentIDContextProvider attachmentID={currentAttachmentID}>{children}</AttachmentIDContextProvider>;
}

beforeEach(() => {
    jest.clearAllMocks();
    currentAttachmentID = undefined;
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
        // Given no source is provided to the hook
        // When the hook is invoked with undefined
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(undefined), {wrapper: Wrapper});
        // Then it should return undefined because there is nothing to cache or display
        expect(result.current).toBeUndefined();
    });

    it('should return source as-is when it has no auth token and no attachmentID', () => {
        // Given a source without auth headers and no attachmentID in context
        const source: ImageSource = {uri: MOCK_URI};
        // When the hook is invoked
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});
        // Then it should return the original source unchanged because caching is only needed for auth-protected or ID-tracked attachments
        expect(result.current).toBe(source);
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should fetch via auth token when no attachmentID is present', async () => {
        // Given a source with auth-token headers but no attachmentID, simulating a protected remote image
        const source: ImageSource = {uri: MOCK_URI, headers: MOCK_HEADERS};

        // When the hook resolves the cached source
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should call getCachedAttachment with the auth token so the image can be fetched through the auth-images cache
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
        // Given a source with an attachmentID that already has a local cached source in memory
        const source: ImageSource = {uri: MOCK_URI};
        mockGetAttachmentLocalSource.mockReturnValue(MOCK_CACHED_URI);
        currentAttachmentID = 'test-id';

        // When the hook is invoked
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should return the local source immediately without an async fetch, because the blob is already in memory
        expect(result.current).toEqual({uri: MOCK_CACHED_URI});
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should pass the correct arguments to getCachedAttachment and return the cached uri', async () => {
        // Given a source with an attachmentID that has Onyx metadata including a remoteSource
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        currentAttachmentID = 'test-id';

        // When the hook resolves the cached source
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should forward the attachmentID and remoteSource to getCachedAttachment so it can detect source changes and re-cache if needed
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
        // Given an attachmentID whose cached version is no longer available (cache miss with no fallback)
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockResolvedValue(undefined);
        currentAttachmentID = 'test-id';

        // When the hook resolves after the cache miss
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should fall back to the original source because there is no cached version, and should not revoke anything because no blob URL was created
        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });

    it('should fall back to original source, log, and not revoke when getCachedAttachment rejects', async () => {
        // Given a source whose cache lookup fails with a network error
        const source: ImageSource = {uri: MOCK_URI};
        const error = new Error('Network error');
        mockGetCachedAttachment.mockRejectedValue(error);
        currentAttachmentID = 'test-id';

        // When the hook resolves after the rejection
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should fall back to the original source so the image is still displayed, log the failure for debugging, and not revoke because no blob URL was ever created
        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(mockLogHmmm).toHaveBeenCalledWith('[AttachmentCache] Failed to get cached attachment', {message: error.message});
        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });

    it('should return source when URI starts with blob: and cachedUri is null', () => {
        // Given a source that is already an in-memory blob: URL while the cache fetch is still pending
        const source: ImageSource = {uri: 'blob:http://localhost/existing-blob'};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        currentAttachmentID = 'test-id';
        // When the hook is invoked
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should return the blob: source as-is to avoid a blank flash while the cache resolves
        expect(result.current).toBe(source);
    });

    it('should not call getCachedAttachment when attachmentMetadata is loading', () => {
        // Given a source whose Onyx metadata is still loading
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);
        currentAttachmentID = 'test-id';

        // When the hook is invoked
        renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should not call getCachedAttachment because caching should wait until metadata is available to avoid unnecessary or stale fetches
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should return null while cache fetch is in progress', () => {
        // Given a source whose cache fetch will never resolve (simulating an in-progress fetch)
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        currentAttachmentID = 'test-id';

        // When the hook is invoked before the fetch settles
        const {result} = renderHook(() => useCachedAttachmentSourceWeb(source), {wrapper: Wrapper});

        // Then it should return null so the consumer can show a loading state instead of a stale or broken image
        expect(result.current).toBeNull();
    });

    it('should revoke previous object URL only after the new one is ready', async () => {
        // Given a source that changes from one URI to another, both needing cached blob URLs
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        const secondCachedUri = 'blob:http://localhost/second-cached-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        currentAttachmentID = 'test-id';

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));

        // When the source changes to a new URI
        revokeObjectURLMock.mockClear();
        mockGetCachedAttachment.mockResolvedValue(secondCachedUri);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        rerender({source: source2});

        // Then the previous blob URL should not be revoked until the new one is ready, to prevent a flash of blank content between the two
        expect(revokeObjectURLMock).not.toHaveBeenCalledWith(MOCK_CACHED_URI);

        await waitFor(() => expect(result.current).toEqual({uri: secondCachedUri}));
        expect(revokeObjectURLMock).toHaveBeenCalledWith(MOCK_CACHED_URI);
    });

    it('should not revoke object URL when the cached source is unchanged', async () => {
        // Given a source that changes URI but resolves to the same cached blob URL (e.g. different thumbnail URLs for the same attachment)
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        mockGetCachedAttachment.mockResolvedValue(MOCK_CACHED_URI);
        currentAttachmentID = 'test-id';

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));

        // When the source changes but the resolved cached URI stays the same
        revokeObjectURLMock.mockClear();
        rerender({source: source2});

        // Then the previous object URL should not be revoked because revoking a URL still in use would cause the image to disappear
        await waitFor(() => expect(result.current).toEqual({uri: MOCK_CACHED_URI}));
        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });

    it('should keep previous image visible during slow URI transition', async () => {
        // Given a source that changes while the cache fetch for the new URI is slow
        const source1: ImageSource = {uri: MOCK_URI};
        const source2: ImageSource = {uri: 'https://example.com/other.png'};
        const secondCachedUri = 'blob:http://localhost/second-cached-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        currentAttachmentID = 'test-id';

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: Wrapper,
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
        // When the source changes and the new cache fetch has not yet resolved
        rerender({source: source2});

        // Then the previous cached URI should still be returned so the image does not flash blank while the new one loads
        expect(result.current).toEqual({uri: MOCK_CACHED_URI});

        resolvers.at(0)?.(secondCachedUri);
        await waitFor(() => expect(result.current).toEqual({uri: secondCachedUri}));
    });

    it('should ignore stale resolutions after the source changes', async () => {
        // Given a source that changes, causing two concurrent cache fetches (one stale, one fresh)
        const source1: ImageSource = {uri: 'https://example.com/a.png'};
        const source2: ImageSource = {uri: 'https://example.com/b.png'};
        const staleUri = 'blob:http://localhost/stale-url';
        const freshUri = 'blob:http://localhost/fresh-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', remoteSource: REMOTE_SOURCE}, {status: 'loaded'}]);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        currentAttachmentID = 'test-id';

        const resolvers: Array<(value: string) => void> = [];
        mockGetCachedAttachment.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    resolvers.push(resolve);
                }),
        );

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceWeb(source), {
            initialProps: {source: source1},
            wrapper: Wrapper,
        });

        // When the source changes before the first fetch resolves, and the stale fetch resolves first
        rerender({source: source2});

        await act(async () => {
            resolvers.at(0)?.(staleUri);
        });
        // Then the stale resolution must not update state because it belongs to a source that is no longer current
        expect(result.current).toBeNull();

        // When the fresh fetch resolves
        await act(async () => {
            resolvers.at(1)?.(freshUri);
        });
        // Then the hook should settle on the fresh result because only the current source's fetch should update state
        expect(result.current).toEqual({uri: freshUri});
    });
});

describe('useCachedAttachmentSource (native)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const useCachedAttachmentSourceNative: typeof useCachedAttachmentSource = require('../../../src/hooks/useCachedAttachmentSource/index.native').default;

    it('should return undefined when source is undefined', () => {
        // Given no source is provided to the hook
        // When the hook is invoked with undefined
        const {result} = renderHook(() => useCachedAttachmentSourceNative(undefined), {wrapper: Wrapper});
        // Then it should return undefined because there is nothing to cache or display
        expect(result.current).toBeUndefined();
    });

    it('should return source as-is when no attachmentID', () => {
        // Given a source without an attachmentID, which means expo-image handles caching natively
        const source: ImageSource = {uri: MOCK_URI};
        // When the hook is invoked
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});
        // Then it should return the original source unchanged because native expo-image already handles remote attachment caching
        expect(result.current).toBe(source);
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should return local source synchronously without fetching', () => {
        // Given a source with an attachmentID that already has a local cached file path in memory
        const source: ImageSource = {uri: MOCK_URI};
        mockGetAttachmentLocalSource.mockReturnValue(NATIVE_CACHED_URI);
        currentAttachmentID = 'test-id';

        // When the hook is invoked
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});

        // Then it should return the local file path immediately without an async fetch, because the file is already cached on disk
        expect(result.current).toEqual({uri: NATIVE_CACHED_URI});
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should pass the correct arguments to getCachedAttachment and return the cached uri', async () => {
        // Given a source with an attachmentID whose Onyx metadata contains a local file source path
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);
        mockGetCachedAttachment.mockResolvedValue(NATIVE_CACHED_URI);
        currentAttachmentID = 'test-id';

        // When the hook resolves the cached source
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});

        // Then it should forward the localSource to getCachedAttachment so it can verify the file still exists on disk
        await waitFor(() => expect(result.current).toEqual({uri: NATIVE_CACHED_URI}));

        expect(mockGetCachedAttachment).toHaveBeenCalledWith({
            uri: MOCK_URI,
            attachmentID: 'test-id',
            localSource: NATIVE_LOCAL_SOURCE,
        });
    });

    it('should fall back to original source when getCachedAttachment returns undefined', async () => {
        // Given an attachmentID whose cached file is no longer available on disk (cache miss)
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockResolvedValue(undefined);
        currentAttachmentID = 'test-id';

        // When the hook resolves after the cache miss
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});

        // Then it should fall back to the original source because there is no cached version available
        await waitFor(() => {
            expect(result.current).toBe(source);
        });
    });

    it('should fall back to original source and log when getCachedAttachment rejects', async () => {
        // Given a source whose cache lookup fails with an error
        const source: ImageSource = {uri: MOCK_URI};
        const error = new Error('Cache error');
        mockGetCachedAttachment.mockRejectedValue(error);
        currentAttachmentID = 'test-id';

        // When the hook resolves after the rejection
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});

        // Then it should fall back to the original source so the image is still displayed, and log the failure for debugging
        await waitFor(() => {
            expect(result.current).toBe(source);
        });

        expect(mockLogHmmm).toHaveBeenCalledWith('[AttachmentCache] Failed to get cached attachment', {message: error.message});
    });

    it('should return source when URI starts with file: and cachedUri is null', () => {
        // Given a source that is already a local file:// URL while the cache fetch is still pending
        const source: ImageSource = {uri: 'file:///path/to/local/file.jpg'};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
        currentAttachmentID = 'test-id';

        // When the hook is invoked
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});

        // Then it should return the file:// source as-is to avoid a blank flash while the cache resolves
        expect(result.current).toBe(source);
    });

    it('should not call getCachedAttachment when attachmentMetadata is loading', () => {
        // Given a source whose Onyx metadata is still loading
        const source: ImageSource = {uri: MOCK_URI};
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);
        currentAttachmentID = 'test-id';

        // When the hook is invoked
        renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});

        // Then it should not call getCachedAttachment because caching should wait until metadata is available to avoid unnecessary or stale fetches
        expect(mockGetCachedAttachment).not.toHaveBeenCalled();
    });

    it('should return null while cache fetch is in progress', () => {
        // Given a source whose cache fetch will never resolve (simulating an in-progress fetch)
        const source: ImageSource = {uri: MOCK_URI};
        mockGetCachedAttachment.mockReturnValue(new Promise(() => {}));
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);
        currentAttachmentID = 'test-id';

        // When the hook is invoked before the fetch settles
        const {result} = renderHook(() => useCachedAttachmentSourceNative(source), {wrapper: Wrapper});

        // Then it should return null so the consumer can show a loading state instead of a stale or broken image
        expect(result.current).toBeNull();
    });

    it('should ignore stale resolutions after the source changes', async () => {
        // Given a source that changes, causing two concurrent cache fetches (one stale, one fresh)
        const source1: ImageSource = {uri: 'https://example.com/a.png'};
        const source2: ImageSource = {uri: 'https://example.com/b.png'};
        const staleUri = 'file:///stale-url';
        const freshUri = 'file:///fresh-url';
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);
        mockGetAttachmentLocalSource.mockReturnValue(undefined);
        currentAttachmentID = 'test-id';

        const resolvers: Array<(value: string) => void> = [];
        mockGetCachedAttachment.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    resolvers.push(resolve);
                }),
        );

        const {result, rerender} = renderHook(({source}: {source: ImageSource}) => useCachedAttachmentSourceNative(source), {
            initialProps: {source: source1},
            wrapper: Wrapper,
        });

        // When the source changes before the first fetch resolves, and the stale fetch resolves first
        rerender({source: source2});

        await act(async () => {
            resolvers.at(0)?.(staleUri);
        });
        // Then the stale resolution must not update state because it belongs to a source that is no longer current
        expect(result.current).toBeNull();

        // When the fresh fetch resolves
        await act(async () => {
            resolvers.at(1)?.(freshUri);
        });
        // Then the hook should settle on the fresh result because only the current source's fetch should update state
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
        // Given a BaseImage with an attachmentID whose cached URI differs from the original source
        mockUseOnyx.mockReturnValue([{attachmentID: 'test-id', source: NATIVE_LOCAL_SOURCE}, {status: 'loaded'}]);
        mockGetCachedAttachment.mockResolvedValue(NATIVE_CACHED_URI);

        // When the BaseImage renders
        render(
            <AttachmentIDContextProvider attachmentID="test-id">
                <BaseImageNative source={{uri: MOCK_URI}} />
            </AttachmentIDContextProvider>,
        );

        // Then expo-image should receive attachmentID as the recyclingKey so it reuses the same native view instead of remounting when the cached URI changes
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await waitFor(() => expect(mockImageComponent.mock.calls.at(-1)?.[0]?.recyclingKey).toBe('test-id'));
    });
});
