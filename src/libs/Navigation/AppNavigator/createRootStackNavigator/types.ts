import type {CommonActions, DefaultNavigatorOptions, ParamListBase, StackActionType, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type CONST from '@src/CONST';

type RootStackNavigatorActionType =
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID;
          payload: {
              policyID: string;
          };
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
      }
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
          payload: {
              policyID: string;
          };
      };

type OpenWorkspaceSplitActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
};

type SwitchPolicyIdActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID;
};

type PushActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH};

type DismissModalActionType = RootStackNavigatorActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
};

type RootStackNavigatorConfig = {
    isSmallScreenWidth: boolean;
};

type RootStackNavigatorRouterOptions = StackRouterOptions;

type RootStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> & RootStackNavigatorConfig;

type RootStackNavigatorAction = CommonActions.Action | StackActionType | RootStackNavigatorActionType;

export type {
    OpenWorkspaceSplitActionType,
    SwitchPolicyIdActionType,
    PushActionType,
    DismissModalActionType,
    RootStackNavigatorAction,
    RootStackNavigatorActionType,
    RootStackNavigatorRouterOptions,
    RootStackNavigatorProps,
    RootStackNavigatorConfig,
};
