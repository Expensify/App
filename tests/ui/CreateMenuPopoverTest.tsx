import {render, screen} from '@testing-library/react-native';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';

import CONST from '@src/CONST';

import type {View as ViewType} from 'react-native';

import React from 'react';

const POPOVER_MENU_TEST_ID = 'fab-popover-menu';

// The popover is replaced with a marker, so the test checks what the create menu hands it, not how the popover draws itself or its rows.
jest.mock('@pages/inbox/sidebar/FABPopoverContent/FABPopoverMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns untyped modules; the typeof annotations enforce the expected shape
    const {createElement}: typeof React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns untyped modules; the typeof annotations enforce the expected shape
    const {View}: {View: typeof ViewType} = require('react-native');
    return {
        __esModule: true,
        default: ({shouldShowIconTiles}: {shouldShowIconTiles?: boolean}) => createElement(View, {testID: 'fab-popover-menu', accessibilityLabel: String(shouldShowIconTiles)}),
    };
});

let mockEnabledBetas: string[] = [];
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta)}));

describe('CreateMenuPopover', () => {
    it.each([
        [true, 'true'],
        [false, 'false'],
    ])('shows icon tiles when the flat nav beta is %s', (isFlatNavBetaEnabled, expected) => {
        // Given the flat nav beta, which gates the colored tiles for every button that opens the create menu, is on or off
        mockEnabledBetas = isFlatNavBetaEnabled ? [CONST.BETAS.FLAT_NAV] : [];

        // When the create menu is rendered, without the opening button telling it anything about tiles
        render(
            <CreateMenuPopover
                isVisible
                onClose={jest.fn()}
                anchorRef={{current: null}}
            />,
        );

        // Then the menu decides on its own to show tiles only for flat nav beta users, so they ship together with the rest of the flat nav release
        expect(screen.getByTestId(POPOVER_MENU_TEST_ID).props.accessibilityLabel).toBe(expected);
    });
});
