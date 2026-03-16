import React, {createContext, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import scrollToTabUtil from './scrollToTab';

type TabSelectorContextValue = {
    containerRef: React.RefObject<RNScrollView | null>;
    onContainerLayout: (event: LayoutChangeEvent) => void;
    onContainerScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollToTab: (tabKey: string) => void;
    onTabLayout: (tabKey: string, event: LayoutChangeEvent) => void;
};

type TabSelectorContextProviderProps = {
    activeTabKey: string;
    children: React.ReactNode;
};

const defaultValue: TabSelectorContextValue = {
    containerRef: {current: null},
    onContainerLayout: () => {},
    onContainerScroll: () => {},
    scrollToTab: () => {},
    onTabLayout: () => {},
};

const TabSelectorContext = createContext<TabSelectorContextValue>(defaultValue);

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

    // In case tab is not changed by tapping on a different tab we still
    // want to scroll to the selected tab to make sure it's in view
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

    // React Compiler auto-memoization
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue = {
        containerRef,
        onTabLayout,
        onContainerLayout,
        onContainerScroll,
        scrollToTab,
    };

    return <TabSelectorContext.Provider value={contextValue}>{children}</TabSelectorContext.Provider>;
}

export default TabSelectorContextProvider;

export {TabSelectorContext};
