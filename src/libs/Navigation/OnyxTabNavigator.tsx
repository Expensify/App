import type {MaterialTopTabNavigationEventMap} from '@react-navigation/material-top-tabs';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {EventMapCore, NavigationState, ScreenListeners} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import type {TabSelectorProps} from '@components/TabSelector/TabSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import type {IOURequestType} from '@libs/actions/IOU';
import Tab from '@userActions/Tab';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTabRequest} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {defaultScreenOptions} from './OnyxTabNavigatorConfig';

type OnyxTabNavigatorOnyxProps = {
    selectedTab: OnyxEntry<SelectedTabRequest>;
};

type OnyxTabNavigatorProps = OnyxTabNavigatorOnyxProps &
    ChildrenProps & {
        /** ID of the tab component to be saved in onyx */
        id: string;

        /** Name of the selected tab */
        selectedTab?: SelectedTabRequest;

        /** A function triggered when a tab has been selected */
        onTabSelected?: (newIouType: IOURequestType) => void;

        tabBar: (props: TabSelectorProps) => React.ReactNode;

        screenListeners?: ScreenListeners<NavigationState, MaterialTopTabNavigationEventMap>;

        /** Callback to register the focus trap container elements of the current active tab */
        onActiveTabFocusTrapContainerElementChanged?: (containerElement: HTMLElement | null) => void;

        /** Callback to register the focus trap container elements of the tab bar */
        onTabBarFocusTrapContainerElementChanged?: (containerElement: HTMLElement | null) => void;
    };

// eslint-disable-next-line rulesdir/no-inline-named-export
const TopTab = createMaterialTopTabNavigator();

const TabFocusTrapContext = React.createContext<(tabName: string, containerElement: HTMLElement | null) => void>(() => {});

// This takes all the same props as MaterialTopTabsNavigator: https://reactnavigation.org/docs/material-top-tab-navigator/#props,
// except ID is now required, and it gets a `selectedTab` from Onyx
function OnyxTabNavigator({
    id,
    selectedTab,
    tabBar: TabBar,
    children,
    onTabBarFocusTrapContainerElementChanged,
    onActiveTabFocusTrapContainerElementChanged,
    onTabSelected = () => {},
    screenListeners,
    ...rest
}: OnyxTabNavigatorProps) {
    const [focusTrapContainerElementMapping, setFocusTrapContainerElementMapping] = useState<Record<string, HTMLElement>>({});

    const setTabFocusTrapContainerElement = useCallback((tabName: string, containerElement: HTMLElement | null) => {
        setFocusTrapContainerElementMapping((prevMapping) => {
            const resultMapping = {...prevMapping};
            if (containerElement) {
                resultMapping[tabName] = containerElement;
            } else {
                delete resultMapping[tabName];
            }
            return resultMapping;
        });
    }, []);

    const TabBarWithFocusTrapInclusion = useCallback(
        (props: TabSelectorProps) => {
            return (
                <TabBar
                    onFocusTrapContainerElementChanged={onTabBarFocusTrapContainerElementChanged}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            );
        },
        [onTabBarFocusTrapContainerElementChanged, TabBar],
    );

    useEffect(() => {
        onActiveTabFocusTrapContainerElementChanged?.(selectedTab ? focusTrapContainerElementMapping[selectedTab] : null);
    }, [selectedTab, focusTrapContainerElementMapping, onActiveTabFocusTrapContainerElementChanged]);

    return (
        <TabFocusTrapContext.Provider value={setTabFocusTrapContainerElement}>
            <TopTab.Navigator
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...rest}
                id={id}
                initialRouteName={selectedTab}
                backBehavior="initialRoute"
                keyboardDismissMode="none"
                tabBar={TabBarWithFocusTrapInclusion}
                screenListeners={{
                    state: (e) => {
                        const event = e as unknown as EventMapCore<NavigationState>['state'];
                        const state = event.data.state;
                        const index = state.index;
                        const routeNames = state.routeNames;
                        Tab.setSelectedTab(id, routeNames[index] as SelectedTabRequest);
                        onTabSelected(routeNames[index] as IOURequestType);
                    },
                    ...(screenListeners ?? {}),
                }}
                screenOptions={defaultScreenOptions}
            >
                {children}
            </TopTab.Navigator>
        </TabFocusTrapContext.Provider>
    );
}

function TabScreenWithFocusTrapWrapper({children}: {children?: React.ReactNode}) {
    const route = useRoute();
    const styles = useThemeStyles();
    const setTabContainerElement = useContext(TabFocusTrapContext);
    const handleContainerElementChanged = useCallback(
        (element: HTMLElement | null) => {
            setTabContainerElement(route.name, element);
        },
        [setTabContainerElement, route.name],
    );

    return (
        <FocusTrapContainerElement
            onContainerElementChanged={handleContainerElementChanged}
            style={[styles.w100, styles.h100]}
        >
            {children}
        </FocusTrapContainerElement>
    );
}

OnyxTabNavigator.displayName = 'OnyxTabNavigator';

export default withOnyx<OnyxTabNavigatorProps, OnyxTabNavigatorOnyxProps>({
    selectedTab: {
        key: ({id}) => `${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`,
    },
})(OnyxTabNavigator);

export {TabScreenWithFocusTrapWrapper, TopTab};
