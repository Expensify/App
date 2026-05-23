import type {CommonActions, StackActionType, StackRouterOptions} from '@react-navigation/native';
import type {DomainScreenName, WorkspaceScreenName} from '@libs/Navigation/types';
import type CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

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
          type: typeof CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP;
          payload: {route: Route};
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP;
          payload: {expectedRouteName: string};
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
          payload: {
              policyID: string;
              screenName: WorkspaceScreenName;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_DOMAIN_SPLIT;
          payload: {
              domainAccountID: number;
              screenName: DomainScreenName;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.PRELOAD;
          payload: {
              name: string;
              params: {
                  screen: string;
                  params: Record<string, unknown>;
              };
          };
      };

type OpenWorkspaceSplitActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
};

type OpenDomainSplitActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_DOMAIN_SPLIT;
};

type ToggleSidePanelWithHistoryActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY;
};

type PreloadActionType = RootStackNavigatorAction & {type: typeof CONST.NAVIGATION.ACTION_TYPE.PRELOAD};

type PushActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH};

type ReplaceActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.REPLACE};

type DismissModalActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
};

type ReplaceFullscreenUnderRHPActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP;
    payload: {route: Route};
};

type RemoveFullscreenUnderRHPActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP;
    payload: {expectedRouteName: string};
};

type RootStackNavigatorRouterOptions = StackRouterOptions;

type RootStackNavigatorAction = CommonActions.Action | StackActionType | RootStackNavigatorActionType;

export type {
    OpenWorkspaceSplitActionType,
    OpenDomainSplitActionType,
    PushActionType,
    ReplaceActionType,
    DismissModalActionType,
    PreloadActionType,
    ReplaceFullscreenUnderRHPActionType,
    RemoveFullscreenUnderRHPActionType,
    RootStackNavigatorAction,
    RootStackNavigatorRouterOptions,
    ToggleSidePanelWithHistoryActionType,
};
