import Container from '@components/Modal/ReanimatedModal/Container/index.web';

import type Animated from 'react-native-reanimated';

import React from 'react';
import {View} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

// The shipped reanimated mock rebuilds a shared value on every render, so it cannot express the one property this
// suite is about: a shared value keeps its identity and its content across an effect remount. This gives
// useSharedValue back that contract and leaves the rest of the mock alone.
jest.mock('react-native-reanimated', () => {
    const reanimatedMock = jest.requireActual<typeof Animated>('react-native-reanimated/mock');
    const {useState} = jest.requireActual<typeof React>('react');

    return {
        ...reanimatedMock,
        useSharedValue: (initial: number) => {
            const [sharedValue] = useState(() => {
                let current = initial;
                return {
                    get: () => current,
                    set: (next: number) => {
                        current = next;
                    },
                };
            });
            return sharedValue;
        },
    };
});

/** BaseModal's own default. The web container only forwards it, but the prop bag it takes requires it. */
const SWIPE_THRESHOLD = 150;

function renderContainer(onOpenCallBack: () => void) {
    return renderScreenWithCover(
        <Container
            animationIn="fadeIn"
            animationOut="fadeOut"
            onOpenCallBack={onOpenCallBack}
            onCloseCallBack={jest.fn()}
            swipeThreshold={SWIPE_THRESHOLD}
        >
            <View testID="modal-body" />
        </Container>,
    );
}

/**
 * Home reaches the web modal container through its popover menus, so a modal can be open while the Home tab is
 * covered. The container starts its open animation from an effect, and a cover and reveal remounts that effect with
 * the animation already finished. Replaying it would report a second open, which the modal turns into `onModalShow`
 * and every consumer of it into work the user never asked for, such as moving focus back into an emoji search input.
 */
describe('ReanimatedModal Container', () => {
    it('reports the open exactly once across a cover and reveal', async () => {
        const onOpenCallBack = jest.fn();
        const screenCover = renderContainer(onOpenCallBack);
        expect(onOpenCallBack).toHaveBeenCalledTimes(1);

        await screenCover.hide();
        await screenCover.reveal();

        expect(onOpenCallBack).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });

    it('animates again for the next modal that opens', () => {
        const firstOpenCallBack = jest.fn();
        renderContainer(firstOpenCallBack).unmount();

        const secondOpenCallBack = jest.fn();
        const screenCover = renderContainer(secondOpenCallBack);

        expect(secondOpenCallBack).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });
});
