import {fireEvent, render, screen} from '@testing-library/react-native';

import ReanimatedModal from '@components/Modal/ReanimatedModal';
import OverlayHiddenContext from '@components/Modal/ReanimatedModal/OverlayHiddenContext';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import type {ComponentType, ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useContext, useEffect} from 'react';
import {View} from 'react-native';

type MockViewProps = {testID?: string; style?: StyleProp<ViewStyle>; children?: ReactNode};
type MockReactNativePrimitives = {View: ComponentType<MockViewProps>};
type MockReactPrimitives = {useEffect: typeof useEffect};

// The presentation-only subtrees are stubbed so the suite exercises ReanimatedModal's real logic: the
// OverlayHiddenContext provider, the overlay-hidden state, the container hide style, and the backdrop
// gating. (The pointer-events effect on the RNW portal root is web-only DOM behavior and is exercised live.)
jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    function MockFocusTrapForModal({children}: {children: ReactNode}) {
        return children;
    }
    return MockFocusTrapForModal;
});

jest.mock('@components/Modal/ReanimatedModal/Backdrop', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    function MockBackdrop() {
        return <ReactNativeActual.View testID="reanimatedModalBackdrop" />;
    }
    return MockBackdrop;
});

jest.mock('@components/Modal/ReanimatedModal/Container', () => {
    const ReactActual = jest.requireActual<MockReactPrimitives>('react');
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    function MockContainer({children, style, onOpenCallBack}: {children: ReactNode; style?: StyleProp<ViewStyle>; onOpenCallBack?: () => void}) {
        ReactActual.useEffect(() => {
            onOpenCallBack?.();
        }, []);
        return (
            <ReactNativeActual.View
                testID="reanimatedModalContainer"
                style={style}
            >
                {children}
            </ReactNativeActual.View>
        );
    }
    return MockContainer;
});

function flattenStyle(style: unknown): Record<string, unknown> {
    if (Array.isArray(style)) {
        let merged: Record<string, unknown> = {};
        for (const part of style) {
            merged = {...merged, ...flattenStyle(part)};
        }
        return merged;
    }
    if (typeof style !== 'object' || style === null) {
        return {};
    }
    return {...style};
}

// A modal child standing in for the CalendarPicker: it consumes OverlayHiddenContext and asks the hosting
// modal to hide/show itself, exactly like the picker does when the year-selector route opens/closes.
function HideRequester() {
    const setOverlayHidden = useContext(OverlayHiddenContext);
    return (
        <View>
            <View testID={setOverlayHidden ? 'hasProvider-true' : 'hasProvider-false'} />
            <PressableWithoutFeedback
                accessibilityLabel="requestHide"
                testID="requestHide"
                onPress={() => setOverlayHidden?.(true)}
            />
            <PressableWithoutFeedback
                accessibilityLabel="requestShow"
                testID="requestShow"
                onPress={() => setOverlayHidden?.(false)}
            />
        </View>
    );
}

// Mirrors the CalendarPicker unmount cleanup (setOverlayHidden(false) on effect teardown).
function HideOnMount() {
    const setOverlayHidden = useContext(OverlayHiddenContext);
    useEffect(() => {
        setOverlayHidden?.(true);
        return () => setOverlayHidden?.(false);
    }, [setOverlayHidden]);
    return null;
}

function renderModal(children: ReactNode) {
    return render(
        <ReanimatedModal
            isVisible
            hasBackdrop
            onBackdropPress={jest.fn()}
            onBackButtonPress={jest.fn()}
            // required by GestureHandlerProps since the latest main; swipes aren't exercised here
            swipeThreshold={0}
        >
            {children}
        </ReanimatedModal>,
    );
}

describe('ReanimatedModal OverlayHiddenContext', () => {
    test('provides the context to its content', () => {
        renderModal(<HideRequester />);
        expect(screen.getByTestId('hasProvider-true')).toBeTruthy();
    });

    test('hides in place when content requests it: container gets the hide style and the backdrop is dropped, both restored on release', () => {
        renderModal(<HideRequester />);

        // Visible baseline: backdrop mounted, no hide style on the container.
        expect(screen.getByTestId('reanimatedModalBackdrop')).toBeTruthy();
        expect(flattenStyle(screen.getByTestId('reanimatedModalContainer').props.style).opacity).toBeUndefined();

        // Content asks the modal to hide (what CalendarPicker does when the year selector opens): the modal
        // stays mounted — its content/state survive — but is visually hidden and backdrop-less. (visibility:
        // 'hidden' rides along via styles.visibilityHidden, a web-only platform-split utility that is an empty
        // object under jest's native module resolution, so opacity is the observable signal here.)
        fireEvent.press(screen.getByTestId('requestHide'));
        expect(screen.queryByTestId('reanimatedModalBackdrop')).toBeNull();
        expect(flattenStyle(screen.getByTestId('reanimatedModalContainer').props.style).opacity).toBe(0);
        expect(screen.getByTestId('hasProvider-true')).toBeTruthy();

        // Content releases the hide (year selector closed): backdrop and visibility restored.
        fireEvent.press(screen.getByTestId('requestShow'));
        expect(screen.getByTestId('reanimatedModalBackdrop')).toBeTruthy();
        expect(flattenStyle(screen.getByTestId('reanimatedModalContainer').props.style).opacity).toBeUndefined();
    });

    test('a consumer unmounting while hidden releases the hide (effect cleanup)', () => {
        renderModal(<HideOnMount />);
        expect(screen.queryByTestId('reanimatedModalBackdrop')).toBeNull();

        // Unmounting the requester (e.g. the picker view is torn down) must not leave the modal stuck hidden.
        renderModal(<View />);
        expect(screen.getByTestId('reanimatedModalBackdrop')).toBeTruthy();
    });
});
