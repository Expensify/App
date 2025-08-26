import type {CommonActions, StackActionType, StackRouterOptions} from '@react-navigation/native';
import type {WorkspaceScreenName} from '@libs/Navigation/types';
import CONST from '@src/CONST';

type RootStackNavigatorActionType =
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY;
          payload: {
              isVisible: boolean;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
          payload: {
              policyID: string;
              screenName: WorkspaceScreenName;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.ADD_CUSTOM_HISTORY_ENTRY;
          payload: {
              key: string;
              isVisible: boolean;
          };
      };

type OpenWorkspaceSplitActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
};

type ToggleSidePanelWithHistoryActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY;
};

type AddCustomHistoryEntryActionType = RootStackNavigatorAction & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.ADD_CUSTOM_HISTORY_ENTRY;
};

type PushActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH};

type ReplaceActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.REPLACE};

type DismissModalActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
};

type RootStackNavigatorRouterOptions = StackRouterOptions;

type RootStackNavigatorAction = CommonActions.Action | StackActionType | RootStackNavigatorActionType;

export type {
    OpenWorkspaceSplitActionType,
    PushActionType,
    ReplaceActionType,
    DismissModalActionType,
    RootStackNavigatorAction,
    RootStackNavigatorRouterOptions,
    ToggleSidePanelWithHistoryActionType,
    AddCustomHistoryEntryActionType,
};
