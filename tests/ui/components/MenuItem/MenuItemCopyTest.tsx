import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import Clipboard from '@libs/Clipboard';
import ControlSelection from '@libs/ControlSelection';
import type * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {canUseTouchScreen, hasHoverSupport} from '@libs/DeviceCapabilities';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

import React from 'react';

import {translateLocal} from '../../../utils/TestHelper';

/** Drives the row's hover state, which `Hoverable` reports as always `false` on native */
let mockIsHovered = false;

/** Drives the layout the row sees, as only the narrow one blocks text selection */
let mockShouldUseNarrowLayout = false;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        Copy: () => null,
    })),
}));

jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(mockIsHovered) : children),
}));

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    hasHoverSupport: jest.fn(),
    canUseTouchScreen: jest.fn(),
}));

jest.mock('@libs/ControlSelection', () => ({
    block: jest.fn(),
    unblock: jest.fn(),
    blockElement: jest.fn(),
    unblockElement: jest.fn(),
}));

jest.mock('@libs/Clipboard', () => ({
    setString: jest.fn(),
}));

jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({
    showContextMenu: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}),
}));

const mockedHasHoverSupport = jest.mocked(hasHoverSupport);
const mockedCanUseTouchScreen = jest.mocked(canUseTouchScreen);
const mockedShowContextMenu = jest.mocked(showContextMenu);
const mockedSetString = jest.mocked(Clipboard.setString);
const mockedBlockSelection = jest.mocked(ControlSelection.block);

const NAME = 'Confirmation';
const VALUE = 'CONF-12345';
const ROW_TEST_ID = 'copyable-row';

function Row() {
    return (
        <LocaleContextProvider>
            <MenuItemField
                name={NAME}
                value={VALUE}
                testID={ROW_TEST_ID}
            >
                <MenuItem.Copy value={VALUE} />
            </MenuItemField>
        </LocaleContextProvider>
    );
}

/** A long press reaches the row's handler through `PressableWithSecondaryInteraction`, which calls `preventDefault` first */
function longPressRow() {
    fireEvent(screen.getByTestId(ROW_TEST_ID), 'longPress', {preventDefault: () => {}});
}

function getCopyButton() {
    return screen.queryByLabelText(translateLocal('common.copyToClipboard'));
}

describe('MenuItem.Copy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsHovered = false;
        mockShouldUseNarrowLayout = false;
        mockedHasHoverSupport.mockReturnValue(true);
        mockedCanUseTouchScreen.mockReturnValue(false);
    });

    describe('on a device with hover support', () => {
        it('shows the copy button only while the row is hovered', () => {
            const {rerender} = render(<Row />);

            expect(getCopyButton()).not.toBeOnTheScreen();

            mockIsHovered = true;
            rerender(<Row />);

            expect(getCopyButton()).toBeOnTheScreen();
        });

        it('puts the value on the clipboard when the button is pressed', () => {
            mockIsHovered = true;
            render(<Row />);

            fireEvent.press(screen.getByLabelText(translateLocal('common.copyToClipboard')), {nativeEvent: {}});

            expect(mockedSetString).toHaveBeenCalledWith(VALUE);
        });

        it('leaves the row alone, so the browser keeps its own context menu', () => {
            mockIsHovered = true;
            render(<Row />);

            longPressRow();

            expect(mockedShowContextMenu).not.toHaveBeenCalled();
        });
    });

    describe('on a touch device', () => {
        beforeEach(() => {
            mockedHasHoverSupport.mockReturnValue(false);
            mockedCanUseTouchScreen.mockReturnValue(true);
            mockShouldUseNarrowLayout = true;
        });

        it('renders no copy button, as there is no hover to reveal it', () => {
            mockIsHovered = true;

            render(<Row />);

            expect(getCopyButton()).not.toBeOnTheScreen();
        });

        it('opens the text context menu on a long press, anchored to the row itself', () => {
            render(<Row />);

            longPressRow();

            expect(mockedShowContextMenu).toHaveBeenCalledTimes(1);
            expect(mockedShowContextMenu).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.CONTEXT_MENU_TYPES.TEXT,
                    selection: VALUE,
                }),
            );
            expect(mockedShowContextMenu.mock.calls.at(0)?.at(0)?.contextMenuAnchor).toBeTruthy();
        });

        it('blocks text selection while the press lasts, so it does not start under the context menu', () => {
            render(<Row />);

            fireEvent(screen.getByTestId(ROW_TEST_ID), 'pressIn', {nativeEvent: {}});

            expect(mockedBlockSelection).toHaveBeenCalled();
        });
    });
});
