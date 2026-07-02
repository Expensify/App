import {fireEvent, render, screen} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import React, {useContext, useEffect} from 'react';
import {Text, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import ReanimatedModal from '@components/Modal/ReanimatedModal';
import HiddenForOverlayContext from '@components/Modal/ReanimatedModal/HiddenForOverlayContext';

// The presentation-only subtrees are stubbed so the suite exercises ReanimatedModal's real logic: the
// HiddenForOverlayContext provider, the hidden-for-overlay state, the container hide style, and the backdrop
// gating. (The pointer-events effect on the RNW portal root is web-only DOM behavior and is exercised live.)
jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    function MockFocusTrapForModal({children}: {children: ReactNode}) {
        return children;
    }
    return MockFocusTrapForModal;
});

jest.mock('@components/Modal/ReanimatedModal/Backdrop', () => {
    const ReactNativeActual = jest.requireActual<typeof import('react-native')>('react-native');
    function MockBackdrop() {
        return <ReactNativeActual.View testID="reanimatedModalBackdrop" />;
    }
    return MockBackdrop;
});

jest.mock('@components/Modal/ReanimatedModal/Container', () => {
    const ReactActual = jest.requireActual<typeof import('react')>('react');
    const ReactNativeActual = jest.requireActual<typeof import('react-native')>('react-native');
    function MockContainer({children, style, onOpenCallBack}: {children: ReactNode; style?: unknown; onOpenCallBack?: () => void}) {
        ReactActual.useEffect(() => {
            onOpenCallBack?.();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return (
            <ReactNativeActual.View
                testID="reanimatedModalContainer"
                style={style as StyleProp<ViewStyle>}
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

// A modal child standing in for the CalendarPicker: it consumes HiddenForOverlayContext and asks the hosting
// modal to hide/show itself, exactly like the picker does when the year-selector route opens/closes.
function HideRequester() {
    const setHiddenForOverlay = useContext(HiddenForOverlayContext);
    return (
        <View>
            <Text testID="hasProvider">{setHiddenForOverlay ? 'true' : 'false'}</Text>
            <Text
                testID="requestHide"
                onPress={() => setHiddenForOverlay?.(true)}
            >
                hide
            </Text>
            <Text
                testID="requestShow"
                onPress={() => setHiddenForOverlay?.(false)}
            >
                show
            </Text>
        </View>
    );
}

// Mirrors the CalendarPicker unmount cleanup (setHiddenForOverlay(false) on effect teardown).
function HideOnMount() {
    const setHiddenForOverlay = useContext(HiddenForOverlayContext);
    useEffect(() => {
        setHiddenForOverlay?.(true);
        return () => setHiddenForOverlay?.(false);
    }, [setHiddenForOverlay]);
    return null;
}

function renderModal(children: ReactNode) {
    return render(
        <ReanimatedModal
            isVisible
            hasBackdrop
            onBackdropPress={jest.fn()}
            onBackButtonPress={jest.fn()}
        >
            {children}
        </ReanimatedModal>,
    );
}

describe('ReanimatedModal HiddenForOverlayContext', () => {
    test('provides the context to its content', () => {
        renderModal(<HideRequester />);
        expect(screen.getByTestId('hasProvider')).toHaveTextContent('true');
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
        expect(screen.getByTestId('hasProvider')).toBeTruthy();

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
