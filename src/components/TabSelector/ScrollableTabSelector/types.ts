// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView, View} from 'react-native';

type ScrollableTabSelectorStateContextType = {
    containerRef: React.RefObject<RNScrollView | null>;
};

type ScrollableTabSelectorActionsContextType = {
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

export type {ScrollableTabSelectorStateContextType, ScrollableTabSelectorActionsContextType, ScrollableTabSelectorContextProviderProps};
