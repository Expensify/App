import {render, screen} from '@testing-library/react-native';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import React from 'react';
import {NativeComponentRegistry, StyleSheet, View} from 'react-native';

type StyleAttributes = Record<string, unknown> & {
    display?: {process?: (value: unknown) => unknown};
};

type RegisteredViewConfig = {
    uiViewClassName: string;
    validAttributes: {style?: StyleAttributes};
};

/**
 * Loads the native wrapper and returns the name and the view config it registers. Jest (jest-expo) resolves the
 * `.native` variant by default and stubs NativeComponentRegistry.get with a mock, so the registration is only
 * observable through the recorded call.
 */
function registerNativeWrapper(): {name: string; viewConfig: RegisteredViewConfig} {
    jest.isolateModules(() => {
        require<{default: React.ComponentType<PropsWithChildren<{style: ViewStyle}>>}>('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper');
    });

    const call = jest.mocked(NativeComponentRegistry.get).mock.calls.at(-1);
    if (!call) {
        throw new Error('The native wrapper did not register a component');
    }

    const [name, viewConfigProvider] = call;
    // The registry is typed with the internal React Native view config type, so the shape used by these assertions
    // is spelled out above and narrowed here. There is no exported type to reuse for this internal module.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {name, viewConfig: viewConfigProvider() as RegisteredViewConfig};
}

describe('CustomViewWrapper (native)', () => {
    beforeEach(() => {
        jest.mocked(NativeComponentRegistry.get).mockClear();
    });

    it('registers a native component under the CustomViewWrapper name', () => {
        expect(registerNativeWrapper().name).toBe('CustomViewWrapper');
    });

    it('registers it exactly once, no matter how many screens render it', () => {
        registerNativeWrapper();

        expect(NativeComponentRegistry.get).toHaveBeenCalledTimes(1);
    });

    it('reuses the plain view class, so it behaves like any other view', () => {
        expect(registerNativeWrapper().viewConfig.uiViewClassName).toBe('RCTView');
    });

    it('resolves the display style to contents, which neutralizes the display none React commits when hiding', () => {
        expect(registerNativeWrapper().viewConfig.validAttributes.style?.display?.process?.('none')).toBe('contents');
    });

    it('resolves the display style to contents for every value it is given', () => {
        expect(registerNativeWrapper().viewConfig.validAttributes.style?.display?.process?.('flex')).toBe('contents');
    });

    it('keeps the standard style attributes so the wrapper still lays its children out', () => {
        expect(registerNativeWrapper().viewConfig.validAttributes.style).toEqual(
            expect.objectContaining({
                flex: true,
                width: true,
                height: true,
            }),
        );
    });
});

/**
 * The view config can only neutralize the hiding, it cannot carry accessibility state, so the wrapper renders a
 * second view inside it for that - the same pair React Navigation 8 renders in its ActivityView. Reading the
 * pointer events off that view means reading the style of the outermost view the wrapper renders.
 */
function getContainerStyle() {
    return StyleSheet.flatten(screen.UNSAFE_getAllByType(View).at(0)?.props.style);
}

function renderWrapper(inert: boolean) {
    return render(
        <CustomViewWrapper
            style={{flex: 1}}
            inert={inert}
        >
            <View testID="wrapped-content" />
        </CustomViewWrapper>,
    );
}

describe('CustomViewWrapper (native) accessibility', () => {
    it('leaves content that is not inert reachable', () => {
        renderWrapper(false);

        expect(screen.queryByTestId('wrapped-content')).not.toBeNull();
    });

    it('lets touches through to content that is not inert', () => {
        renderWrapper(false);

        expect(getContainerStyle().pointerEvents).toBe('box-none');
    });

    it('takes inert content out of the accessibility tree while keeping it rendered', () => {
        renderWrapper(true);

        expect(screen.queryByTestId('wrapped-content')).toBeNull();
        expect(screen.queryByTestId('wrapped-content', {includeHiddenElements: true})).not.toBeNull();
    });

    it('stops inert content from receiving touches', () => {
        renderWrapper(true);

        expect(getContainerStyle().pointerEvents).toBe('none');
    });
});
