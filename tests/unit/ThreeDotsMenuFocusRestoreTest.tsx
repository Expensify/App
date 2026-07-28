import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {PopoverMenuItem, PopoverMenuProps} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {resolvePopoverLauncherElement, setActivePopoverLauncher} from '@libs/LauncherStack';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';

import CONST from '@src/CONST';

import React from 'react';

const mockAnchor = document.createElement('button');

jest.mock('@libs/LauncherStack', () => ({
    resolvePopoverLauncherElement: jest.fn(),
    setActivePopoverLauncher: jest.fn(),
}));

jest.mock('@libs/restoreFocusWithModality', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));

jest.mock('@hooks/useTheme', () => () => ({icon: '#000', success: '#0f0'}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    touchableButtonImage: {},
    threeDotsMenuIconWidth: {},
    mh4: {},
    pv2: {},
    productTrainingTooltipWrapper: {},
}));

jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 1024, windowHeight: 768}));

jest.mock('@hooks/usePopoverPosition', () => () => ({
    calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0})),
}));

jest.mock('@libs/Browser', () => ({
    isMobile: () => false,
}));

jest.mock('@components/Pressable/PressableWithoutFeedback', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module
    const {Pressable} = jest.requireActual('react-native');
    const ReactActual = jest.requireActual<typeof React>('react');
    return ReactActual.forwardRef(
        (
            {children, testID, onPress, accessibilityLabel, disabled}: {children?: React.ReactNode; testID?: string; onPress?: () => void; accessibilityLabel?: string; disabled?: boolean},
            ref: React.Ref<unknown>,
        ) => (
            <Pressable
                ref={ref}
                testID={testID}
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
                disabled={disabled}
            >
                {children}
            </Pressable>
        ),
    );
});

jest.mock('@components/Icon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module
    const {View} = jest.requireActual('react-native');
    return () => <View testID="mock-icon" />;
});

jest.mock('@components/Tooltip/PopoverAnchorTooltip', () => {
    return ({children}: {children: React.ReactNode}) => children;
});

jest.mock('@components/Tooltip/EducationalTooltip', () => {
    return ({children}: {children: React.ReactNode}) => children;
});

const latestPopoverProps: {current: PopoverMenuProps | null} = {current: null};

jest.mock('@components/PopoverMenu', () => {
    return (props: PopoverMenuProps) => {
        latestPopoverProps.current = props;
        return null;
    };
});

const TRIGGER_TEST_ID = 'three-dots-trigger';

function renderMenu(menuItems: PopoverMenuItem[]) {
    return render(
        <ThreeDotsMenu
            testID={TRIGGER_TEST_ID}
            menuItems={menuItems}
            anchorPosition={{horizontal: 0, vertical: 0}}
        />,
    );
}

describe('ThreeDotsMenu focus restore handshake', () => {
    beforeEach(() => {
        latestPopoverProps.current = null;
        jest.mocked(setActivePopoverLauncher).mockClear();
        jest.mocked(resolvePopoverLauncherElement).mockClear();
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(mockAnchor);
        jest.mocked(restoreFocusWithModality).mockClear();
        document.body.appendChild(mockAnchor);
    });

    afterEach(() => {
        mockAnchor.remove();
    });

    it('registers the anchor into LauncherStack before opening, and restores it on hide when shouldCallAfterModalHide', () => {
        renderMenu([{text: 'Duplicate', shouldCallAfterModalHide: true}]);

        fireEvent.press(screen.getByTestId(TRIGGER_TEST_ID));

        expect(resolvePopoverLauncherElement).toHaveBeenCalled();
        expect(setActivePopoverLauncher).toHaveBeenCalledWith(mockAnchor);
        expect(latestPopoverProps.current?.isVisible).toBe(true);

        const deferredItem = latestPopoverProps.current?.menuItems.at(0);
        if (!deferredItem) {
            throw new Error('Expected deferred menu item');
        }
        expect(deferredItem.shouldCallAfterModalHide).toBe(true);

        act(() => {
            latestPopoverProps.current?.onItemSelected?.(deferredItem, 0);
        });

        // Deferred path must not set PRESERVE — default restore runs so the hide callback can re-focus the anchor.
        expect(latestPopoverProps.current?.restoreFocusType).toBeUndefined();
        expect(latestPopoverProps.current?.isVisible).toBe(false);

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        expect(restoreFocusWithModality).toHaveBeenCalledWith(mockAnchor);
    });

    it('sets restoreFocusType to PRESERVE for immediate (non-deferred) item selection', () => {
        renderMenu([{text: 'Settings'}]);

        fireEvent.press(screen.getByTestId(TRIGGER_TEST_ID));

        const immediateItem = latestPopoverProps.current?.menuItems.at(0);
        if (!immediateItem) {
            throw new Error('Expected immediate menu item');
        }

        act(() => {
            latestPopoverProps.current?.onItemSelected?.(immediateItem, 0);
        });

        expect(latestPopoverProps.current?.restoreFocusType).toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        // Non-deferred path must not flash focus back onto the 3-dot button on hide.
        expect(restoreFocusWithModality).not.toHaveBeenCalled();
    });
});
