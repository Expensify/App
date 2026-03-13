import React, {createContext, useContext, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView, View} from 'react-native';
import {defaultScrollableTabSelectorActionsContextValue, defaultScrollableTabSelectorStateContextValue} from './default';
import scrollToTabUtil from './scrollToTab';
import type {ScrollableTabSelectorActionsContextType, ScrollableTabSelectorContextProviderProps, ScrollableTabSelectorStateContextType} from './types';

const ScrollableTabSelectorStateContext = createContext<ScrollableTabSelectorStateContextType>(defaultScrollableTabSelectorStateContextValue);
const ScrollableTabSelectorActionsContext = createContext<ScrollableTabSelectorActionsContextType>(defaultScrollableTabSelectorActionsContextValue);

function ScrollableTabSelectorContextProvider({children, activeTabKey}: ScrollableTabSelectorContextProviderProps) {
    const containerRef = useRef<RNScrollView>(null);
    const containerLayoutRef = useRef<{x: number; width: number}>({x: 0, width: 0});
    const tabsRef = useRef<Record<string, {ref: HTMLDivElement | View | null; width: number; x: number}>>({});

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

        const {x: tabX, width: tabWidth, ref: tabRef} = tabData;

        scrollToTabUtil({tabX, tabWidth, tabRef, containerRef, containerWidth: containerLayoutRef.current.width, containerX: containerLayoutRef.current.x});
    };

    const stateValue: ScrollableTabSelectorStateContextType = {containerRef};
    const actionsValue: ScrollableTabSelectorActionsContextType = {onContainerLayout, onContainerScroll, scrollToTab, registerTab, onTabLayout};

    return (
        <ScrollableTabSelectorStateContext.Provider value={stateValue}>
            <ScrollableTabSelectorActionsContext.Provider value={actionsValue}>{children}</ScrollableTabSelectorActionsContext.Provider>
        </ScrollableTabSelectorStateContext.Provider>
    );
}

function useScrollableTabSelectorState(): ScrollableTabSelectorStateContextType {
    return useContext(ScrollableTabSelectorStateContext);
}

function useScrollableTabSelectorActions(): ScrollableTabSelectorActionsContextType {
    return useContext(ScrollableTabSelectorActionsContext);
}

export {useScrollableTabSelectorState, useScrollableTabSelectorActions};
export default ScrollableTabSelectorContextProvider;
