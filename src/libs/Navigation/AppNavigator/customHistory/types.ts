import type {CommonActions, StackActionType} from '@react-navigation/native';
import type CONST from '@src/CONST';

type HistoryStackNavigatorAction = CommonActions.Action | StackActionType | HistoryStackNavigatorActionType;

type HistoryStackNavigatorActionType =
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH_HISTORY_ENTRY;
          payload: {
              id: string;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.POP_HISTORY_ENTRY;
          payload: {
              id: string;
          };
      };

type PushHistoryEntryActionType = HistoryStackNavigatorAction & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH_HISTORY_ENTRY;
};

type PopHistoryEntryActionType = HistoryStackNavigatorAction & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.POP_HISTORY_ENTRY;
};

type SetParamsActionType = HistoryStackNavigatorAction & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.SET_PARAMS;
};

export type {HistoryStackNavigatorAction, HistoryStackNavigatorActionType, PushHistoryEntryActionType, PopHistoryEntryActionType, SetParamsActionType};
