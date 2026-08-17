import type {PopoverMenuItem} from '@components/PopoverMenu';

import type {SvgProps} from 'react-native-svg';

import React from 'react';

import HeaderTooltipIconButton from './HeaderTooltipIconButton';

type HeaderMenuItemButtonTooltipProps = {
    threeDotsMenuItem: PopoverMenuItem;
};

/**
 * Single tooltip-wrapped icon button. Provisional block extracted from the legacy three-dots "minimized" variant
 * (a single-item menu collapsed to a plain icon button); its only real use is the money-request Category step.
 */
function HeaderMenuItemButtonTooltip({threeDotsMenuItem}: HeaderMenuItemButtonTooltipProps) {
    return (
        <HeaderTooltipIconButton
            text={threeDotsMenuItem.text}
            onPress={threeDotsMenuItem.onSelected}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            iconSrc={threeDotsMenuItem.icon as React.FC<SvgProps>}
            sentryLabel={threeDotsMenuItem.sentryLabel}
        />
    );
}

export default HeaderMenuItemButtonTooltip;
