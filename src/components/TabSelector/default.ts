import type {TabSelectorActionsContextType, TabSelectorStateContextType} from './types.context';

const defaultTabSelectorStateContextValue: TabSelectorStateContextType = {
    containerRef: {current: null},
};

const defaultTabSelectorActionsContextValue: TabSelectorActionsContextType = {
    onContainerLayout: () => {},
    onContainerScroll: () => {},
    scrollToTab: () => {},
    onTabLayout: () => {},
};

export {defaultTabSelectorStateContextValue, defaultTabSelectorActionsContextValue};
