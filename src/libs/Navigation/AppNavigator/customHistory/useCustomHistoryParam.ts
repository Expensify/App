import {useNavigation, useRoute} from '@react-navigation/native';
import SCREEN_TO_HISTORY_PARAM from '@libs/Navigation/linkingConfig/RELATIONS/SCREEN_TO_HISTORY_PARAM';
import CONST from '@src/CONST';
import type {Screen} from '@src/SCREENS';

/**
 * Custom hook for managing navigation history entries
 * It works as useState but it pushes the history entry when the value is true.
 * The value will change to false if the user navigates back with the browser back button.
 * It uses screen param to store the information and make it visible in the url so the state persist after refreshing the page.
 *
 * @returns A tuple containing [historyParam, setHistoryParam] where:
 *          - historyParam: boolean | undefined - The current state of the history parameter
 *          - setHistoryParam: (value: boolean) => void - Function to update the history parameter
 */
function useCustomHistoryParam() {
    const navigation = useNavigation();
    const route = useRoute();
    const historyParamName = SCREEN_TO_HISTORY_PARAM[route.name as Screen];

    if (!historyParamName || typeof historyParamName !== 'string') {
        throw new Error(`Screen ${route.name} does not have a history param. You can use this hook only on the screens that have one defined in SCREEN_TO_HISTORY_PARAM.`);
    }

    const historyParam = route.params && (route.params as Record<string, unknown>)[historyParamName] ? ((route.params as Record<string, unknown>)[historyParamName] as boolean) : false;

    if (typeof historyParam !== 'boolean') {
        throw new Error(`The history param ${historyParamName} is not a boolean. Make sure that you used getHistoryParamParse for this screen in linkingConfig/config.ts`);
    }

    return [
        historyParam,
        (value: boolean) => {
            navigation.dispatch({
                type: CONST.NAVIGATION.ACTION_TYPE.SET_HISTORY_PARAM,
                payload: {key: historyParamName, value},
            });
        },
    ] as const;
}

export default useCustomHistoryParam;
