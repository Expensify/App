import type {MaterialTopTabNavigationEventMap} from '@react-navigation/material-top-tabs';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {EventArg, EventMapCore, NavigationProp, NavigationState, ParamListBase, ScreenListeners} from '@react-navigation/native';
import {TabActions, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {TabSelectorProps} from '@components/TabSelector/types';
import useConfirmModal from '@hooks/useConfirmModal';
import getDiscardChangesModalConfig from '@hooks/useDiscardChangesConfirmation/getDiscardChangesModalConfig';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Growl from '@libs/Growl';
import Log from '@libs/Log';
import Tab from '@userActions/Tab';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTabRequest} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {backBehavior, defaultScreenOptions} from './OnyxTabNavigatorConfig';
import TabSwitchGuardContext from './TabSwitchGuardContext';
import type {RegisterTabSwitchGuard, TabSwitchGuard} from './TabSwitchGuardContext';

type OnyxTabNavigatorProps<TTabName extends string = SelectedTabRequest> = ChildrenProps & {
    /** ID of the tab component to be saved in onyx */
    id: string;

    /** Name of the selected tab */
    defaultSelectedTab?: TTabName;

    /** A function triggered when a tab has been selected */
    onTabSelected?: (newTabName: TTabName) => void;

    tabBar: (props: TabSelectorProps) => React.ReactNode;

    screenListeners?: ScreenListeners<NavigationState, MaterialTopTabNavigationEventMap>;

    /** Callback to register the focus trap container elements of the current active tab.
     * Use this in the parent component to get the focus trap container element of the active tab,
     * then pass it to the ScreenWrapper so that only focusable elements of the active tab are included in the focus trap
     * Check the `IOURequestStartPage.tsx` and `NewChatSelectorPage.tsx` components for example usage
     */
    onActiveTabFocusTrapContainerElementChanged?: (containerElement: HTMLElement | null) => void;

    /** Callback to register the focus trap container elements of the tab bar.
     * This callback is useful when the custom-rendered tab bar is supporting the focus trap container element registration (which is the case of `TabSelector.tsx` component).
     * Together, with the `onActiveTabFocusTrapContainerElementChanged` callback, we can manage the focus trap of the tab navigator in the parent component.
     */
    onTabBarFocusTrapContainerElementChanged?: (containerElement: HTMLElement | null) => void;

    /** Whether to show the label when the tab is inactive */
    shouldShowLabelWhenInactive?: boolean;

    /** Whether to lazy load the tab screens */
    lazyLoadEnabled?: boolean;

    /** Callback to handle the Pager's internal onPageSelected event callback */
    onTabSelect?: ({index}: {index: number}) => void;

    /** Whether tabs should have equal width */
    equalWidth?: boolean;
};

const TopTab = createMaterialTopTabNavigator<ParamListBase, string>();

// The TabFocusTrapContext is to collect the focus trap container element of each tab screen.
// This provider is placed in the OnyxTabNavigator component and the consumer is in the TabScreenWithFocusTrapWrapper component.
const TabFocusTrapContext = React.createContext<(tabName: string, containerElement: HTMLElement | null) => void>(() => {});

const getTabNames = (children: React.ReactNode): string[] => {
    const result: string[] = [];

    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) {
            return;
        }

        const element = child as React.ReactElement<{name?: string}>;

        if (typeof element.props.name === 'string') {
            result.push(element.props.name);
        }
    });

    return result;
};

