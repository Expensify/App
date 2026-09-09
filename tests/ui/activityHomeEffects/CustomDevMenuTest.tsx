import CustomDevMenu from '@components/CustomDevMenu/index.native';

import React from 'react';
import {DevSettings} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

/**
 * Every screen wrapper renders this component in development, Home included. DevSettings has no API for removing a
 * menu item, so the entry cannot be paired with a cleanup, and adding it on every effect mount grew the dev menu by
 * one duplicate row per cover and reveal of the screen.
 */
describe('CustomDevMenu on native', () => {
    it('adds its dev menu entry once across a cover and reveal', async () => {
        const addMenuItem = jest.spyOn(DevSettings, 'addMenuItem').mockImplementation(() => {});
        const screenCover = renderScreenWithCover(<CustomDevMenu />);
        expect(addMenuItem).toHaveBeenCalledTimes(1);

        await screenCover.hide();
        await screenCover.reveal();

        expect(addMenuItem).toHaveBeenCalledTimes(1);
        screenCover.unmount();
        addMenuItem.mockRestore();
    });
});
