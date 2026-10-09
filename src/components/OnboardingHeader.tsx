import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';

type OnboardingHeaderProps = {
    onBackButtonPress?: () => void;

    shouldShowBackButton?: boolean;
};

/**
 * Popover-style back link: caret + "Back" label.
 * Matches the submenu back row used by PopoverMenu.
 */
function OnboardingHeader({onBackButtonPress, shouldShowBackButton = true}: OnboardingHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);

    return (
        <View style={[styles.onboardingHeaderContainer]}>
            {shouldShowBackButton ? (
                <PressableWithoutFeedback
                    onPress={onBackButtonPress}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.back')}
                    sentryLabel="OnboardingHeader-Back"
                >
                    <Icon
                        src={icons.BackArrow}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                    <Text style={styles.createMenuHeaderText}>{translate('common.back')}</Text>
                </PressableWithoutFeedback>
            ) : null}
        </View>
    );
}

export default OnboardingHeader;
