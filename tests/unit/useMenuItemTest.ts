/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';
import useMenuItem from '@components/PopoverMenu/v2/rows/useMenuItem';
import CONST from '@src/CONST';

describe('useMenuItem', () => {
    it('defaults role to menuitem and omits accessibilityState entirely (menuitem does not support checked/disabled)', () => {
        const {result} = renderHook(() => useMenuItem({}));
        expect(result.current.itemProps.role).toBe(CONST.ROLE.MENUITEM);
        expect(result.current.itemProps.accessibilityState).toBeUndefined();
    });

    it('publishes accessibilityState.checked only for menuitemradio / menuitemcheckbox (WAI-ARIA 1.2 §6.6)', () => {
        const radio = renderHook(() => useMenuItem({role: CONST.ROLE.MENUITEMRADIO, isSelected: true}));
        expect(radio.result.current.itemProps.accessibilityState).toEqual({checked: true, disabled: undefined});
        const checkbox = renderHook(() => useMenuItem({role: CONST.ROLE.MENUITEMCHECKBOX, isSelected: false}));
        expect(checkbox.result.current.itemProps.accessibilityState).toEqual({checked: false, disabled: undefined});
    });

    it('publishes accessibilityState.disabled when isDisabled is true (any role)', () => {
        const {result} = renderHook(() => useMenuItem({isDisabled: true}));
        expect(result.current.itemProps.accessibilityState).toEqual({checked: undefined, disabled: true});
    });

    it('fires onSelect when onPress is called', () => {
        const onSelect = jest.fn();
        const {result} = renderHook(() => useMenuItem({onSelect}));
        result.current.itemProps.onPress();
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('skips onSelect when isDisabled is true', () => {
        const onSelect = jest.fn();
        const {result} = renderHook(() => useMenuItem({onSelect, isDisabled: true}));
        result.current.itemProps.onPress();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('passes accessibilityLabel through', () => {
        const {result} = renderHook(() => useMenuItem({accessibilityLabel: 'Delete'}));
        expect(result.current.itemProps.accessibilityLabel).toBe('Delete');
    });
});
