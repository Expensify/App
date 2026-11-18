import {render} from '@testing-library/react-native';

import type {ImageProps} from '@components/Image/types';

import React from 'react';

import type * as WebImageViewModule from '../../src/components/ImageView/index';

const mockImageProps = jest.fn<void, [ImageProps]>();

jest.mock('@components/Image', () => (props: ImageProps) => {
    mockImageProps(props);
    return null;
});
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => false}));

// Jest prefers .native files, so load the web implementation by its file name.
const ImageView = jest.requireActual<typeof WebImageViewModule>('../../src/components/ImageView/index.tsx').default;

describe('ImageView source', () => {
    beforeEach(() => {
        mockImageProps.mockClear();
    });

    it('passes a static image asset to the image unchanged', () => {
        // Given a static image asset, which React Native represents as a number
        const staticImage = 42;

        // When the image view renders it
        render(
            <ImageView
                url={staticImage}
                fileName="receipt.png"
            />,
        );

        // Then the image gets the asset itself, because wrapping it as {uri: 42} cannot load
        expect(mockImageProps).toHaveBeenLastCalledWith(expect.objectContaining({source: staticImage}));
    });

    it('wraps a URL in a uri source', () => {
        // Given a remote image URL
        const url = 'https://www.expensify.com/receipt.png';

        // When the image view renders it
        render(
            <ImageView
                url={url}
                fileName="receipt.png"
            />,
        );

        // Then the image gets a uri source, as before
        expect(mockImageProps).toHaveBeenLastCalledWith(expect.objectContaining({source: {uri: url}}));
    });
});
