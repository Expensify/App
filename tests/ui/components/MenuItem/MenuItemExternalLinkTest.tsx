import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';

import getOperatingSystem from '@libs/getOperatingSystem';
import getPlatform from '@libs/getPlatform';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

import type {SvgProps} from 'react-native-svg';

import React from 'react';

import {translateLocal} from '../../../utils/TestHelper';

const mockIcon: React.FC<SvgProps> = () => null;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        NewWindow: mockIcon,
    })),
}));

jest.mock('@libs/getPlatform', () => jest.fn());
jest.mock('@libs/getOperatingSystem', () => jest.fn());
jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({
    showContextMenu: jest.fn(),
}));

const mockedGetPlatform = jest.mocked(getPlatform);
const mockedGetOperatingSystem = jest.mocked(getOperatingSystem);
const mockedShowContextMenu = jest.mocked(showContextMenu);

const TITLE = 'Download the Android app';
const LINK = 'https://use.expensify.com/android';
const ROW_TEST_ID = 'external-link-row';

function Row({link}: {link?: string}) {
    return (
        <LocaleContextProvider>
            <MenuItem.Root
                onPress={() => {}}
                testID={ROW_TEST_ID}
            >
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <MenuItem.Icon src={mockIcon} />
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <MenuItem.Title>{TITLE}</MenuItem.Title>
                    </MenuItem.Content>
                    <MenuItem.Trailing>{!!link && <MenuItem.ExternalLink link={link} />}</MenuItem.Trailing>
                </MenuItem.Row>
            </MenuItem.Root>
        </LocaleContextProvider>
    );
}

describe('MenuItem.ExternalLink', () => {
    beforeEach(() => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
        mockedGetOperatingSystem.mockReturnValue(CONST.OS.WINDOWS);
        mockedShowContextMenu.mockClear();
    });

    describe('context-menu accessibility hint', () => {
        it('folds the hint into the label on web, where a screen reader has no separate hint to read', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailable');

            render(<Row link={LINK} />);

            expect(screen.getByLabelText(`${TITLE}. ${translateLocal('common.opensInNewTab')}. ${contextMenuHint}`)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(contextMenuHint)).not.toBeOnTheScreen();
        });

        it('keeps the hint out of the label on native, so it stays mutable through the screen reader settings', () => {
            const contextMenuHint = translateLocal('accessibilityHints.contextMenuAvailableNative');

            render(<Row link={LINK} />);

            expect(screen.getByAccessibilityHint(contextMenuHint)).toBeOnTheScreen();
            expect(screen.getByLabelText(`${TITLE}. ${translateLocal('common.opensInNewTab')}`)).toBeOnTheScreen();
        });

        it('announces nothing about a context menu on a row with no external link', () => {
            render(<Row />);

            expect(screen.getByLabelText(TITLE)).toBeOnTheScreen();
            expect(screen.queryByAccessibilityHint(translateLocal('accessibilityHints.contextMenuAvailableNative'))).not.toBeOnTheScreen();
        });
    });

    describe('secondary interaction', () => {
        it('opens the link context menu on the row, anchored to the row itself', () => {
            render(<Row link={LINK} />);

            // A long press reaches the row's handler through `PressableWithSecondaryInteraction`, which calls `preventDefault` first
            const longPressEvent = {
                defaultPrevented: false,
                preventDefault() {
                    longPressEvent.defaultPrevented = true;
                },
            };
            fireEvent(screen.getByTestId(ROW_TEST_ID), 'longPress', longPressEvent);

            expect(longPressEvent.defaultPrevented).toBe(true);
            expect(mockedShowContextMenu).toHaveBeenCalledTimes(1);
            expect(mockedShowContextMenu).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.CONTEXT_MENU_TYPES.LINK,
                    selection: LINK,
                }),
            );
            expect(mockedShowContextMenu.mock.calls.at(0)?.at(0)?.contextMenuAnchor).toBeTruthy();
        });
    });
});
