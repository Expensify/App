import {render} from '@testing-library/react-native';

import type FocusTrapForModalProps from '@components/FocusTrap/FocusTrapForModal/FocusTrapForModalProps';
import PopoverMenu from '@components/PopoverMenu';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React, {createRef} from 'react';

const capturedTrapProps: FocusTrapForModalProps[] = [];

jest.mock('@components/FocusTrap/FocusTrapForModal', () => ({
    __esModule: true,
    default: (props: FocusTrapForModalProps) => {
        capturedTrapProps.push(props);
        return props.children;
    },
}));

// The real popover measures layout and mounts a Modal; neither matters for the focus-return wiring under test.
jest.mock('@components/PopoverWithMeasuredContent', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

/**
 * `shouldEnableNewFocusManagement` hands the focus return to ComposerFocusManager, which only ever saves and restores
 * *inputs*. A popover anchored to a button — the ⋯ trigger, which also blurs itself before opening — has no input to
 * restore, so the trap standing down left focus on `<body>` after Escape. `shouldReturnFocus` overrides that default.
 */
describe('PopoverMenu focus return', () => {
    const anchorRef = createRef<View>();
    const menuItems = [{text: 'Duplicate workspace', onSelected: jest.fn()}];
    const onClose = jest.fn();
    const onItemSelected = jest.fn();

    function createPopoverMenu(overrides: Partial<React.ComponentProps<typeof PopoverMenu>> = {}) {
        return (
            <PopoverMenu
                isVisible
                anchorRef={anchorRef}
                anchorPosition={{horizontal: 0, vertical: 0}}
                menuItems={menuItems}
                onClose={onClose}
                onItemSelected={onItemSelected}
                {...overrides}
            />
        );
    }

    function renderPopoverMenu(overrides: Partial<React.ComponentProps<typeof PopoverMenu>> = {}) {
        capturedTrapProps.length = 0;
        render(createPopoverMenu(overrides));
        return capturedTrapProps.at(-1);
    }

    it('returns focus when the caller opts in, even with the new focus manager on', () => {
        expect(renderPopoverMenu({shouldEnableNewFocusManagement: true, shouldReturnFocus: true})?.shouldReturnFocus).toBe(true);
    });

    it('keeps the derived default when the prop is omitted, so other callers are unchanged', () => {
        expect(renderPopoverMenu({shouldEnableNewFocusManagement: true})?.shouldReturnFocus).toBe(false);
        expect(renderPopoverMenu()?.shouldReturnFocus).toBe(true);
    });

    it('honors an explicit opt-out', () => {
        expect(renderPopoverMenu({shouldReturnFocus: false})?.shouldReturnFocus).toBe(false);
    });

    it('updates the focus-return policy when only shouldReturnFocus changes', () => {
        capturedTrapProps.length = 0;
        const {rerender} = render(createPopoverMenu({shouldReturnFocus: false}));
        expect(capturedTrapProps.at(-1)?.shouldReturnFocus).toBe(false);

        rerender(createPopoverMenu({shouldReturnFocus: true}));
        expect(capturedTrapProps.at(-1)?.shouldReturnFocus).toBe(true);
    });

    it('passes the anchor as the launcher, so a trigger that blurs itself is still restorable', () => {
        expect(renderPopoverMenu({shouldEnableNewFocusManagement: true, shouldReturnFocus: true})?.launcherRef).toBe(anchorRef);
    });

    it('opts in regardless of restoreFocusType, which only governs ComposerFocusManager', () => {
        const props = renderPopoverMenu({
            shouldEnableNewFocusManagement: true,
            shouldReturnFocus: true,
            restoreFocusType: CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE,
        });
        expect(props?.shouldReturnFocus).toBe(true);
    });
});
