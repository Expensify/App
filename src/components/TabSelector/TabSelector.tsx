import type {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs/lib/typescript/src/types';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import getBackgroundColor from './getBackground';
import getOpacity from './getOpacity';
import TabSelectorItem from './TabSelectorItem';

type TabSelectorProps = MaterialTopTabBarProps & {
    /* Callback fired when tab is pressed */
    onTabPress?: (name: string) => void;

    /** Callback to register focus trap container element */
    onFocusTrapContainerElementChanged?: (element: HTMLElement | null) => void;

    /** Whether to show the label when the tab is inactive */
    shouldShowLabelWhenInactive?: boolean;
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
            return {icon: Expensicons.ReceiptScan, title: translate('tabSelector.scan')};
        case CONST.TAB.NEW_CHAT:
            return {icon: Expensicons.User, title: translate('tabSelector.chat')};
        case CONST.TAB.NEW_ROOM:
            return {icon: Expensicons.Hashtag, title: translate('tabSelector.room')};
        case CONST.TAB_REQUEST.DISTANCE:
            return {icon: Expensicons.Car, title: translate('common.distance')};
        case CONST.TAB_REQUEST.PER_DIEM:
            return {icon: Expensicons.CalendarSolid, title: translate('common.perDiem')};
        default:
            throw new Error(`Route ${route} has no icon nor title set.`);
    }
}

function TabSelector({state, navigation, onTabPress = () => {}, position, onFocusTrapContainerElementChanged, shouldShowLabelWhenInactive = true}: TabSelectorProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const defaultAffectedAnimatedTabs = useMemo(() => Array.from({length: state.routes.length}, (v, i) => i), [state.routes.length]);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);

    useEffect(() => {
        // It is required to wait transition end to reset affectedAnimatedTabs because tabs style is still animating during transition.
        setTimeout(() => {
            setAffectedAnimatedTabs(defaultAffectedAnimatedTabs);
        }, CONST.ANIMATED_TRANSITION);
    }, [defaultAffectedAnimatedTabs, state.index]);

    return (
        <FocusTrapContainerElement onContainerElementChanged={onFocusTrapContainerElementChanged}>
            <View style={styles.tabSelector}>
                {state.routes.map((route, index) => {
                    const isActive = index === state.index;
                    const activeOpacity = getOpacity({routesLength: state.routes.length, tabIndex: index, active: true, affectedTabs: affectedAnimatedTabs, position, isActive});
                    const inactiveOpacity = getOpacity({routesLength: state.routes.length, tabIndex: index, active: false, affectedTabs: affectedAnimatedTabs, position, isActive});
                    const backgroundColor = getBackgroundColor({routesLength: state.routes.length, tabIndex: index, affectedTabs: affectedAnimatedTabs, theme, position, isActive});
                    const {icon, title} = getIconAndTitle(route.name, translate);

                    const onPress = () => {
                        if (isActive) {
                            return;
                        }

                        setAffectedAnimatedTabs([state.index, index]);

                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!event.defaultPrevented) {
                            // The `merge: true` option makes sure that the params inside the tab screen are preserved
                            navigation.navigate({key: route.key, merge: true});
                        }

                        onTabPress(route.name);
                    };

                    return (
                        <TabSelectorItem
                            key={route.name}
                            icon={icon}
                            title={title}
                            onPress={onPress}
                            activeOpacity={activeOpacity}
                            inactiveOpacity={inactiveOpacity}
                            backgroundColor={backgroundColor}
                            isActive={isActive}
                            shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                        />
                    );
                })}
            </View>
        </FocusTrapContainerElement>
    );
}

TabSelector.displayName = 'TabSelector';

export default TabSelector;

export type {TabSelectorProps};
