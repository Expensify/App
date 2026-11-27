import type {HorizontalSafeAreaReach} from '@components/HorizontalSafeArea/useHorizontalSafeAreaReach';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

type TabSelectorStateContextType = {
    containerRef: React.RefObject<ComponentRef<typeof RNScrollView> | null>;
};

type TabSelectorActionsContextType = {
    /** `safeAreaReach` is how far the container reaches into the horizontal safe area, where tabs aren't visible. */
    onContainerLayout: (event: LayoutChangeEvent, safeAreaReach: HorizontalSafeAreaReach) => void;
    onContainerScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollToTab: (tabKey: string) => void;
    onTabLayout: (tabKey: string, event: LayoutChangeEvent) => void;

    /** The row's last scroll offset, which outlives the row when it remounts under the same provider. */
    getContainerX: () => number;
};

type TabSelectorContextProviderProps = {
    activeTabKey: string | undefined;
    children: React.ReactNode;
};

export type {TabSelectorStateContextType, TabSelectorActionsContextType, TabSelectorContextProviderProps};
