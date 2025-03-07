import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePane from '@hooks/useSidePane';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {triggerSidePane} from '@libs/actions/SidePane';

type HelpButtonProps = {
    style?: StyleProp<ViewStyle>;
};

function HelpButton({style}: HelpButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {sidePane, shouldHideHelpButton} = useSidePane();

    if (shouldHideHelpButton) {
        return null;
    }

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
        >
            <Tooltip text={translate('common.help')}>
                <PressableWithoutFeedback
                    accessibilityLabel={translate('common.help')}
                    style={[styles.flexRow, styles.touchableButtonImage, styles.mr2, style]}
                    onPress={() => triggerSidePane(isExtraLargeScreenWidth ? !sidePane?.open : !sidePane?.openNarrowScreen, {shouldUpdateNarrowLayout: !isExtraLargeScreenWidth})}
                >
                    <Icon
                        src={Expensicons.QuestionMark}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
        </Animated.View>
    );
}

HelpButton.displayName = 'HelpButton';

export default HelpButton;
