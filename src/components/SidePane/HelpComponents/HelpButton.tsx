import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidePaneDisplayStatus} from '@hooks/useSidePane';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {triggerSidePane} from '@libs/actions/SidePane';
import KeyboardUtils from '@src/utils/keyboard';

type HelpButtonProps = {
    style?: StyleProp<ViewStyle>;
};

function HelpButton({style}: HelpButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {sidePaneNVP, shouldHideHelpButton} = useSidePaneDisplayStatus();

    if (shouldHideHelpButton) {
        return null;
    }

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                accessibilityLabel={translate('common.help')}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={() => {
                    KeyboardUtils.dismiss();
                    triggerSidePane({
                        isOpen: isExtraLargeScreenWidth ? !sidePaneNVP?.open : !sidePaneNVP?.openNarrowScreen,
                        isOpenNarrowScreen: isExtraLargeScreenWidth ? undefined : !sidePaneNVP?.openNarrowScreen,
                    });
                }}
            >
                <Icon
                    src={Expensicons.QuestionMark}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

HelpButton.displayName = 'HelpButton';

export default HelpButton;
