import {fireEvent, render, screen} from '@testing-library/react-native';

import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {setModalVisibility, willAlertModalBecomeVisible} from '@libs/actions/Modal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {Profiler} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockPopoverMenuProps = {isVisible?: boolean};

// Stable identities, so the menu's reposition effect doesn't re-run on every render
const mockPopoverPosition = {
    calculatePopoverPosition: () => Promise.resolve({horizontal: 0, vertical: 0, width: 40, height: 40}),
};
const anchorAlignment = {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP};
const menuItems = [{text: 'Delete', onSelected: () => {}}];

jest.mock('@hooks/usePopoverPosition', () => () => mockPopoverPosition);

jest.mock('@components/PopoverMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module; standard RN-mock pattern in this repo.
    const {View: RNView} = jest.requireActual('react-native');
    function MockPopoverMenu({isVisible}: MockPopoverMenuProps) {
        return <RNView testID={isVisible ? 'popover-open' : 'popover-closed'} />;
    }
    return MockPopoverMenu;
});

describe('ThreeDotsMenu modal subscription', () => {
    beforeAll(() => {
        // The same starting value the app gives the key at launch, so every write below lands on a key that already has a value
        Onyx.init({keys: ONYXKEYS, initialKeyStates: {[ONYXKEYS.MODAL]: {isVisible: false, willAlertModalBecomeVisible: false}}});
        return waitForBatchedUpdates();
    });

    afterEach(async () => {
        // Every test starts with no modal, because the key outlives the rendered menu
        setModalVisibility(false);
        willAlertModalBecomeVisible(false);
        await waitForBatchedUpdatesWithAct();
    });

    // Renders a menu and opens its popover, because many of these menus stay mounted on the Workspaces tab while the user navigates
    async function renderOpenMenu() {
        const onRender = jest.fn();
        render(
            <Profiler
                id="three-dots-menu"
                onRender={onRender}
            >
                <ThreeDotsMenu
                    shouldSelfPosition
                    testID="three-dots-menu"
                    anchorAlignment={anchorAlignment}
                    menuItems={menuItems}
                />
            </Profiler>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('three-dots-menu'));
        expect(await screen.findByTestId('popover-open')).toBeOnTheScreen();
        onRender.mockClear();
        return onRender;
    }

    it('does not re-render when a right-docked screen opens and closes', async () => {
        // Given a menu with its popover open
        const onRender = await renderOpenMenu();

        // When a right-docked screen such as the Search Router is focused and then blurred, which writes the modal visibility on every open and close
        setModalVisibility(true, CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED);
        await waitForBatchedUpdatesWithAct();
        setModalVisibility(false);
        willAlertModalBecomeVisible(false);
        await waitForBatchedUpdatesWithAct();

        // Then the menu does not render, because it only depends on whether an alert modal is about to cover it
        expect(onRender).not.toHaveBeenCalled();
    });

    it('stays open when a popover is about to become visible', async () => {
        // Given a menu with its popover open
        await renderOpenMenu();

        // When a popover is about to become visible
        willAlertModalBecomeVisible(true, true);
        await waitForBatchedUpdatesWithAct();

        // Then the menu stays open, because the menu's own popover announces itself this way when it opens
        expect(screen.getByTestId('popover-open')).toBeOnTheScreen();
    });

    it('closes its popover when an alert modal is about to cover it and stays closed after the modal goes away', async () => {
        // Given a menu with its popover open
        await renderOpenMenu();

        // When an alert modal is about to become visible
        willAlertModalBecomeVisible(true);
        await waitForBatchedUpdatesWithAct();

        // Then the popover closes, because an alert modal must not leave a stale three-dots menu floating above it
        expect(screen.getByTestId('popover-closed')).toBeOnTheScreen();

        // When the alert modal goes away
        willAlertModalBecomeVisible(false);
        await waitForBatchedUpdatesWithAct();

        // Then the menu stays closed, because being covered closed it rather than only hiding it
        expect(screen.getByTestId('popover-closed')).toBeOnTheScreen();
    });
});
