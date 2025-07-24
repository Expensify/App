import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
// eslint-disable-next-line @dword-design/import-alias/prefer-alias
import SidePanel from '@components/SidePanel/index';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useSidePanel from '@hooks/useSidePanel';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

type HelpButtonProps = {
    style?: StyleProp<ViewStyle>;
};

function HelpButton({style}: HelpButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {openSidePanel, shouldHideHelpButton} = useSidePanel();
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID;

    return (
        <>
            {isNative && <SidePanel />}
            {!shouldHideHelpButton && (
                <Tooltip text={translate('common.help')}>
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('common.help')}
                        style={[styles.flexRow, styles.touchableButtonImage, style]}
                        onPress={openSidePanel}
                    >
                        <Icon
                            src={Expensicons.QuestionMark}
                            fill={theme.icon}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
        </>
    );
}

HelpButton.displayName = 'HelpButton';

export default HelpButton;
