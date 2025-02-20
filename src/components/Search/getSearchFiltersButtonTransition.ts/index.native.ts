import {LinearTransition} from 'react-native-reanimated';
import type {GetSearchFiltersButtonTransitionType} from './types';

function getSearchFiltersButtonTransition(): GetSearchFiltersButtonTransitionType {
    return LinearTransition;
}

export default getSearchFiltersButtonTransition;
