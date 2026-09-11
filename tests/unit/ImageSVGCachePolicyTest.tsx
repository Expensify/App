import {render} from '@testing-library/react-native';

import type {ImageProps as ExpoImageProps} from 'expo-image';

import React from 'react';

import ImageSVGAndroid from '../../src/components/ImageSVG/index.android';
import ImageSVGiOS from '../../src/components/ImageSVG/index.ios';

const mockClearMemoryCache = jest.fn(() => Promise.resolve(true));

const mockImageComponent = Object.assign(
    jest.fn<null, [props: ExpoImageProps]>(() => null),
    {
        clearMemoryCache: mockClearMemoryCache,
    },
);

jest.mock('expo-image', () => ({
    get Image() {
        return mockImageComponent;
    },
}));

jest.mock('@libs/getImageRecyclingKey', () =>
    jest.fn((source: unknown) => {
        if (typeof source === 'number') {
            return String(source);
        }
        if (typeof source === 'object' && source !== null && 'uri' in source && typeof source.uri === 'string') {
            return source.uri;
        }
        return undefined;
    }),
);

const MOCK_STATIC_SOURCE = 42;

function getFirstCallProps(): ExpoImageProps {
    const firstCall = mockImageComponent.mock.calls.at(0);
    if (!firstCall) {
        throw new Error('Expected Expo Image to be called');
    }
    return firstCall[0];
}

describe('ImageSVG cache policy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('iOS implementation', () => {
        it('should use memory-disk cache policy for static image sources', () => {
            render(<ImageSVGiOS src={MOCK_STATIC_SOURCE} />);

            expect(mockImageComponent).toHaveBeenCalled();
            const props = getFirstCallProps();
            expect(props.cachePolicy).toBe('memory-disk');
        });

        it('should set recyclingKey for static image sources', () => {
            render(<ImageSVGiOS src={MOCK_STATIC_SOURCE} />);

            const props = getFirstCallProps();
            expect(props.recyclingKey).toBe(String(MOCK_STATIC_SOURCE));
        });

        it('should render React component sources directly without expo-image Image', () => {
            const MockSvgComponent = jest.fn(() => null);
            render(<ImageSVGiOS src={MockSvgComponent} />);

            expect(mockImageComponent).not.toHaveBeenCalled();
            expect(MockSvgComponent).toHaveBeenCalled();
        });

        it('should return null when src is undefined', () => {
            const {toJSON} = render(<ImageSVGiOS src={undefined} />);

            expect(toJSON()).toBeNull();
            expect(mockImageComponent).not.toHaveBeenCalled();
        });
    });

    describe('Android implementation', () => {
        it('should use memory cache policy for static image sources', () => {
            render(<ImageSVGAndroid src={MOCK_STATIC_SOURCE} />);

            expect(mockImageComponent).toHaveBeenCalled();
            const props = getFirstCallProps();
            expect(props.cachePolicy).toBe('memory');
        });

        it('should set recyclingKey for static image sources', () => {
            render(<ImageSVGAndroid src={MOCK_STATIC_SOURCE} />);

            const props = getFirstCallProps();
            expect(props.recyclingKey).toBe(String(MOCK_STATIC_SOURCE));
        });

        it('should clear memory cache on unmount to prevent memory leaks', () => {
            const {unmount} = render(<ImageSVGAndroid src={MOCK_STATIC_SOURCE} />);

            expect(mockClearMemoryCache).not.toHaveBeenCalled();
            unmount();
            expect(mockClearMemoryCache).toHaveBeenCalled();
        });

        it('should render React component sources directly without expo-image Image', () => {
            const MockSvgComponent = jest.fn(() => null);
            render(<ImageSVGAndroid src={MockSvgComponent} />);

            expect(mockImageComponent).not.toHaveBeenCalled();
            expect(MockSvgComponent).toHaveBeenCalled();
        });

        it('should return null when src is undefined', () => {
            const {toJSON} = render(<ImageSVGAndroid src={undefined} />);

            expect(toJSON()).toBeNull();
            expect(mockImageComponent).not.toHaveBeenCalled();
        });
    });
});
