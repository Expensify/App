import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import type * as CopyableTextRowPress from '@hooks/useCopyableTextRowPress';
import useCopyableTextRowPress from '@hooks/useCopyableTextRowPress';

import Clipboard from '@libs/Clipboard';
import ControlSelection from '@libs/ControlSelection';
import type * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {canUseTouchScreen, hasHoverSupport} from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';

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
        NewWindow: () => null,
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

jest.mock('@libs/getPlatform', () => jest.fn());

jest.mock('@hooks/useCopyableTextRowPress', () => {
    const actual = jest.requireActual<typeof CopyableTextRowPress>('@hooks/useCopyableTextRowPress');
    return {...actual, __esModule: true, default: jest.fn(actual.default)};
});

const actualUseCopyableTextRowPress = jest.requireActual<typeof CopyableTextRowPress>('@hooks/useCopyableTextRowPress').default;
const mockedUseCopyableTextRowPress = jest.mocked(useCopyableTextRowPress);
const mockedGetPlatform = jest.mocked(getPlatform);
const mockedHasHoverSupport = jest.mocked(hasHoverSupport);
const mockedCanUseTouchScreen = jest.mocked(canUseTouchScreen);
const mockedShowContextMenu = jest.mocked(showContextMenu);
const mockedSetString = jest.mocked(Clipboard.setString);
const mockedBlockSelection = jest.mocked(ControlSelection.block);

const NAME = 'Confirmation';
const VALUE = 'CONF-12345';
const ROW_TEST_ID = 'copyable-row';

function Row({isValueSelectable = false}: {isValueSelectable?: boolean}) {
    return (
        <LocaleContextProvider>
            <MenuItemField
                name={NAME}
                value={VALUE}
                testID={ROW_TEST_ID}
                isValueSelectable={isValueSelectable}
            >
                <MenuItem.Copy value={VALUE} />
            </MenuItemField>
        </LocaleContextProvider>
    );
}

function LegacyRow({isTitleSelectable = false}: {isTitleSelectable?: boolean}) {
    return (
        <LocaleContextProvider>
            <MenuItem
                title={VALUE}
                description="Report"
                copyValue={VALUE}
                pressableTestID={ROW_TEST_ID}
                interactive={false}
                shouldShowRightIcon={false}
                shouldRenderAsHTML
                shouldBlockSelection
                copyable
                isTitleSelectable={isTitleSelectable}
            />
        </LocaleContextProvider>
    );
}

function mockCopyableTextHitTest(isPressStartOnCopyableText: (event: unknown) => boolean) {
    mockedUseCopyableTextRowPress.mockImplementation(() => ({
        ...actualUseCopyableTextRowPress(),
        isPressStartOnCopyableText,
        markTouchStartOnCopyableText: (_event, shouldCheck = true) => shouldCheck,
    }));
}

/** A long press reaches the row's handler through `PressableWithSecondaryInteraction`. */
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
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
        mockedUseCopyableTextRowPress.mockImplementation(actualUseCopyableTextRowPress);
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

        it.each(['compound', 'legacy'])('preserves native selection and restores the %s row copy action on the next gesture', (implementation) => {
            // Given a mobile-web field with a registered copy action and selectable value
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            const isPressStartOnCopyableText = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
            mockCopyableTextHitTest(isPressStartOnCopyableText);
            render(implementation === 'legacy' ? <LegacyRow isTitleSelectable /> : <Row isValueSelectable />);
            expect(screen.UNSAFE_getByType(PressableWithFeedback).props.onLongPress).toEqual(expect.any(Function));

            // When a touch starts on the value, the browser must be able to open its native selection menu
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'touchStart', {nativeEvent: {}});
            // RN Web normalizes responder coordinates to pageX/pageY rather than clientX/clientY.
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'pressIn', {nativeEvent: {pageX: 10, pageY: 10, touches: [{pageX: 10, pageY: 10}]}});

            // Then no long-press handler or global selection blocker interferes with native selection
            expect(screen.UNSAFE_getByType(PressableWithFeedback).props.onLongPress).toBeUndefined();
            expect(mockedBlockSelection).not.toHaveBeenCalled();
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'pressOut', {nativeEvent: {}});
            expect(screen.UNSAFE_getByType(PressableWithFeedback).props.onLongPress).toBeUndefined();
            expect(mockedShowContextMenu).not.toHaveBeenCalled();

            // When the next gesture starts outside the copyable value
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'touchStart', {nativeEvent: {}});
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'pressIn', {nativeEvent: {}});
            longPressRow();

            // Then the ordinary row selection blocker and copy context menu work again
            expect(mockedBlockSelection).toHaveBeenCalledTimes(1);
            expect(mockedShowContextMenu).toHaveBeenCalledTimes(1);
            expect(mockedShowContextMenu).toHaveBeenCalledWith(expect.objectContaining({selection: VALUE}));
        });

        it.each([
            {platform: CONST.PLATFORM.WEB, isTitleSelectable: false},
            {platform: CONST.PLATFORM.IOS, isTitleSelectable: true},
            {platform: CONST.PLATFORM.ANDROID, isTitleSelectable: true},
        ])('preserves legacy row interactions on $platform with isTitleSelectable=$isTitleSelectable', ({platform, isTitleSelectable}) => {
            // Given a native row or a web row that has not opted into text selection
            mockedGetPlatform.mockReturnValue(platform);
            mockCopyableTextHitTest(() => true);
            render(<LegacyRow isTitleSelectable={isTitleSelectable} />);

            // When the row is touched
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'touchStart', {nativeEvent: {}});
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'pressIn', {nativeEvent: {}});

            // Then browser-only selection handling does not detach its long-press action or skip its blocker
            expect(screen.UNSAFE_getByType(PressableWithFeedback).props.onLongPress).toEqual(expect.any(Function));
            expect(mockedBlockSelection).toHaveBeenCalledTimes(1);
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
