import {useRoute} from '@react-navigation/native';
// eslint-disable-next-line you-dont-need-lodash-underscore/get
import lodashGet from 'lodash/get';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';

export default function useGeographicalStateFromRoute(stateParamName = 'state') {
    const route = useRoute();
    const stateFromUrlTemp = lodashGet(route, `params.${stateParamName}`) as unknown as string;
    // Check if state is valid
    return lodashGet(COMMON_CONST.STATES, stateFromUrlTemp) ? stateFromUrlTemp : '';
}
