import React, {createContext, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView, View} from 'react-native';
import scrollToTabUtil from './scrollToTab';

type ScrollableTabSelectorContextValue = {
    containerRef: React.RefObject<RNScrollView | null>;
    onContainerLayout: (event: LayoutChangeEvent) => void;
    onContainerScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollToTab: (tabKey: string) => void;
    registerTab: (tabKey: string, ref: HTMLDivElement | View | null) => void;
    onTabLayout: (tabKey: string, event: LayoutChangeEvent) => void;
};

type ScrollableTabSelectorContextProviderProps = {
    activeTabKey: string;
    children: React.ReactNode;
};

const defaultValue: ScrollableTabSelectorContextValue = {
    containerRef: {current: null},
    onContainerLayout: () => {},
    onContainerScroll: () => {},
    scrollToTab: () => {},
    registerTab: () => {},
    onTabLayout: () => {},
};

const ScrollableTabSelectorContext = createContext<ScrollableTabSelectorContextValue>(defaultValue);

function ScrollableTabSelectorContextProvider({children, activeTabKey}: ScrollableTabSelectorContextProviderProps) {
    const containerRef = useRef<RNScrollView>(null);
    const containerLayoutRef = useRef<{x: number; width: number}>({x: 0, width: 0});
    const tabsRef = useRef<Record<string, {ref: HTMLDivElement | View | null; width: number; x: number}>>({});
    const lastPressedTab = useRef('');

    const onContainerLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        containerLayoutRef.current.width = width;
    };

    const onContainerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        containerLayoutRef.current.x = x;
    };

    const registerTab = (tabKey: string, ref: HTMLDivElement | View | null) => {
        if (ref === null) {
            return;
        }

        tabsRef.current[tabKey] = {...tabsRef.current[tabKey], ref};
    };

    const onTabLayout = (tabKey: string, event: LayoutChangeEvent) => {
        const {x, width} = event.nativeEvent.layout;
        tabsRef.current[tabKey] = {...tabsRef.current[tabKey], x, width};

        if (tabKey === activeTabKey) {
            const {ref: tabRef} = tabsRef.current[tabKey];
            scrollToTabUtil({tabX: x, tabWidth: width, tabRef, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x, animated: false});
        }
    };

    const scrollToTab = (tabKey: string) => {
        const tabData = tabsRef.current[tabKey];

        if (!tabData) {
            return;
        }

        lastPressedTab.current = tabKey;

        const {x: tabX, width: tabWidth, ref: tabRef} = tabData;

        scrollToTabUtil({tabX, tabWidth, tabRef, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x});
    };

    // In case tab is not changed by tapping on a different tab we still
    // want to scroll to the selected tab to make sure it's in view
    useEffect(() => {
        if (activeTabKey === lastPressedTab.current) {
            return;
        }

        const tabData = tabsRef.current[activeTabKey];

        if (!tabData) {
            return;
        }

        const {x: tabX, width: tabWidth, ref: tabRef} = tabData;

        scrollToTabUtil({tabX, tabWidth, tabRef, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x});
    }, [activeTabKey]);

    // React Compiler auto-memoization
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue = {containerRef, registerTab, onTabLayout, onContainerLayout, onContainerScroll, scrollToTab};

    return <ScrollableTabSelectorContext.Provider value={contextValue}>{children}</ScrollableTabSelectorContext.Provider>;
}

export default ScrollableTabSelectorContextProvider;

export {ScrollableTabSelectorContext};
