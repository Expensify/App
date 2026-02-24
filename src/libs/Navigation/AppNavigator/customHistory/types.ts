import type {CommonActions, NavigationRoute, ParamListBase, StackActionType} from '@react-navigation/native';
import type CONST from '@src/CONST';

type HistoryStackNavigatorAction = CommonActions.Action | StackActionType | HistoryStackNavigatorActionType;

type HistoryStackNavigatorActionType = {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS;
    payload: {
        params: Record<string, unknown>;
    };
};

type PushParamsActionType = HistoryStackNavigatorAction & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS;
};

type CustomHistoryEntry = NavigationRoute<ParamListBase, string> | string;

export type {HistoryStackNavigatorAction, HistoryStackNavigatorActionType, PushParamsActionType, CustomHistoryEntry};
