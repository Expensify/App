import {render} from '@testing-library/react-native';

import AvatarImage from '@components/Avatar/primitives/AvatarImage';
import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import CONST from '@src/CONST';
import createThemeStyles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import createStyleUtils from '@src/styles/utils';

import type {ImageStyle, StyleProp} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const AVATAR_URL = 'https://example.com/uploaded-avatar.jpg';

// Captures the style the real (memoized) Image forwards down to BaseImage, which is what actually sizes the avatar.
const mockBaseImageStyleRef: {current?: StyleProp<ImageStyle>} = {current: undefined};

// Renders a bare React Native <View> as a stand-in for the mocked BaseImage. Prefixed with
// `mock` so the hoisted jest.mock factory below is allowed to reference it.
function mockRenderView() {
    return <View testID="BaseImage" />;
}

// Only BaseImage is mocked, so the real `Image` wrapper — and its React.memo comparator — stays in the tree.
jest.mock('@components/Image/BaseImage', () => {
    function MockBaseImage({style}: {style?: StyleProp<ImageStyle>}) {
        mockBaseImageStyleRef.current = style;
        return mockRenderView();
    }

    return {__esModule: true, default: MockBaseImage};
});

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

const {getAvatarSize} = createStyleUtils(defaultTheme, createThemeStyles(defaultTheme));

/** Digs the rendered width out of the (possibly nested) style array BaseImage received. */
function getRenderedWidth(): number | undefined {
    const {width} = StyleSheet.flatten(mockBaseImageStyleRef.current);
    return typeof width === 'number' ? width : undefined;
}

function renderAvatarImage(size: React.ComponentProps<typeof AvatarImage>['size']) {
    return (
        <ComposeProviders components={[ThemeProvider, ThemeStylesProvider, OnyxListItemProvider]}>
            <AvatarImage
                avatarSource={AVATAR_URL}
                size={size}
                shape={CONST.AVATAR_SHAPE.CIRCLE}
                onImageError={() => {}}
            />
        </ComposeProviders>
    );
}

describe('AvatarImage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockBaseImageStyleRef.current = undefined;
    });

    it('resizes the image when the size changes but the source stays the same', async () => {
        const {rerender} = render(renderAvatarImage(CONST.AVATAR_SIZE.DEFAULT));
        await waitForBatchedUpdates();

        expect(getRenderedWidth()).toBe(getAvatarSize(CONST.AVATAR_SIZE.DEFAULT));

        // The Account page swaps the avatar size in place when the viewport crosses the mobile breakpoint,
        // so `size` changes while `avatarSource` does not.
        rerender(renderAvatarImage(CONST.AVATAR_SIZE.XXXX_LARGE));
        await waitForBatchedUpdates();

        expect(getRenderedWidth()).toBe(getAvatarSize(CONST.AVATAR_SIZE.XXXX_LARGE));
    });
});
