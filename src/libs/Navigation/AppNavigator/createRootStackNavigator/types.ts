import type {CommonActions, StackActionType, StackRouterOptions} from '@react-navigation/native';
import type {WorkspaceScreenName} from '@libs/Navigation/types';
import type CONST from '@src/CONST';

type RootStackNavigatorActionType =
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
          payload: {
              policyID: string;
              screenName: WorkspaceScreenName;
          };
      };

type OpenWorkspaceSplitActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
};

type PushActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH};

type ReplaceActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.REPLACE};

type DismissModalActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
};

type RootStackNavigatorRouterOptions = StackRouterOptions;

type RootStackNavigatorAction = CommonActions.Action | StackActionType | RootStackNavigatorActionType;

export type {OpenWorkspaceSplitActionType, PushActionType, ReplaceActionType, DismissModalActionType, RootStackNavigatorAction, RootStackNavigatorRouterOptions};
