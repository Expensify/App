/**
 * Cover/reveal contract of the authenticated image cache once the Home tab sits under `ScreenActivityWrapper`.
 *
 * `useCachedImageSource` runs inside every `BaseImage` on web, so the receipt thumbnails and the card feed icons of
 * the Home tab all go through it. A cover cleans its effect up and a reveal runs the body again for a uri that never
 * changed, so without the retained resolution every RHP close would blank each thumbnail and look it up in the Cache
 * API again. The suite pins that a round trip resolves nothing new and never puts the loading state back on screen,
 * while a real uri change still resolves from scratch and a real unmount still revokes every object URL.
 */
import {act, render, screen} from '@testing-library/react-native';

import useCachedImageSource from '@hooks/useCachedImageSource';

import CONST from '@src/CONST';

import type {ImageSource} from 'expo-image';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import createMock from '../../utils/createMock';
import renderScreenWithCover, {ScreenCover} from '../../utils/ScreenCoverHarness';

const MOCK_URI = 'https://example.com/receipt.png';
const OTHER_URI = 'https://example.com/other-receipt.png';
// eslint-disable-next-line @typescript-eslint/naming-convention
const MOCK_HEADERS = {'X-Auth-Token': 'token123'};
const MOCK_BLOB = new Blob(['image-data'], {type: 'image/png'});

/** What the probe renders while the hook returns null, which is the frame with no image on screen. */
const LOADING = 'loading';

let mockCacheMatch: jest.Mock;
let mockCachePut: jest.Mock;
let mockCachesOpen: jest.Mock;
let mockCreateObjectURL: jest.Mock;
let mockRevokeObjectURL: jest.Mock;
let createdObjectURLs: string[];
let revokedObjectURLs: string[];
let observedSources: string[];

const createMockResponse = (ok = true) => {
    const clone = jest.fn<Response, []>();
    const response = createMock<Response>({
        ok,
        blob: jest.fn().mockResolvedValue(MOCK_BLOB),
        clone,
    });
    clone.mockReturnValue(response);
    return response;
};

/** Renders what `BaseImage` would hand to expo-image and records it on every commit. */
function CachedImageProbe({source}: {source: ImageSource}) {
    const resolvedSource = useCachedImageSource(source);
    const renderedUri = resolvedSource === null ? LOADING : (resolvedSource?.uri ?? LOADING);

    useEffect(() => {
        observedSources.push(renderedUri);
    });

    return (
        <View
            testID="rendered-image-source"
            accessibilityLabel={renderedUri}
        />
    );
}

function renderedSource(): unknown {
    return screen.getByTestId('rendered-image-source').props.accessibilityLabel;
}

/** Waits for the resolution chain, which is a few microtasks deep, to reach state. */
async function settleResolution() {
    await act(async () => {
        await Promise.resolve();
    });
}

beforeEach(() => {
    createdObjectURLs = [];
    revokedObjectURLs = [];
    observedSources = [];

    mockCacheMatch = jest.fn().mockResolvedValue(null);
    mockCachePut = jest.fn().mockResolvedValue(undefined);
    mockCachesOpen = jest.fn().mockResolvedValue({match: mockCacheMatch, put: mockCachePut});

    Object.defineProperty(window, 'caches', {
        value: {
            open: mockCachesOpen,
            delete: jest.fn().mockResolvedValue(true),
            has: jest.fn().mockResolvedValue(false),
            keys: jest.fn().mockResolvedValue([]),
            match: jest.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
    });

    jest.spyOn(global, 'fetch').mockResolvedValue(createMockResponse());

    // A fresh URL per call, so a restored image is told apart from the one the mount created.
    mockCreateObjectURL = jest.fn(() => {
        const objectURL = `blob:mock/${createdObjectURLs.length + 1}`;
        createdObjectURLs.push(objectURL);
        return objectURL;
    });
    mockRevokeObjectURL = jest.fn((objectURL: string) => {
        revokedObjectURLs.push(objectURL);
    });
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useCachedImageSource under a screen cover', () => {
    it('resolves the uri once on mount and puts the object URL on screen', async () => {
        renderScreenWithCover(<CachedImageProbe source={{uri: MOCK_URI, headers: MOCK_HEADERS}} />);
        await settleResolution();

        expect(mockCachesOpen).toHaveBeenCalledWith(CONST.CACHE_NAME.AUTH_IMAGES);
        expect(mockCacheMatch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(renderedSource()).toBe(createdObjectURLs.at(-1));
    });

    it('resolves nothing again and never blanks the image across a hide and reveal', async () => {
        const home = renderScreenWithCover(<CachedImageProbe source={{uri: MOCK_URI, headers: MOCK_HEADERS}} />);
        await settleResolution();

        const commitsAtResolution = observedSources.length;

        await home.hide();
        await home.reveal();
        await settleResolution();

        expect(mockCachesOpen).toHaveBeenCalledTimes(1);
        expect(mockCacheMatch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(observedSources.slice(commitsAtResolution)).not.toContain(LOADING);
        expect(renderedSource()).toBe(createdObjectURLs.at(-1));
    });

    it('keeps the fallback source of a failed resolution across a hide and reveal', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue(createMockResponse(false));

        const home = renderScreenWithCover(<CachedImageProbe source={{uri: MOCK_URI, headers: MOCK_HEADERS}} />);
        await settleResolution();

        expect(renderedSource()).toBe(MOCK_URI);
        const commitsAtResolution = observedSources.length;

        await home.hide();
        await home.reveal();
        await settleResolution();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(observedSources.slice(commitsAtResolution)).not.toContain(LOADING);
        expect(renderedSource()).toBe(MOCK_URI);
    });

    it('resolves from scratch when the uri actually changes', async () => {
        const {rerender} = render(
            <ScreenCover isCovered={false}>
                <CachedImageProbe source={{uri: MOCK_URI, headers: MOCK_HEADERS}} />
            </ScreenCover>,
        );
        await settleResolution();

        const objectURLOfFirstUri = createdObjectURLs.at(-1);

        rerender(
            <ScreenCover isCovered={false}>
                <CachedImageProbe source={{uri: OTHER_URI, headers: MOCK_HEADERS}} />
            </ScreenCover>,
        );
        await settleResolution();

        expect(mockCacheMatch).toHaveBeenNthCalledWith(2, OTHER_URI);
        expect(global.fetch).toHaveBeenLastCalledWith(OTHER_URI, {headers: MOCK_HEADERS});
        expect(revokedObjectURLs).toContain(objectURLOfFirstUri);
        expect(renderedSource()).toBe(createdObjectURLs.at(-1));
        expect(renderedSource()).not.toBe(objectURLOfFirstUri);
    });

    it('revokes every object URL it created once the screen really unmounts', async () => {
        const home = renderScreenWithCover(<CachedImageProbe source={{uri: MOCK_URI, headers: MOCK_HEADERS}} />);
        await settleResolution();

        await home.hide();
        await home.reveal();
        await settleResolution();

        expect(revokedObjectURLs).not.toContain(createdObjectURLs.at(-1));

        home.unmount();

        expect(createdObjectURLs.length).toBeGreaterThan(0);
        expect(revokedObjectURLs.toSorted()).toEqual(createdObjectURLs.toSorted());
    });
});
