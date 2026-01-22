import React, {createContext, useRef, useState} from 'react';
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
    const tabsRef = useRef<Record<string, {ref: HTMLDivElement | View | null; width: number; x: number}>>({});

    const [containerX, setContainerX] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const onContainerLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        setContainerWidth(width);

        const activeTabData = tabsRef.current[activeTabKey];

        if (!activeTabData) {
            return;
        }

        const {x: tabX, width: tabWidth, ref: tabRef} = activeTabData;

        scrollToTabUtil({tabX, tabWidth, tabRef, containerRef, containerWidth, containerX, animated: false});
    };

    const onContainerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = event.nativeEvent.contentOffset.x;
        setContainerX(x);
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
    };

    const scrollToTab = (tabKey: string) => {
        const tabData = tabsRef.current[tabKey];

        if (!tabData) {
            return;
        }

        const {x: tabX, width: tabWidth, ref: tabRef} = tabData;

        scrollToTabUtil({tabX, tabWidth, tabRef, containerRef, containerWidth, containerX});
    };

    // React Compiler auto-memoization
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue = {containerRef, registerTab, onTabLayout, onContainerLayout, onContainerScroll, scrollToTab};

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    return <ScrollableTabSelectorContext.Provider value={contextValue}>{children}</ScrollableTabSelectorContext.Provider>;
}

export default ScrollableTabSelectorContextProvider;

export {ScrollableTabSelectorContext};
