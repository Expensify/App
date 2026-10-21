import CONST from '@src/CONST';

function shouldPopoverUseScrollView(options: Array<{subMenuItems?: unknown[]}>): boolean {
    return options.length >= CONST.DROPDOWN_SCROLL_THRESHOLD || options.some((option) => (option.subMenuItems?.length ?? 0) >= CONST.DROPDOWN_SCROLL_THRESHOLD);
}

export default shouldPopoverUseScrollView;
