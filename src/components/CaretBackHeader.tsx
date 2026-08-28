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

type CaretBackHeaderProps = {
    /** Callback fired when the back link is pressed */
    onBackButtonPress?: () => void;

    /** Whether to render the back caret + label */
    shouldShowBackButton?: boolean;

    /** Label rendered next to the caret (defaults to the localized "Back") */
    label?: string;
};

/**
 * Popover-style back link: caret + label (defaults to "Back").
 * Matches the submenu back row used by PopoverMenu. It is not onboarding-specific. It can be
 * rendered anywhere a lightweight "back caret" modal header is needed.
 */
function CaretBackHeader({onBackButtonPress, shouldShowBackButton = true, label}: CaretBackHeaderProps) {
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
                    accessibilityLabel={label ?? translate('common.back')}
                    sentryLabel="CaretBackHeader-Back"
                >
                    <Icon
                        src={icons.BackArrow}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                    <Text style={styles.createMenuHeaderText}>{label ?? translate('common.back')}</Text>
                </PressableWithoutFeedback>
            ) : null}
        </View>
    );
}

CaretBackHeader.displayName = 'CaretBackHeader';

export default CaretBackHeader;
