/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';
import useMenu from '@components/PopoverMenu/v2/content/useMenu';
import CONST from '@src/CONST';

describe('useMenu', () => {
    it('returns the WAI-ARIA menu container bag with default orientation=vertical', () => {
        const {result} = renderHook(() => useMenu({contentID: 'menu-1', accessibilityLabel: 'Actions'}));
        expect(result.current.menuProps.role).toBe(CONST.ROLE.MENU);
        expect(result.current.menuProps.nativeID).toBe('menu-1');
        expect(result.current.menuProps.accessibilityLabel).toBe('Actions');
        expect(result.current.menuProps['aria-orientation']).toBe('vertical');
    });

    it('forwards triggerID to accessibilityLabelledBy so AT links menu ↔ trigger', () => {
        const {result} = renderHook(() => useMenu({contentID: 'menu', triggerID: 'tr'}));
        expect(result.current.menuProps.accessibilityLabelledBy).toBe('tr');
    });

    it('generates a stable contentID when none is provided', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- renderHook's rerender(props) signature requires the wrapper to accept a props param even when unused.
        const {result, rerender} = renderHook((_props: Record<string, never>) => useMenu({}), {initialProps: {}});
        const first = result.current.menuProps.nativeID;
        expect(typeof first).toBe('string');
        rerender({});
        expect(result.current.menuProps.nativeID).toBe(first);
    });

    it('passes the requested orientation through', () => {
        const {result} = renderHook(() => useMenu({orientation: 'horizontal'}));
        expect(result.current.menuProps['aria-orientation']).toBe('horizontal');
    });
});
