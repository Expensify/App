import {act, render} from '@testing-library/react-native';

import {markActivePopoverLauncherDeactivated, resolvePopoverLauncherElement} from '@libs/LauncherStack';

import FABPopoverMenu from '@pages/inbox/sidebar/FABPopoverContent/FABPopoverMenu';

import React from 'react';

jest.mock('@libs/LauncherStack', () => ({
    resolvePopoverLauncherElement: jest.fn(),
    setActivePopoverLauncher: jest.fn(),
    markActivePopoverLauncherDeactivated: jest.fn(),
    pickLauncher: jest.fn(() => null),
    consumeLauncher: jest.fn(),
    resetLauncherStackForTests: jest.fn(),
}));

const latestPopoverProps: {current: {onModalHide?: () => void} | null} = {current: null};

jest.mock('@components/PopoverWithMeasuredContent', () => (props: {onModalHide?: () => void}) => {
    latestPopoverProps.current = props;
    return null;
});

const mockAnchor = document.createElement('div');

function renderFABMenu() {
    const anchorRef = React.createRef<HTMLDivElement>();
    return render(
        <FABPopoverMenu
            isVisible
            onClose={jest.fn()}
            onItemSelected={jest.fn()}
            anchorRef={anchorRef}
        >
            {null}
        </FABPopoverMenu>,
    );
}

describe('FABPopoverMenu launcher deactivation', () => {
    beforeEach(() => {
        latestPopoverProps.current = null;
        jest.clearAllMocks();
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(mockAnchor);
    });

    it('deactivates the FAB launcher entry once the menu is hidden', () => {
        renderFABMenu();

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        expect(markActivePopoverLauncherDeactivated).toHaveBeenCalledWith(mockAnchor);
    });

    it('does not deactivate anything on hide when the anchor has no host node (native)', () => {
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(null);
        renderFABMenu();

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        expect(markActivePopoverLauncherDeactivated).not.toHaveBeenCalled();
    });
});
