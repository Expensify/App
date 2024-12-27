import type {EventMapCore, NavigationProp, NavigationState} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import getBackgroundColor from '@components/TabSelector/getBackground';
import getOpacity from '@components/TabSelector/getOpacity';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

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
        case CONST.DEBUG.TRANSACTION_VIOLATIONS:
            return {icon: Expensicons.Exclamation, title: translate('debug.violations')};
        default:
            throw new Error(`Route ${route} has no icon nor title set.`);
    }
}

const StackNavigator = createStackNavigator();

type DebugTabNavigatorRoute = {
    name: string;
    component: () => React.ReactNode;
};

type DebugTabNavigatorRoutes = DebugTabNavigatorRoute[];

type DebugTabNavigatorProps = {
    id: string;
    routes: DebugTabNavigatorRoutes;
};

function DebugTabNavigator({id, routes}: DebugTabNavigatorProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp<Record<string, void>>>();
    const {translate} = useLocalize();
    const [currentTab, setCurrentTab] = useState(routes.at(0)?.name);
    const defaultAffectedAnimatedTabs = useMemo(() => Array.from({length: routes.length}, (v, i) => i), [routes.length]);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);

    useEffect(() => {
        // It is required to wait transition end to reset affectedAnimatedTabs because tabs style is still animating during transition.
        setTimeout(() => {
            setAffectedAnimatedTabs(defaultAffectedAnimatedTabs);
        }, CONST.ANIMATED_TRANSITION);
    }, [defaultAffectedAnimatedTabs, currentTab]);

    return (
        <>
            <View style={styles.tabSelector}>
                {routes.map((route, index) => {
                    const isActive = route.name === currentTab;
                    const activeOpacity = getOpacity({
                        routesLength: routes.length,
                        tabIndex: index,
                        active: true,
                        affectedTabs: affectedAnimatedTabs,
                        position: undefined,
                        isActive,
                    });
                    const inactiveOpacity = getOpacity({
                        routesLength: routes.length,
                        tabIndex: index,
                        active: false,
                        affectedTabs: affectedAnimatedTabs,
                        position: undefined,
                        isActive,
                    });
                    const backgroundColor = getBackgroundColor({
                        routesLength: routes.length,
                        tabIndex: index,
                        affectedTabs: affectedAnimatedTabs,
                        theme,
                        position: undefined,
                        isActive,
                    });
                    const {icon, title} = getIconAndTitle(route.name, translate);

                    const onPress = () => {
                        navigation.navigate(route.name);
                        setCurrentTab(route.name);
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
            <StackNavigator.Navigator
                id={id}
                screenOptions={{
                    animationEnabled: false,
                    headerShown: false,
                }}
                screenListeners={{
                    state: (e) => {
                        const event = e as unknown as EventMapCore<NavigationState>['state'];
                        const state = event.data.state;
                        const routeNames = state.routeNames;
                        const newSelectedTab = state.routes.at(state.routes.length - 1)?.name;
                        if (currentTab === newSelectedTab || (currentTab && !routeNames.includes(currentTab))) {
                            return;
                        }
                        setCurrentTab(newSelectedTab);
                    },
                }}
            >
                {routes.map((route) => (
                    <StackNavigator.Screen
                        key={route.name}
                        name={route.name}
                        component={route.component}
                    />
                ))}
            </StackNavigator.Navigator>
        </>
    );
}

export default DebugTabNavigator;

export type {DebugTabNavigatorRoutes};
