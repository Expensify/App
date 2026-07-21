import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

type HeaderThreeDotsMenuProps = {
    /** Menu items. Config-array seam (wraps the v1 `ThreeDotsMenu`) until it migrates to `PopoverMenu/v2`. */
    items: PopoverMenuItem[];

    /** Icon displayed on the three-dots trigger. */
    icon?: IconAsset;

    /** The fill color to pass into the trigger icon. */
    iconFill?: string;

    /** Whether the three-dots button is disabled. */
    disabled?: boolean;

    /** Method to trigger when pressing the more options (three dots) button. */
    onIconPress?: () => void;

    /** Whether the popover menu should overlay the current view. */
    shouldOverlay?: boolean;

    /** The anchor alignment of the menu. */
    anchorAlignment?: AnchorAlignment;

    /** Whether we should set the modal visibility when the three dot menu opens. */
    shouldSetModalVisibility?: boolean;
};

function HeaderThreeDotsMenu({
    items,
    icon,
    iconFill,
    disabled = false,
    onIconPress = () => {},
    shouldOverlay = false,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
    shouldSetModalVisibility = true,
}: HeaderThreeDotsMenuProps) {
    return (
        <ThreeDotsMenu
            shouldSelfPosition
            icon={icon}
            iconFill={iconFill}
            disabled={disabled}
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
export type {HeaderThreeDotsMenuProps};
