import React, {createContext, useContext, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import {defaultTabSelectorActionsContextValue, defaultTabSelectorStateContextValue} from './default';
import scrollToTabUtil from './scrollToTab';
import type {TabSelectorActionsContextType, TabSelectorContextProviderProps, TabSelectorStateContextType} from './types.context';

const TabSelectorStateContext = createContext<TabSelectorStateContextType>(defaultTabSelectorStateContextValue);
const TabSelectorActionsContext = createContext<TabSelectorActionsContextType>(defaultTabSelectorActionsContextValue);

function TabSelectorContextProvider({children, activeTabKey}: TabSelectorContextProviderProps) {
    const containerRef = useRef<RNScrollView>(null);
    const containerLayoutRef = useRef<{x: number; width: number}>({x: 0, width: 0});
    const tabsRef = useRef<Record<string, {width: number; x: number}>>({});
    const lastScrolledToTab = useRef('');

    const onContainerLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        containerLayoutRef.current.width = width;

        const tabData = tabsRef.current[activeTabKey];

        if (!tabData) {
            return;
        }

        const {x: tabX, width: tabWidth} = tabData;

        if (tabWidth) {
            scrollToTabUtil({tabX, tabWidth, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x, animated: false});
        }
    };

    const onContainerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        containerLayoutRef.current.x = x;
    };

    const onTabLayout = (tabKey: string, event: LayoutChangeEvent) => {
        const {x, width} = event.nativeEvent.layout;
        tabsRef.current[tabKey] = {...tabsRef.current[tabKey], x, width};

        if (tabKey === activeTabKey && containerLayoutRef.current.width !== 0) {
            scrollToTabUtil({tabX: x, tabWidth: width, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x, animated: false});
        }
    };

    const scrollToTab = (tabKey: string) => {
        const tabData = tabsRef.current[tabKey];

        if (!tabData) {
            return;
        }

        lastScrolledToTab.current = tabKey;

        const {x: tabX, width: tabWidth} = tabData;

        scrollToTabUtil({tabX, tabWidth, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x});
    };

    // Sync scroll position when the active tab changes externally (e.g. back/forward browser history buttons, not user tap)
    useEffect(() => {
        if (!lastScrolledToTab.current || activeTabKey === lastScrolledToTab.current) {
            return;
        }

        lastScrolledToTab.current = activeTabKey;

        const tabData = tabsRef.current[activeTabKey];

        if (!tabData) {
            return;
        }

        const {x: tabX, width: tabWidth} = tabData;

        scrollToTabUtil({tabX, tabWidth, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x});
    }, [activeTabKey]);

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateValue: TabSelectorStateContextType = {containerRef};

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue: TabSelectorActionsContextType = {onContainerLayout, onContainerScroll, scrollToTab, onTabLayout};

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
