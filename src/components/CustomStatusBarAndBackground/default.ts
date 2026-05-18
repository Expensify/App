import type {CustomStatusBarAndBackgroundActionsContextType, CustomStatusBarAndBackgroundStateContextType} from './types';

const defaultCustomStatusBarAndBackgroundStateContextValue: CustomStatusBarAndBackgroundStateContextType = {
    isRootStatusBarEnabled: true,
};

const defaultCustomStatusBarAndBackgroundActionsContextValue: CustomStatusBarAndBackgroundActionsContextType = {
    setRootStatusBarEnabled: () => undefined,
};

export {defaultCustomStatusBarAndBackgroundActionsContextValue, defaultCustomStatusBarAndBackgroundStateContextValue};
