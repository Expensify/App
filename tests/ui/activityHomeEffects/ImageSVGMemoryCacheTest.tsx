import ImageSVG from '@components/ImageSVG/index.android';

import type {ImageProps as ExpoImageProps} from 'expo-image';

import React from 'react';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

const mockClearMemoryCache = jest.fn(() => Promise.resolve(true));

const mockExpoImage = Object.assign(
    jest.fn<null, [props: ExpoImageProps]>(() => null),
    {clearMemoryCache: mockClearMemoryCache},
);

jest.mock('expo-image', () => ({
    get Image() {
        return mockExpoImage;
    },
}));

/** A static source, which is the branch that renders an expo-image and keeps it in the memory cache. */
const ICON_SOURCE = 42;

/**
 * Every icon on Home renders through ImageSVG, and the Android file used to flush the process-wide expo-image memory
 * cache from an effect cleanup. Under Activity that cleanup runs on every hide, so opening an RHP or a modal over
 * Home emptied the cache for the whole app, icons included, exactly while the covering screen was mounting its own.
 * The images are still on screen at that point, so there is nothing to free.
 */
describe('ImageSVG on Android', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps the shared image memory cache when the screen is covered and revealed', async () => {
        const screenCover = renderScreenWithCover(
            <ImageSVG
                src={ICON_SOURCE}
                testID="navigation-tab-icon"
            />,
        );

        await screenCover.hide();

        expect(mockClearMemoryCache).not.toHaveBeenCalled();

        await screenCover.reveal();
        screenCover.unmount();

        expect(mockClearMemoryCache).not.toHaveBeenCalled();
    });
});
