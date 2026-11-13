import getAndroidAutoGrowHeightInputContainerStyles from '@src/styles/utils/autoGrowHeightInputContainerStyles/index.android';
import getIOSAutoGrowHeightInputContainerStyles from '@src/styles/utils/autoGrowHeightInputContainerStyles/index.native';
import variables from '@src/styles/variables';

import type {ViewStyle} from 'react-native';

// Jest resolves platform files first, so the web file is loaded by its explicit path
const getWebAutoGrowHeightInputContainerStyles = jest.requireActual<{default: (shouldKeepMinimumHeight: boolean) => ViewStyle}>(
    '@src/styles/utils/autoGrowHeightInputContainerStyles/index.ts',
).default;

describe('getAutoGrowHeightInputContainerStyles', () => {
    it('starts the Android slot at one input row and lets it grow', () => {
        // Given the Android slot style, used inside a form scroll view that sizes a `flex: 1` slot from its content
        // When the style is read
        const style = getAndroidAutoGrowHeightInputContainerStyles();

        // Then it starts from one input row instead of the input's content, so a tall input cannot make the form taller,
        // and it can still grow into free space but never shrink below that row on a short screen
        expect(style).toEqual({flexGrow: 1, height: variables.componentSizeLarge});
        expect(style).not.toHaveProperty('flex');
        expect(style).not.toHaveProperty('flexShrink');
    });

    it.each([
        [false, undefined],
        [true, variables.componentSizeLarge],
    ])('fills the web form and keeps one input row only when opted in (minimum opted in: %s)', (shouldKeepMinimumHeight, expectedMinimum) => {
        // Given a web form that bounds its content to the viewport, where Search keeps the default slot and editor forms opt into a minimum
        // When the web slot style is read
        const style = getWebAutoGrowHeightInputContainerStyles(shouldKeepMinimumHeight);

        // Then the slot fills its form, and only the opted-in slot keeps one input row on a very short viewport
        expect(style.flex).toBe(1);
        expect(style.minHeight).toBe(expectedMinimum);
    });

    it('fills the iOS form without a minimum', () => {
        // Given the iOS slot style, where forms keep intrinsic scrolling instead of bounding their content
        // When the style is read
        const style = getIOSAutoGrowHeightInputContainerStyles();

        // Then the slot fills its form and never needs a minimum height
        expect(style).toEqual({flex: 1});
    });
});
