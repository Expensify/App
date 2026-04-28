import type {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import CONST from '@src/CONST';

// Beyond this character count, compact-trigger labels switch to extra-small bold styling.
const TEXT_COMPACT_THRESHOLD = 6;

function useButtonSizeFlags(buttonSize: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>) {
    const StyleUtils = useStyleUtils();
    return {
        isButtonSizeLarge: buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE,
        isButtonSizeSmall: buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL,
        isButtonSizeExtraSmall: buttonSize === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL,
        innerStyleDropButton: StyleUtils.getDropDownButtonHeight(buttonSize),
    };
}

export default useButtonSizeFlags;
export {TEXT_COMPACT_THRESHOLD};
