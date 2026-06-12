// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

type TabSelectorStateContextType = {
    containerRef: React.RefObject<RNScrollView | null>;
};

type TabSelectorActionsContextType = {
    onContainerLayout: (event: LayoutChangeEvent) => void;
    onContainerScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollToTab: (tabKey: string) => void;
    onTabLayout: (tabKey: string, event: LayoutChangeEvent) => void;
};

type TabSelectorContextProviderProps = {
    activeTabKey: string;
    children: React.ReactNode;
};

export type {TabSelectorStateContextType, TabSelectorActionsContextType, TabSelectorContextProviderProps};
