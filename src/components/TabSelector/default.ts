import type {TabSelectorActionsContextType, TabSelectorStateContextType} from './types.context';

const defaultTabSelectorStateContextValue: TabSelectorStateContextType = {
    containerRef: {current: null},
};

const defaultTabSelectorActionsContextValue: TabSelectorActionsContextType = {
    onContainerLayout: () => {},
    onContainerScroll: () => {},
    scrollToTab: () => {},
    onTabLayout: () => {},
    getContainerX: () => 0,
};

export {defaultTabSelectorStateContextValue, defaultTabSelectorActionsContextValue};
