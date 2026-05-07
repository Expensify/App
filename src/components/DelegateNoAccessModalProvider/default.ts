import type {DelegateNoAccessActionsContextType, DelegateNoAccessStateContextType} from './types';

const defaultDelegateNoAccessStateContextValue: DelegateNoAccessStateContextType = {
    isActingAsDelegate: false,
    isDelegateAccessRestricted: false,
};

const defaultDelegateNoAccessActionsContextValue: DelegateNoAccessActionsContextType = {
    showDelegateNoAccessModal: () => {},
};

export {defaultDelegateNoAccessStateContextValue, defaultDelegateNoAccessActionsContextValue};
