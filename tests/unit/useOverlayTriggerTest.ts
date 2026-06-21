/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';
import useOverlayTrigger from '@components/Overlay/hooks/useOverlayTrigger';

describe('useOverlayTrigger', () => {
    it('returns the WAI-ARIA disclosure prop bag', () => {
        const {result} = renderHook(() =>
            useOverlayTrigger({
                isOpen: true,
                triggerID: 'trig-1',
                contentID: 'content-1',
                popupRole: 'dialog',
            }),
        );
        expect(result.current.triggerProps).toEqual({
            nativeID: 'trig-1',
            accessibilityState: {expanded: true},
            accessibilityHasPopup: 'dialog',
            accessibilityControls: 'content-1',
        });
    });

    it('reflects isOpen=false in accessibilityState.expanded', () => {
        const {result} = renderHook(() =>
            useOverlayTrigger({
                isOpen: false,
                triggerID: 't',
                contentID: 'c',
                popupRole: 'menu',
            }),
        );
        expect(result.current.triggerProps.accessibilityState).toEqual({expanded: false});
    });

    it('keeps accessibilityControls populated even when closed (WAI-ARIA APG always-on contract)', () => {
        const {result} = renderHook(() =>
            useOverlayTrigger({
                isOpen: false,
                triggerID: 't',
                contentID: 'c',
                popupRole: 'dialog',
            }),
        );
        expect(result.current.triggerProps.accessibilityControls).toBe('c');
    });

    it('passes through each supported popup role unchanged', () => {
        for (const role of ['dialog', 'menu', 'listbox', 'tree', 'grid'] as const) {
            const {result} = renderHook(() =>
                useOverlayTrigger({
                    isOpen: false,
                    triggerID: 't',
                    contentID: 'c',
                    popupRole: role,
                }),
            );
            expect(result.current.triggerProps.accessibilityHasPopup).toBe(role);
        }
    });
});
