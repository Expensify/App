import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type HeaderThreeDotsMenuProps = {
    /** Menu items. Config-array seam (wraps the v1 `ThreeDotsMenu`) until it migrates to `PopoverMenu/v2`. */
    items: PopoverMenuItem[];

    /** Method to trigger when pressing the more options (three dots) button. */
    onIconPress?: () => void;

    /** Whether the popover menu should overlay the current view. */
    shouldOverlay?: boolean;

    /** The anchor alignment of the menu. */
    anchorAlignment?: AnchorAlignment;

    /** Whether we should set the modal visibility when the three dot menu opens. */
    shouldSetModalVisibility?: boolean;
};

function HeaderThreeDotsMenu({items, onIconPress = () => {}, shouldOverlay = false, anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT, shouldSetModalVisibility = true}: HeaderThreeDotsMenuProps) {
    return (
        <ThreeDotsMenu
            shouldSelfPosition
            disabled={false}
            menuItems={items}
            onIconPress={onIconPress}
            shouldOverlay={shouldOverlay}
            anchorAlignment={anchorAlignment}
            shouldSetModalVisibility={shouldSetModalVisibility}
            sentryLabel={CONST.SENTRY_LABEL.HEADER.MORE_BUTTON}
        />
    );
}

export default HeaderThreeDotsMenu;
export {DEFAULT_ANCHOR_ALIGNMENT};
