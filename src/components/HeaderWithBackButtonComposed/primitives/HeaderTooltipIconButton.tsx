import Icon from '@components/Icon';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {SvgProps} from 'react-native-svg';

import React from 'react';

type HeaderTooltipIconButtonProps = {
    threeDotsMenuItem: PopoverMenuItem;
};

/**
 * Single tooltip-wrapped icon button. Provisional block extracted from the legacy three-dots "minimized" variant
 * (a single-item menu collapsed to a plain icon button); its only real use is the money-request Category step.
 */
function HeaderTooltipIconButton({threeDotsMenuItem}: HeaderTooltipIconButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <Tooltip text={threeDotsMenuItem.text}>
            <PressableWithoutFeedback
                onPress={threeDotsMenuItem.onSelected}
                style={[styles.touchableButtonImage]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={threeDotsMenuItem.text ?? ''}
                sentryLabel={threeDotsMenuItem.sentryLabel}
            >
                <Icon
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                    src={threeDotsMenuItem.icon as React.FC<SvgProps>}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default HeaderTooltipIconButton;
export type {HeaderTooltipIconButtonProps};
