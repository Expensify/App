import type {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs/lib/typescript/src/types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {Animated} from 'react-native';
import {View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import TabSelectorItem from './TabSelectorItem';

type TabSelectorProps = MaterialTopTabBarProps & {
    /* Callback fired when tab is pressed */
    onTabPress?: (name: string) => void;

    /** Callback to register focus trap container element */
    onFocusTrapContainerElementChanged?: (element: HTMLElement | null) => void;
};

type IconAndTitle = {
    icon: IconAsset;
    title: string;
};

function getIconAndTitle(route: string, translate: LocaleContextProps['translate']): IconAndTitle {
    switch (route) {
        case CONST.DEBUG.DETAILS:
            return {icon: Expensicons.Info, title: translate('debug.details')};
        case CONST.DEBUG.JSON:
            return {icon: Expensicons.Eye, title: translate('debug.JSON')};
        case CONST.DEBUG.REPORT_ACTIONS:
            return {icon: Expensicons.Document, title: translate('debug.reportActions')};
        case CONST.DEBUG.REPORT_ACTION_PREVIEW:
            return {icon: Expensicons.Document, title: translate('debug.reportActionPreview')};
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
        case CONST.TAB.SHARE.SHARE:
            return {icon: Expensicons.UploadAlt, title: translate('common.share')};
        case CONST.TAB.SHARE.SUBMIT:
            return {icon: Expensicons.Receipt, title: translate('common.submit')};
        default:
            throw new Error(`Route ${route} has no icon nor title set.`);
    }
}

function getOpacity(position: Animated.AnimatedInterpolation<number>, routesLength: number, tabIndex: number, active: boolean, affectedTabs: number[]) {
    const activeValue = active ? 1 : 0;
    const inactiveValue = active ? 0 : 1;

    if (routesLength > 1) {
        const inputRange = Array.from({length: routesLength}, (v, i) => i);

        return position.interpolate({
            inputRange,
            outputRange: inputRange.map((i) => (affectedTabs.includes(tabIndex) && i === tabIndex ? activeValue : inactiveValue)),
        });
    }
    return activeValue;
}

function TabSelector({state, navigation, onTabPress = () => {}, position, onFocusTrapContainerElementChanged}: TabSelectorProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const defaultAffectedAnimatedTabs = useMemo(() => Array.from({length: state.routes.length}, (v, i) => i), [state.routes.length]);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);

    const getBackgroundColor = useCallback(
        (routesLength: number, tabIndex: number, affectedTabs: number[]) => {
            if (routesLength > 1) {
                const inputRange = Array.from({length: routesLength}, (v, i) => i);

                return position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((i) => (affectedTabs.includes(tabIndex) && i === tabIndex ? theme.border : theme.appBG)),
                }) as unknown as Animated.AnimatedInterpolation<string>;
            }
            return theme.border;
        },
        [theme, position],
    );

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
                    const activeOpacity = getOpacity(position, state.routes.length, index, true, affectedAnimatedTabs);
                    const inactiveOpacity = getOpacity(position, state.routes.length, index, false, affectedAnimatedTabs);
                    const backgroundColor = getBackgroundColor(state.routes.length, index, affectedAnimatedTabs);
                    const isActive = index === state.index;
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
