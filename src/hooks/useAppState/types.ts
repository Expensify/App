import type {AppStateStatus} from 'react-native';

type AppStateType = {
    isForeground: boolean;
    isInactive: boolean;
    isBackground: boolean;
};

type UseAppStateProps = {
    onAppStateChange?: (nextAppState: AppStateStatus) => void;
};

export default AppStateType;
export type {UseAppStateProps};
