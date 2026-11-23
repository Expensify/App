import {fireEvent, render, screen} from '@testing-library/react-native';

import ThreeDotsMenu from '@components/ThreeDotsMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockPopoverMenuProps = {isVisible?: boolean; onClose?: () => void; onModalHide?: () => void};

// Stable identities, so the menu's reposition effect doesn't re-run on every render
const mockPopoverPosition = {
    calculatePopoverPosition: () => Promise.resolve({horizontal: 0, vertical: 0, width: 40, height: 40}),
};
const menuItems = [{text: 'Delete', onSelected: () => {}, sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL}];

jest.mock('@hooks/usePopoverPosition', () => () => mockPopoverPosition);

jest.mock('@components/PopoverMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
    const {View: RNView, Text: RNText} = jest.requireActual('react-native');
    function MockPopoverMenu({isVisible, onClose, onModalHide}: MockPopoverMenuProps) {
        return (
            <RNView testID={isVisible ? 'popover-open' : 'popover-closed'}>
                <RNText onPress={() => onClose?.()}>Close</RNText>
                <RNText onPress={onModalHide}>Modal gone</RNText>
            </RNView>
        );
    }
    return MockPopoverMenu;
});

describe('ThreeDotsMenu onModalHide', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, initialKeyStates: {[ONYXKEYS.MODAL]: {isVisible: false, willAlertModalBecomeVisible: false}}});
        return waitForBatchedUpdates();
    });

    it('tells the caller once the popover modal is gone, and not before', async () => {
        // Given a menu whose caller wants to know when the popover is gone from the screen
        const onModalHide = jest.fn();
        render(
            <ThreeDotsMenu
                shouldSelfPosition
                testID="three-dots-menu"
                menuItems={menuItems}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                onModalHide={onModalHide}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the menu opens
        fireEvent.press(screen.getByTestId('three-dots-menu'));
        expect(await screen.findByTestId('popover-open')).toBeOnTheScreen();

        // Then the caller has not been told anything yet
        expect(onModalHide).not.toHaveBeenCalled();

        // When the menu is asked to close, while its modal is still animating out
        fireEvent.press(screen.getByText('Close'));
        expect(await screen.findByTestId('popover-closed')).toBeOnTheScreen();

        // Then the caller is still not told, because the popover may still cover the page until its modal is gone
        expect(onModalHide).not.toHaveBeenCalled();

        // When the popover reports that its modal is gone
        fireEvent.press(screen.getByText('Modal gone'));

        // Then the caller is told, so it can react once the popover no longer covers the page
        expect(onModalHide).toHaveBeenCalledTimes(1);
    });

    it('still works for callers that do not pass onModalHide', async () => {
        // Given a menu without the callback
        render(
            <ThreeDotsMenu
                shouldSelfPosition
                testID="three-dots-menu"
                menuItems={menuItems}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the popover reports that its modal is gone
        // Then nothing throws, as before the callback existed
        expect(() => fireEvent.press(screen.getByText('Modal gone'))).not.toThrow();
    });
});
