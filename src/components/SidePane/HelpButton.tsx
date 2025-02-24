import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {triggerSidePane} from '@libs/actions/SidePane';
import ONYXKEYS from '@src/ONYXKEYS';

type HelpButtonProps = {
    style?: StyleProp<ViewStyle>;
};

function HelpButton({style}: HelpButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [sidePane] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);
    const {isExtraLargeScreenWidth} = useResponsiveLayout();

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                accessibilityLabel={translate('common.help')}
                style={[styles.flexRow, styles.touchableButtonImage, styles.pr2, style]}
                onPress={() => triggerSidePane(isExtraLargeScreenWidth ? !sidePane?.open : !sidePane?.openMobile, {shouldUpdateNarrowLayout: !isExtraLargeScreenWidth})}
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
