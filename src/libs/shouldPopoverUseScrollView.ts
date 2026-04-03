import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import CONST from '@src/CONST';

function shouldPopoverUseScrollView<T>(options: Array<DropdownOption<T>>): boolean {
    return options.length >= CONST.DROPDOWN_SCROLL_THRESHOLD || options.some((option) => (option.subMenuItems?.length ?? 0) >= CONST.DROPDOWN_SCROLL_THRESHOLD);
}

export default shouldPopoverUseScrollView;
