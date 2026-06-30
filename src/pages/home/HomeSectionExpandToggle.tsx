import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type HomeSectionExpandToggleProps = {
    /** Whether the section is currently expanded */
    isExpanded: boolean;

    /** Callback to toggle the expanded state */
    onPress: () => void;

    /** Label rendered when the section is collapsed (e.g. "See 24 more") */
    collapsedLabel: string;

    /** Optional override for the wrapper style. Defaults to the standard ph5/ph8 padding used by home sections. */
    wrapperStyle?: StyleProp<ViewStyle>;
};

function HomeSectionExpandToggle({isExpanded, onPress, collapsedLabel, wrapperStyle}: HomeSectionExpandToggleProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);

    const label = isExpanded ? translate('common.showLess') : collapsedLabel;

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={label}
            sentryLabel="HomeSectionExpandToggle"
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv3, shouldUseNarrowLayout ? styles.ph5 : styles.ph8, wrapperStyle]}
        >
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, {width: variables.componentSizeNormal, height: variables.componentSizeNormal}]}>
                <Icon
                    src={isExpanded ? icons.UpArrow : icons.DownArrow}
                    fill={theme.icon}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </View>
            <Text style={styles.textStrong}>{label}</Text>
        </PressableWithFeedback>
    );
}

export default HomeSectionExpandToggle;
