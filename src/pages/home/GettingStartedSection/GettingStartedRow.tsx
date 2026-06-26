import Badge from '@components/Badge';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {GettingStartedItem} from './hooks/useGettingStartedItems';

type GettingStartedRowProps = {
    item: GettingStartedItem;
};

function GettingStartedRow({item}: GettingStartedRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);

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
                    <View style={styles.gettingStartedRowIconContainer}>
                        <Checkbox
                            isChecked={item.isComplete}
                            onPress={navigateToItem}
                            accessibilityLabel={item.label}
                        />
                    </View>
                    <View style={styles.gettingStartedRowTextContainer}>
                        <Text style={[styles.widgetItemTitle, item.isComplete && styles.textSupporting]}>{item.label}</Text>
                        <Text style={styles.widgetItemSubtitle}>{item.subText}</Text>
                    </View>
                    {item.isComplete ? (
                        <Badge
                            text={translate('homePage.gettingStartedSection.done')}
                            icon={icons.Checkmark}
                            badgeStyles={[styles.widgetItemButton, styles.justifyContentCenter]}
                        />
                    ) : (
                        <Button
                            small
                            success
                            text={translate('homePage.gettingStartedSection.begin')}
                            onPress={navigateToItem}
                            style={styles.widgetItemButton}
                        />
                    )}
                </View>
            )}
        </PressableWithoutFeedback>
    );
}

export default GettingStartedRow;
