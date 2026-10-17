import {render} from '@testing-library/react-native';

import ConfirmationPage from '@components/ConfirmationPage';
import type {ConfirmationPageProps} from '@components/ConfirmationPage';
import Lottie from '@components/Lottie';

import React from 'react';
// Use React Native Animated to exercise the native Animated.Value dimension accepted by ViewStyle.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

jest.mock('@components/Lottie', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

function renderConfirmationAndGetWebStyle(illustrationStyle?: ConfirmationPageProps['illustrationStyle']) {
    render(
        <ConfirmationPage
            heading="Done"
            illustrationStyle={illustrationStyle}
        />,
    );
    const lottieProps = jest.mocked(Lottie).mock.calls.at(-1)?.at(0);
    expect(lottieProps).toBeDefined();
    if (!lottieProps) {
        throw new Error('ConfirmationPage did not render Lottie');
    }
    return lottieProps.webStyle;
}

describe('ConfirmationPage Lottie web dimensions', () => {
    afterEach(() => {
        jest.mocked(Lottie).mockClear();
    });

    it('preserves compatible dimensions and independently defaults absent dimensions', () => {
        // Given the default dimensions remain available for independently missing width and height.
        const defaults = renderConfirmationAndGetWebStyle();
        expect(defaults).toBeDefined();
        expect(defaults?.width).toBeDefined();
        expect(defaults?.height).toBeDefined();

        // When styles provide supported web dimensions, including a zero width and percentages.
        const zeroWidthStyle = renderConfirmationAndGetWebStyle({width: 0, height: 96});
        const percentageHeightStyle = renderConfirmationAndGetWebStyle({width: 48, height: '75%'});
        const missingHeightStyle = renderConfirmationAndGetWebStyle({width: '50%'});
        const missingWidthStyle = renderConfirmationAndGetWebStyle({height: 64});

        // Then supported dimensions survive and each omitted dimension retains its default.
        expect(zeroWidthStyle).toMatchObject({width: 0, height: 96});
        expect(percentageHeightStyle).toMatchObject({width: 48, height: '75%'});
        expect(missingHeightStyle).toMatchObject({width: '50%', height: defaults?.height});
        expect(missingWidthStyle).toMatchObject({width: defaults?.width, height: 64});
    });

    it('defaults an animated width only at the web boundary and preserves the native style', () => {
        // Given a native animated width cannot be passed to the web animation renderer.
        const defaultWebStyle = renderConfirmationAndGetWebStyle();
        expect(defaultWebStyle).toBeDefined();
        if (!defaultWebStyle) {
            throw new Error('ConfirmationPage did not provide default Lottie web dimensions');
        }
        const animatedWidth = new Animated.Value(40);

        // When the shared component receives both animated and supported dimensions.
        render(
            <ConfirmationPage
                heading="Done"
                illustrationStyle={{width: animatedWidth, height: '75%'}}
            />,
        );
        const lottieProps = jest.mocked(Lottie).mock.calls.at(-1)?.at(0);
        expect(lottieProps).toBeDefined();
        // Then only the web width falls back while the native animation keeps its style.
        expect(lottieProps?.webStyle).toEqual({width: defaultWebStyle.width, height: '75%'});
        expect(lottieProps?.style).toEqual(expect.arrayContaining([expect.objectContaining({width: animatedWidth, height: '75%'})]));
    });
});
