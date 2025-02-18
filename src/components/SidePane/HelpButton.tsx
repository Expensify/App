import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
        <Tooltip text={translate('initialSettingsPage.help')}>
            <PressableWithoutFeedback
                nativeID="helpButton"
                accessibilityLabel={translate('initialSettingsPage.help')}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={() => {
                    // eslint-disable-next-line rulesdir/prefer-actions-set-data
                    Onyx.merge(ONYXKEYS.NVP_SIDE_PANE, isExtraLargeScreenWidth ? {open: !sidePane?.open} : {open: !sidePane?.openMobile, openMobile: !sidePane?.openMobile});
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
