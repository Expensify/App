import type AppStateType from './types';

function useAppState(): AppStateType {
    // Since there's no AppState in web, we'll always return isForeground as true
    return {isForeground: true, isInactive: false, isBackground: false};
}

export default useAppState;
