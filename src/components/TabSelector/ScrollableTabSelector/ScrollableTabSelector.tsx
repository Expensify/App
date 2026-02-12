import {TabActions} from '@react-navigation/native';
import React from 'react';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import {getIconTitleAndTestID, MEMOIZED_LAZY_TAB_SELECTOR_ICONS} from '@components/TabSelector/getIconTitleAndTestID';
import type {TabSelectorBaseItem, TabSelectorProps} from '@components/TabSelector/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ScrollableTabSelectorBase from './ScrollableTabSelectorBase';
import ScrollableTabSelectorContextProvider from './ScrollableTabSelectorContext';

function ScrollableTabSelector({
    state,
    navigation,
    onTabPress = () => {},
    position,
    onFocusTrapContainerElementChanged,
    shouldShowLabelWhenInactive = true,
    equalWidth = false,
}: TabSelectorProps) {
    const icons = useMemoizedLazyExpensifyIcons(MEMOIZED_LAZY_TAB_SELECTOR_ICONS);
    const {translate} = useLocalize();

    const tabs: TabSelectorBaseItem[] = state.routes.map((route) => {
        const {icon, title, testID, sentryLabel} = getIconTitleAndTestID(icons, route.name, translate);
        return {
            key: route.name,
            icon,
            title,
            testID,
            sentryLabel,
        };
    });

    const activeRouteName = state.routes[state.index]?.name ?? '';

    const handleTabPress = (tabKey: string) => {
        const route = state.routes.find((candidateRoute) => candidateRoute.name === tabKey);
        if (!route) {
            return;
        }

        const isActive = route.key === state.routes[state.index]?.key;
        if (isActive) {
            return;
        }

        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
            navigation.dispatch(TabActions.jumpTo(route.name));
        }

        onTabPress(route.name);
    };

    return (
        <FocusTrapContainerElement onContainerElementChanged={onFocusTrapContainerElementChanged}>
            <ScrollableTabSelectorContextProvider activeTabKey={activeRouteName}>
                <ScrollableTabSelectorBase
                    tabs={tabs}
                    activeTabKey={activeRouteName}
                    onTabPress={handleTabPress}
                    position={position}
                    shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                    equalWidth={equalWidth}
                />
            </ScrollableTabSelectorContextProvider>
        </FocusTrapContainerElement>
    );
}

export default ScrollableTabSelector;
