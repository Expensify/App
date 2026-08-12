import type CONST from '@src/CONST';

import type {CommonActions, NavigationRoute, ParamListBase, StackActionType} from '@react-navigation/native';

type PushParamsActionType = {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS;
    payload: {
        params: Record<string, unknown>;
    };
};

type PushParamsRouterAction = CommonActions.Action | StackActionType | PushParamsActionType;

type CustomHistoryEntry = NavigationRoute<ParamListBase, string> | string;

export type {PushParamsRouterAction, PushParamsActionType, CustomHistoryEntry};