// This takes all the same props as MaterialTopTabsNavigator: https://reactnavigation.org/docs/material-top-tab-navigator/#props,
// except ID is now required, and it gets a `selectedTab` from Onyx
// It also takes 2 more optional callbacks to manage the focus trap container elements of the tab bar and the active tab
function OnyxTabNavigator<TTabName extends string = SelectedTabRequest>({
    id,
    defaultSelectedTab,
    tabBar: TabBar,
    children,
    onTabBarFocusTrapContainerElementChanged,
    onActiveTabFocusTrapContainerElementChanged,
    onTabSelected = () => {},
    screenListeners,
    shouldShowLabelWhenInactive = true,
    lazyLoadEnabled = false,
    onTabSelect,
    equalWidth = false,
    ...rest
}: OnyxTabNavigatorProps<TTabName>) {
    const styles = useThemeStyles();
    const isFirstMountRef = useRef(true);
    // Mapping of tab name to focus trap container element
    const [focusTrapContainerElementMapping, setFocusTrapContainerElementMapping] = useState<Record<string, HTMLElement>>({});
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`);

    const tabNames = getTabNames(children);

    const validInitialTab = selectedTab && tabNames.includes(selectedTab) ? selectedTab : defaultSelectedTab;

    const LazyPlaceholder = useCallback(() => {
        return (
            <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading, styles.w100]}>
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    reasonAttributes={{context: 'OnyxTabNavigator.LazyPlaceholder'}}
                />
            </View>
        );
    }, [styles.fullScreenLoading, styles.w100]);

    // This callback is used to register the focus trap container element of each available tab screen
    const setTabFocusTrapContainerElement = (tabName: string, containerElement: HTMLElement | null) => {
        setFocusTrapContainerElementMapping((prevMapping) => {
            const resultMapping = {...prevMapping};
            if (containerElement) {
                resultMapping[tabName] = containerElement;
            } else {
                delete resultMapping[tabName];
            }
            return resultMapping;
        });
    };

    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    // Tab-switch discard guards, keyed by tab name. Tab screens register via `useDiscardChangesConfirmation`.
    const guardsRef = useRef<Map<string, TabSwitchGuard>>(new Map());
    const isDiscardModalOpenRef = useRef(false);

    const registerTabGuard: RegisterTabSwitchGuard = (guard) => {
        guardsRef.current.set(guard.tabName, guard);
        return () => {
            // Only clear if this exact guard is still registered, so a re-registration from another mount isn't wiped.
            if (guardsRef.current.get(guard.tabName) !== guard) {
                return;
            }
            guardsRef.current.delete(guard.tabName);
        };
    };

    const handleTabPress = (navigation: NavigationProp<ParamListBase>, event: EventArg<'tabPress', true, undefined>) => {
        if (isDiscardModalOpenRef.current) {
            event.preventDefault();
            return;
        }
        const navState = navigation.getState();
        const currentRouteName = navState.routes.at(navState.index)?.name;
        const guard = currentRouteName ? guardsRef.current.get(currentRouteName) : undefined;
        if (!guard || !guard.getHasUnsavedChanges()) {
            return;
        }
        const targetRoute = navState.routes.find((tabRoute) => tabRoute.key === event.target);
        if (!targetRoute || targetRoute.name === currentRouteName) {
            return;
        }
        event.preventDefault();
        isDiscardModalOpenRef.current = true;
        showConfirmModal({
            ...getDiscardChangesModalConfig(translate),
            shouldIgnoreBackHandlerDuringTransition: true,
        }).then((result) => {
            isDiscardModalOpenRef.current = false;
            if (result.action !== ModalActions.CONFIRM) {
                guard.onCancel?.();
                return;
            }
            // User confirmed: always jump to the target tab, even if onDiscard fails, rather than stranding them with no feedback.
            Promise.resolve()
                .then(() => guard.onDiscard())
                .catch((error: unknown) => {
                    Log.warn('[OnyxTabNavigator] Failed to run tab-switch onDiscard callback', {error});
                    Growl.error(translate('common.genericErrorMessage'));
                })
                .then(() => {
                    navigation.dispatch(TabActions.jumpTo(targetRoute.name));
                });
        });
    };

    /**
     * This is a TabBar wrapper component that includes the focus trap container element callback.
     * In `TabSelector.tsx` component, the callback prop to register focus trap container element is supported out of the box
     */
    const TabBarWithFocusTrapInclusion = useCallback(
        (props: TabSelectorProps) => {
            return (
                <TabBar
                    onFocusTrapContainerElementChanged={onTabBarFocusTrapContainerElementChanged}
                    shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                    equalWidth={equalWidth}
                    {...props}
                />
            );
        },
        [TabBar, onTabBarFocusTrapContainerElementChanged, shouldShowLabelWhenInactive, equalWidth],
    );

    // If the selected tab changes, we need to update the focus trap container element of the active tab
    useEffect(() => {
        onActiveTabFocusTrapContainerElementChanged?.(selectedTab ? focusTrapContainerElementMapping[selectedTab] : null);
    }, [selectedTab, focusTrapContainerElementMapping, onActiveTabFocusTrapContainerElementChanged]);

    if (isLoadingOnyxValue(selectedTabResult)) {
        return null;
    }

    return (
        <TabSwitchGuardContext.Provider value={registerTabGuard}>
            <TabFocusTrapContext.Provider value={setTabFocusTrapContainerElement}>
                <TopTab.Navigator
                    {...rest}
                    id={id}
                    initialRouteName={validInitialTab}
                    backBehavior={backBehavior}
                    keyboardDismissMode="none"
                    tabBar={TabBarWithFocusTrapInclusion}
                    onTabSelect={onTabSelect}
                    screenListeners={({navigation}: {navigation: NavigationProp<ParamListBase>}) => {
                        const callerListeners = screenListeners ?? {};
                        return {
                            ...callerListeners,
                            state: (e) => {
                                callerListeners.state?.(e);
                                const event = e as unknown as EventMapCore<NavigationState>['state'];
                                const state = event.data.state;
                                const index = state.index;
                                const routeNames = state.routeNames;
                                if (isFirstMountRef.current) {
                                    onTabSelect?.({index});
                                    isFirstMountRef.current = false;
                                }
                                const newSelectedTab = routeNames.at(index);
                                if (selectedTab === newSelectedTab) {
                                    return;
                                }
                                if (newSelectedTab) {
                                    Tab.setSelectedTab<TTabName>(id, newSelectedTab as TTabName);
                                }
                                onTabSelected(newSelectedTab as TTabName);
                            },
                            tabPress: (e) => {
                                // Let a caller's own tabPress run first; if it blocked the switch, don't also run the guard.
                                callerListeners.tabPress?.(e);
                                if (e.defaultPrevented) {
                                    return;
                                }
                                handleTabPress(navigation, e);
                            },
                        };
                    }}
                    screenOptions={{
                        ...defaultScreenOptions,
                        swipeEnabled: false,
                        lazy: lazyLoadEnabled,
                        lazyPlaceholder: LazyPlaceholder,
                    }}
                >
                    {children}
                </TopTab.Navigator>
            </TabFocusTrapContext.Provider>
        </TabSwitchGuardContext.Provider>
    );
}

/**
 * We should use this wrapper for each tab screen. This will help register the focus trap container element of each tab screen.
 * In the OnyxTabNavigator component, depending on the selected tab, we will further register the correct container element of the current active tab to the parent focus trap.
 * This must be used if we want to include all tabbable elements of one tab screen in the parent focus trap if that tab screen is active.
 * Example usage (check the `IOURequestStartPage.tsx` and `NewChatSelectorPage.tsx` components for more info)
 * ```tsx
 * <OnyxTabNavigator>
 *   <Tab.Screen>
 *     {() => (
 *       <TabScreenWithFocusTrapWrapper>
 *          <Content />
 *        </TabScreenWithFocusTrapWrapper>
 *     )}
 *   </Tab.Screen>
 * </OnyxTabNavigator>
 * ```
 */
function TabScreenWithFocusTrapWrapper({children}: {children?: React.ReactNode}) {
    const route = useRoute();
    const styles = useThemeStyles();
    const setTabContainerElement = useContext(TabFocusTrapContext);
    const handleContainerElementChanged = (element: HTMLElement | null) => {
        setTabContainerElement(route.name, element);
    };

    return (
        <FocusTrapContainerElement
            onContainerElementChanged={handleContainerElementChanged}
            style={[styles.w100, styles.h100]}
        >
            {children}
        </FocusTrapContainerElement>
    );
}

export default OnyxTabNavigator;

export {TabScreenWithFocusTrapWrapper, TopTab};
