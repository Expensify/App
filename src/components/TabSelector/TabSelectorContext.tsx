import type {HorizontalSafeAreaReach} from '@components/HorizontalSafeArea/useHorizontalSafeAreaReach';
import {NO_REACH} from '@components/HorizontalSafeArea/useHorizontalSafeAreaReach';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

import React, {createContext, useContext, useEffect, useRef} from 'react';

import type {TabSelectorActionsContextType, TabSelectorContextProviderProps, TabSelectorStateContextType} from './types.context';

import {defaultTabSelectorActionsContextValue, defaultTabSelectorStateContextValue} from './default';
import scrollToTabUtil from './scrollToTab';

const TabSelectorStateContext = createContext<TabSelectorStateContextType>(defaultTabSelectorStateContextValue);
const TabSelectorActionsContext = createContext<TabSelectorActionsContextType>(defaultTabSelectorActionsContextValue);

function TabSelectorContextProvider({children, activeTabKey}: TabSelectorContextProviderProps) {
    const containerRef = useRef<ComponentRef<typeof RNScrollView>>(null);
    const containerLayoutRef = useRef({containerX: 0, containerWidth: 0, safeAreaReach: NO_REACH});
    const tabsRef = useRef<Record<string, {width: number; x: number}>>({});
    const lastScrolledToTab = useRef('');
    const laidOutContainerRef = useRef<ComponentRef<typeof RNScrollView>>(null);

    const onContainerLayout = (event: LayoutChangeEvent, safeAreaReach: HorizontalSafeAreaReach) => {
        containerLayoutRef.current.containerWidth = event.nativeEvent.layout.width;
        containerLayoutRef.current.safeAreaReach = safeAreaReach;

        // A tab row that remounts under this provider (like one rendered per tab) mounts at the previous row's offset
        // through its initial `contentOffset`. Web ignores that prop and starts the row at the beginning, so the row is
        // put back where the previous one was before the active tab is scrolled into view.
        if (containerRef.current !== laidOutContainerRef.current) {
            laidOutContainerRef.current = containerRef.current;
            containerRef.current?.scrollTo({x: containerLayoutRef.current.containerX, animated: false});
        }

        const tabData = activeTabKey ? tabsRef.current[activeTabKey] : undefined;

        if (!tabData) {
            return;
        }

        const {x: tabX, width: tabWidth} = tabData;

        if (tabWidth) {
            scrollToTabUtil({tabX, tabWidth, containerRef, ...containerLayoutRef.current, animated: false});
        }
    };

    const onContainerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        containerLayoutRef.current.containerX = x;
    };

    const onTabLayout = (tabKey: string, event: LayoutChangeEvent) => {
        const {x, width} = event.nativeEvent.layout;
        tabsRef.current[tabKey] = {...tabsRef.current[tabKey], x, width};

        if (tabKey === activeTabKey && containerLayoutRef.current.containerWidth !== 0) {
            scrollToTabUtil({tabX: x, tabWidth: width, containerRef, ...containerLayoutRef.current, animated: false});
        }
    };

    const scrollToTab = (tabKey: string) => {
        const tabData = tabsRef.current[tabKey];

        if (!tabData) {
            return;
        }

        lastScrolledToTab.current = tabKey;

        const {x: tabX, width: tabWidth} = tabData;

        scrollToTabUtil({tabX, tabWidth, containerRef, ...containerLayoutRef.current});
    };

    // Sync scroll position when the active tab changes externally (e.g. back/forward browser history buttons, not user tap).
    // The first run finds no tab laid out yet, so it only records the tab the row starts on, which the layout callbacks scroll to.
    useEffect(() => {
        if (!activeTabKey || activeTabKey === lastScrolledToTab.current) {
            return;
        }

        lastScrolledToTab.current = activeTabKey;

        const tabData = activeTabKey ? tabsRef.current[activeTabKey] : undefined;

        if (!tabData) {
            return;
        }

        const {x: tabX, width: tabWidth} = tabData;

        scrollToTabUtil({tabX, tabWidth, containerRef, ...containerLayoutRef.current});
    }, [activeTabKey]);

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateValue: TabSelectorStateContextType = {containerRef};

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue: TabSelectorActionsContextType = {onContainerLayout, onContainerScroll, scrollToTab, onTabLayout, getContainerX: () => containerLayoutRef.current.containerX};

    return (
        <TabSelectorStateContext.Provider value={stateValue}>
            <TabSelectorActionsContext.Provider value={actionsValue}>{children}</TabSelectorActionsContext.Provider>
        </TabSelectorStateContext.Provider>
    );
}

function useTabSelectorState(): TabSelectorStateContextType {
    return useContext(TabSelectorStateContext);
}

function useTabSelectorActions(): TabSelectorActionsContextType {
    return useContext(TabSelectorActionsContext);
}

export {useTabSelectorState, useTabSelectorActions};
export default TabSelectorContextProvider;
