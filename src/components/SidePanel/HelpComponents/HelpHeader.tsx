import React from 'react';
import {View} from 'react-native';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type HelpHeaderProps = {
    /** Title of the header */
    title: string;

    /** Function to call when back button is pressed */
    onBackButtonPress: () => void;

    /** Function to call when close button is pressed */
    onCloseButtonPress: () => void;

    /** Whether to show the back button */
    shouldShowBackButton?: boolean;

    /** Whether to show the close button */
    shouldShowCloseButton?: boolean;
};

function HelpHeader({title, onBackButtonPress, onCloseButtonPress, shouldShowBackButton = true, shouldShowCloseButton = false}: HelpHeaderProps) {
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();

    const {translate} = useLocalize();

    return (
        <View style={[styles.headerBar]}>
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                {shouldShowBackButton && (
                    <Tooltip text={translate('common.back')}>
                        <PressableWithoutFeedback
                            onPress={onBackButtonPress}
                            style={[styles.touchableButtonImage]}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.back')}
                        >
                            <Icon
                                src={icons.BackArrow}
                                fill={theme.icon}
                            />
                        </PressableWithoutFeedback>
                    </Tooltip>
                )}

                <Header
                    title={title}
                    textStyles={[styles.flexShrink1, styles.textAlignCenter, shouldShowBackButton && styles.mr5, shouldShowCloseButton && styles.mr5]}
                />

                {shouldShowCloseButton && (
                    <Tooltip text={translate('common.close')}>
                        <PressableWithoutFeedback
                            onPress={onCloseButtonPress}
                            style={[styles.touchableButtonImage]}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.close')}
                        >
                            <Icon
                                src={Expensicons.Close}
                                fill={theme.icon}
                            />
                        </PressableWithoutFeedback>
                    </Tooltip>
                )}
            </View>
        </View>
    );
}

export default HelpHeader;
