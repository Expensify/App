import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {GettingStartedItem} from './hooks/useGettingStartedItems';

type GettingStartedRowProps = {
    item: GettingStartedItem;
};

function GettingStartedRow({item}: GettingStartedRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Checkmark'] as const);

    const navigateToItem = () => {
        if (!item.isFeatureEnabled) {
            item.enableFeature?.();
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(item.route));
    };

    return (
        <PressableWithoutFeedback
            onPress={navigateToItem}
            accessibilityLabel={item.label}
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW}
        >
            {({hovered}) => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldUseNarrowLayout ? styles.ph5 : styles.ph8, styles.pv3, hovered && styles.hoveredComponentBG]}>
                    {item.isComplete ? (
                        <View
                            style={[
                                StyleUtils.getCheckboxContainerStyle(variables.iconSizeNormal, variables.componentBorderRadiusSmall),
                                {backgroundColor: theme.icon, borderColor: theme.icon},
                            ]}
                        >
                            <Icon
                                src={icons.Checkmark}
                                fill={theme.textLight}
                                height={variables.iconSizeSemiSmall}
                                width={variables.iconSizeSemiSmall}
                            />
                        </View>
                    ) : (
                        <Checkbox
                            isChecked={false}
                            onPress={navigateToItem}
                            accessibilityLabel={item.label}
                        />
                    )}
                    <Text style={[styles.flex1, styles.textBold, item.isComplete && {color: theme.textSupporting}]}>{item.label}</Text>
                    {!item.isComplete && (
                        <Icon
                            src={icons.ArrowRight}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                            fill={theme.icon}
                        />
                    )}
                </View>
            )}
        </PressableWithoutFeedback>
    );
}

export default GettingStartedRow;
