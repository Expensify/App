import type {CommonActions, StackActionType} from '@react-navigation/native';
import type CONST from '@src/CONST';

type HistoryStackNavigatorAction = CommonActions.Action | StackActionType | HistoryStackNavigatorActionType;

type HistoryStackNavigatorActionType = {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.SET_HISTORY_PARAM;
    payload: {
        key: string;
        value: boolean;
    };
};

type SetHistoryParamActionType = HistoryStackNavigatorAction & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.SET_HISTORY_PARAM;
};

export type {HistoryStackNavigatorAction, HistoryStackNavigatorActionType, SetHistoryParamActionType};
