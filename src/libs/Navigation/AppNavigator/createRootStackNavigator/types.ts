import type CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

import type {CommonActions, StackActionType, StackRouterOptions} from '@react-navigation/native';

type RootStackNavigatorActionType =
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY;
          payload: {
              isVisible: boolean;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MFA_MODAL_NAVIGATOR_WITH_HISTORY;
          payload: {
              isVisible: boolean;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY;
          payload: {
              isVisible: boolean;
              modalId: string;
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
          type: typeof CONST.NAVIGATION.ACTION_TYPE.PRELOAD;
          payload: {
              name: string;
              params: {
                  screen: string;
                  params: Record<string, unknown>;
              };
          };
      };

type ToggleSidePanelWithHistoryActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY;
};

type ToggleMfaModalNavigatorWithHistoryActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MFA_MODAL_NAVIGATOR_WITH_HISTORY;
};

type ToggleModalWithHistoryActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY;
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
    PushActionType,
    ReplaceActionType,
    DismissModalActionType,
    PreloadActionType,
    ReplaceFullscreenUnderRHPActionType,
    RemoveFullscreenUnderRHPActionType,
    RootStackNavigatorAction,
    RootStackNavigatorRouterOptions,
    ToggleSidePanelWithHistoryActionType,
    ToggleMfaModalNavigatorWithHistoryActionType,
    ToggleModalWithHistoryActionType,
};
