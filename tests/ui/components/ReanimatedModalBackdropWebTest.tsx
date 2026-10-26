import {render} from '@testing-library/react-native';

import Backdrop from '@components/Modal/ReanimatedModal/Backdrop/index.web';

import {isRecord} from '@libs/ObjectUtils';

import React from 'react';
import {StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';

describe('ReanimatedModal web Backdrop', () => {
    it.each([
        ['default backdrop', undefined],
        ['custom backdrop', <Animated.View key="custom" />],
    ])('renders the %s without an entering keyframe', (_, customBackdrop) => {
        // Given a visible modal backdrop on web
        const {UNSAFE_root: root} = render(
            <Backdrop
                style={undefined}
                isBackdropVisible
                customBackdrop={customBackdrop}
                onBackdropPress={jest.fn()}
            />,
        );

        // When we look for an entering animation on any rendered element
        const elementsWithEntering = root.findAll((node) => node.props.entering !== undefined);

        // Then there is none, because on web Reanimated hides the element until the keyframe starts and can delete the keyframe
        // before the next animation frame (for example in a background tab), which would leave the backdrop hidden for good
        expect(elementsWithEntering).toHaveLength(0);
    });

    it.each([
        ['default backdrop', undefined],
        ['custom backdrop', <Animated.View key="custom" />],
    ])('fills the modal root with the %s instead of taking the window size, and can be pressed anywhere on it', (_, customBackdrop) => {
        // Given a visible backdrop on web, handed only its color the way ReanimatedModal passes it
        const onBackdropPress = jest.fn();
        const {UNSAFE_root: root} = render(
            <Backdrop
                style={{backgroundColor: 'black'}}
                isBackdropVisible
                customBackdrop={customBackdrop}
                onBackdropPress={onBackdropPress}
            />,
        );

        // When we read the style of the dimming view and of the wrapper it is positioned against
        const dimmingView = root.findAll((node) => node.props.exiting !== undefined).at(0);
        const dimmingStyle = StyleSheet.flatten<unknown>(dimmingView?.props.style);
        const dimmingStyleRecord = isRecord(dimmingStyle) ? dimmingStyle : {};
        const wrapperStyle = StyleSheet.flatten<unknown>(dimmingView?.parent?.props.style);
        const wrapperStyleRecord = isRecord(wrapperStyle) ? wrapperStyle : {};

        // Then both stretch to every edge of the modal's fixed root with no height of their own. On mobile Safari a window-sized
        // backdrop would stop at the visual viewport, above the keyboard, and leave the page showing between a bottom sheet and
        // the keyboard, and a wrapper of no size would give the dimming view, positioned against it, no area to press
        const absoluteFill = {position: 'absolute', top: 0, bottom: 0, left: 0, right: 0};
        expect(dimmingStyleRecord).toEqual(expect.objectContaining(absoluteFill));
        expect(dimmingStyleRecord.height).toBeUndefined();
        expect(wrapperStyleRecord).toEqual(expect.objectContaining(absoluteFill));
        expect(wrapperStyleRecord.height).toBeUndefined();
    });
});
