import type AppStateType from './types';
import type {UseAppStateProps} from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useAppState({onAppStateChange: _onAppStateChange}: UseAppStateProps = {}): AppStateType {
    // Since there's no AppState in web, we'll always return isForeground as true
    return {isForeground: true, isInactive: false, isBackground: false};
}

export default useAppState;
