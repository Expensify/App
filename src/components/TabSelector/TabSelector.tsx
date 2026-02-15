import {TabActions} from '@react-navigation/native';
import React from 'react';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {getIconTitleAndTestID, MEMOIZED_LAZY_TAB_SELECTOR_ICONS} from './getIconTitleAndTestID';
import TabSelectorBase from './TabSelectorBase';
import type {TabSelectorBaseItem, TabSelectorProps} from './types';

function TabSelector({
    state,
    navigation,
    onTabPress = () => {},
    position,
    onFocusTrapContainerElementChanged,
    shouldShowLabelWhenInactive = true,
    shouldShowProductTrainingTooltip = false,
    renderProductTrainingTooltip,
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
            <TabSelectorBase
                tabs={tabs}
                activeTabKey={activeRouteName}
                onTabPress={handleTabPress}
                position={position}
                shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                renderProductTrainingTooltip={renderProductTrainingTooltip}
                equalWidth={equalWidth}
            />
        </FocusTrapContainerElement>
    );
}

export default TabSelector;
