import type {ScrollableTabSelectorActionsContextType, ScrollableTabSelectorStateContextType} from './types';

const defaultScrollableTabSelectorStateContextValue: ScrollableTabSelectorStateContextType = {
    containerRef: {current: null},
};

const defaultScrollableTabSelectorActionsContextValue: ScrollableTabSelectorActionsContextType = {
    onContainerLayout: () => {},
    onContainerScroll: () => {},
    scrollToTab: () => {},
    registerTab: () => {},
    onTabLayout: () => {},
};

export {defaultScrollableTabSelectorStateContextValue, defaultScrollableTabSelectorActionsContextValue};
