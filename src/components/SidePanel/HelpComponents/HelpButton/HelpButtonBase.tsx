import React from 'react';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSidePanel from '@hooks/useSidePanel';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type HelpButtonProps from './types';

function HelpButton({style}: HelpButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {openSidePanel, shouldHideHelpButton} = useSidePanel();
    const {ConciergeAvatar} = useMemoizedLazyExpensifyIcons(['ConciergeAvatar']);

    if (shouldHideHelpButton) {
        return null;
    }

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                accessibilityLabel={translate('common.help')}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={openSidePanel}
            >
                <Icon
                    src={ConciergeAvatar}
                    fill={theme.icon}
                    width={28}
                    height={28}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

HelpButton.displayName = 'HelpButtonBase';

export default HelpButton;
