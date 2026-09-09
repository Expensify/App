import {act, screen} from '@testing-library/react-native';

import ReanimatedModal from '@components/Modal/ReanimatedModal';
import Text from '@components/Text';

import type {ReactNode} from 'react';
import type {View as RNView} from 'react-native';

import React from 'react';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

/**
 * The real container reports the finished open animation from a reanimated keyframe callback, which never fires under
 * Jest. This stand-in hands that callback to the test so the modal can reach its open state the way it does in the app.
 */
const mockContainer: {reportOpen: () => void} = {reportOpen: () => {}};

jest.mock('@components/Modal/ReanimatedModal/Container', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View: MockView} = jest.requireActual<{View: typeof RNView}>('react-native');

    return {
        __esModule: true,
        default: ({children, onOpenCallBack}: {children: ReactNode; onOpenCallBack: () => void}) => {
            mockContainer.reportOpen = onOpenCallBack;
            return MockReact.createElement(MockView, {testID: 'modal-container'}, children);
        },
    };
});

/** BaseModal's own default, required by the gesture props the modal takes. */
const SWIPE_THRESHOLD = 150;

describe('ReanimatedModal', () => {
    it('keeps an open modal open across a cover and reveal', async () => {
        const onModalWillShow = jest.fn();
        const onModalShow = jest.fn();

        const screenCover = renderScreenWithCover(
            <ReanimatedModal
                isVisible
                swipeThreshold={SWIPE_THRESHOLD}
                onModalWillShow={onModalWillShow}
                onModalShow={onModalShow}
            >
                <Text testID="modal-body">body</Text>
            </ReanimatedModal>,
        );
        act(() => mockContainer.reportOpen());

        expect(onModalWillShow).toHaveBeenCalledTimes(1);
        expect(onModalShow).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('modal-container')).toBeOnTheScreen();

        await screenCover.hide();
        expect(screen.getByTestId('modal-container')).toBeOnTheScreen();

        await screenCover.reveal();

        expect(onModalWillShow).toHaveBeenCalledTimes(1);
        expect(onModalShow).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });
});
