import type {PopoverMenuItem} from '@components/PopoverMenu';

import type {SvgProps} from 'react-native-svg';

import React from 'react';

import HeaderTooltipIconButton from './HeaderTooltipIconButton';

type HeaderMenuItemButtonProps = {
    /** The single menu item to render as a plain icon button, in place of the full three-dots popover. */
    threeDotsMenuItem: PopoverMenuItem;
};

/**
 * Single tooltip-wrapped icon button. A single-item menu collapsed to a plain icon button. Its only real use is the money-request Category step.
 */
function HeaderMenuItemButton({threeDotsMenuItem}: HeaderMenuItemButtonProps) {
    return (
        <HeaderTooltipIconButton
            tooltipText={threeDotsMenuItem.text}
            onPress={threeDotsMenuItem.onSelected}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- PopoverMenuItem.icon is typed as a generic component; header menu items always pass an SVG icon component.
            iconSrc={threeDotsMenuItem.icon as React.FC<SvgProps>}
            sentryLabel={threeDotsMenuItem.sentryLabel}
        />
    );
}

export default HeaderMenuItemButton;
