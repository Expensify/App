import type {ParamListBase} from '@react-navigation/native';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import type {CustomHistoryEntry} from './types';

function enhanceStateWithHistory(state: PlatformStackNavigationState<ParamListBase>) {
    return {
        ...state,
        history: state.routes.map((route) => ({...route})) as CustomHistoryEntry[],
    };
}

// eslint-disable-next-line import/prefer-default-export
export {enhanceStateWithHistory};
