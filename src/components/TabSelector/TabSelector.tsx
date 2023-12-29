import {MaterialTopTabNavigationHelpers} from '@react-navigation/material-top-tabs/lib/typescript/src/types';
import {TabNavigationState} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import {LocaleContextProps} from '@components/LocaleContextProvider';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import tabNavigatorAnimationEnabled from '@libs/Navigation/tabNavigatorAnimationEnabled';
import {RootStackParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import IconAsset from '@src/types/utils/IconAsset';
import TabSelectorItem from './TabSelectorItem';

type TabSelectorProps = {
    /* Navigation state provided by React Navigation */
    state: TabNavigationState<RootStackParamList>;

    /* Navigation functions provided by React Navigation */
    navigation: MaterialTopTabNavigationHelpers;

    /* Callback fired when tab is pressed */
    onTabPress?: (name: string) => void;
};

type IconAndTitle = {
    icon: IconAsset;
    title: string;
};

function getIconAndTitle(route: string, translate: LocaleContextProps['translate']): IconAndTitle {
    switch (route) {
        case CONST.TAB_REQUEST.MANUAL:
            return {icon: Expensicons.Pencil, title: translate('tabSelector.manual')};
        case CONST.TAB_REQUEST.SCAN:
            return {icon: Expensicons.Receipt, title: translate('tabSelector.scan')};
        case CONST.TAB.NEW_CHAT:
            return {icon: Expensicons.User, title: translate('tabSelector.chat')};
        case CONST.TAB.NEW_ROOM:
            return {icon: Expensicons.Hashtag, title: translate('tabSelector.room')};
        case CONST.TAB_REQUEST.DISTANCE:
            return {icon: Expensicons.Car, title: translate('common.distance')};
        default:
            throw new Error(`Route ${route} has no icon nor title set.`);
    }
}

function TabSelector({state, navigation, onTabPress}: TabSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const tabs = useMemo(
        () =>
            state.routes.map((route, index) => {
                const isFocused = index === state.index;
                const {icon, title} = getIconAndTitle(route.name, translate);

                const onPress = () => {
                    if (isFocused) {
                        return;
                    }

                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!event.defaultPrevented) {
                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                        navigation.navigate({key: route.key, merge: true});
                    }

                    onTabPress?.(route.name);
                };

                return (
                    <TabSelectorItem
                        key={route.name}
                        icon={icon}
                        title={title}
                        onPress={onPress}
                        isFocused={isFocused}
                        animationEnabled={tabNavigatorAnimationEnabled}
                    />
                );
            }),
        [navigation, onTabPress, state.index, state.routes, translate],
    );

    return <View style={styles.tabSelector}>{tabs}</View>;
}

TabSelector.displayName = 'TabSelector';

export default TabSelector;
