import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import CONST from '@src/CONST';

describe('shouldPopoverUseScrollView', () => {
    const createOption = (value: string, subMenuItems?: Array<{value: string; text: string}>): DropdownOption<string> => ({
        value,
        text: value,
        ...(subMenuItems && {subMenuItems: subMenuItems.map((item) => ({...item, key: item.value}))}),
    });

    it('returns false when there are few top-level options and no large submenus', () => {
        const options = [createOption('a'), createOption('b'), createOption('c')];
        expect(shouldPopoverUseScrollView(options)).toBe(false);
    });

    it('returns true when there are 5 or more top-level options', () => {
        const options = Array.from({length: CONST.DROPDOWN_SCROLL_THRESHOLD}, (_, i) => createOption(`option-${i}`));
        expect(shouldPopoverUseScrollView(options)).toBe(true);
    });

    it('returns true when any option has 5 or more submenu items', () => {
        const subMenuItems = Array.from({length: CONST.DROPDOWN_SCROLL_THRESHOLD}, (_, i) => ({
            value: `sub-${i}`,
            text: `Sub ${i}`,
        }));
        const options = [createOption('parent', subMenuItems)];
        expect(shouldPopoverUseScrollView(options)).toBe(true);
    });

    it('returns false when submenu has fewer than threshold items', () => {
        const subMenuItems = [
            {value: 'sub-1', text: 'Sub 1'},
            {value: 'sub-2', text: 'Sub 2'},
        ];
        const options = [createOption('parent', subMenuItems)];
        expect(shouldPopoverUseScrollView(options)).toBe(false);
    });
});
