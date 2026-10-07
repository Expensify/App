import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import Image from '@components/Image';
import BaseImageNative from '@components/Image/BaseImage.native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import type {ImageProps as ExpoImageProps} from 'expo-image';

import React from 'react';

const mockExpoImage = jest.fn<null, [props: ExpoImageProps]>(() => null);

jest.mock('expo-image', () => ({
    get Image() {
        return mockExpoImage;
    },
}));

function getLastExpoImageProps(): ExpoImageProps {
    const props = mockExpoImage.mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Expected Expo Image to be rendered');
    }
    return props;
}

describe('Image recyclingKey', () => {
    beforeEach(() => {
        mockExpoImage.mockClear();
    });

    it('keeps one recycling key while an attachment source changes', () => {
        // Given the same attachment rendered from its picker, cache, and remote sources
        const {rerender} = render(
            <BaseImageNative
                source={{uri: 'file:///picker/image.jpg'}}
                recyclingKey="attachment-1"
            />,
        );

        // When the attachment source changes to the local cache and then the remote URL
        rerender(
            <BaseImageNative
                source={{uri: 'file:///cache/image.jpg'}}
                recyclingKey="attachment-1"
            />,
        );
        rerender(
            <BaseImageNative
                source={{uri: 'https://example.com/image.jpg'}}
                recyclingKey="attachment-1"
            />,
        );

        // Then the native view keeps the attachment identity instead of deriving it from the URI
        expect(getLastExpoImageProps().recyclingKey).toBe('attachment-1');
    });

    it('re-renders when only the attachment recycling key changes', () => {
        // Given an image wrapper with a stable source object
        const source = {uri: 'https://example.com/image.jpg'};
        const renderImage = (recyclingKey: string) => (
            <ComposeProviders components={[ThemeProvider, ThemeStylesProvider, OnyxListItemProvider]}>
                {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
                <Image
                    source={source}
                    recyclingKey={recyclingKey}
                />
            </ComposeProviders>
        );
        const {rerender} = render(renderImage('first'));

        // When only the attachment identity changes
        rerender(renderImage('second'));

        // Then the new key reaches the native image view
        expect(getLastExpoImageProps().recyclingKey).toBe('second');
    });
});
