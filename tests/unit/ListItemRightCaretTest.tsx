import {render} from '@testing-library/react-native';

import Icon from '@components/Icon';
import ListItemComposed from '@components/SelectionList/ListItemComposed';
import {ListItemContext, ListItemHoverContext} from '@components/SelectionList/ListItemContext';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/Icon', () => jest.fn(() => null));

// Icons load lazily in production; resolve them synchronously so the caret icon is available on first render.
jest.mock('@hooks/useLazyAsset', () => ({
    ...jest.requireActual<Record<string, unknown>>('@hooks/useLazyAsset'),
    useMemoizedLazyExpensifyIcons: (names: string[]) => Object.fromEntries(names.map((name) => [name, name])),
}));

// Map the button state straight through so each case can assert which state drove the fill color.
jest.mock('@hooks/useStyleUtils', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        getIconFillColor: ({buttonState}: {buttonState: string}) => `fill-${buttonState}`,
    })),
}));

const mockIcon = jest.mocked(Icon);

type RowContextState = {isDisabled?: boolean; isInteractive?: boolean};

const renderCaret = (isHovered: boolean, {isDisabled = false, isInteractive = true}: RowContextState = {}) =>
    render(
        <ListItemContext.Provider value={{isDisabled, isInteractive, isFocusVisible: false, shouldShowTooltip: false, shouldDisableAccessibleGrouping: false}}>
            <ListItemHoverContext.Provider value={isHovered}>
                <ListItemComposed.RightCaret />
            </ListItemHoverContext.Provider>
        </ListItemContext.Provider>,
    );

describe('ListItemComposed.RightCaret', () => {
    beforeEach(() => {
        mockIcon.mockClear();
    });

    it.each([
        ['default fill when the row is not hovered', false, {}, CONST.BUTTON_STATES.DEFAULT],
        ['active fill when the row is hovered', true, {}, CONST.BUTTON_STATES.ACTIVE],
        ['disabled fill when the row is disabled, even while hovered', true, {isDisabled: true}, CONST.BUTTON_STATES.DISABLED],
        ['default fill when the row is not interactive, even while hovered', true, {isInteractive: false}, CONST.BUTTON_STATES.DEFAULT],
    ])('renders the %s', (_label, isHovered, contextState: RowContextState, expectedButtonState) => {
        renderCaret(isHovered, contextState);

        expect(mockIcon.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({fill: `fill-${expectedButtonState}`}));
    });
});
