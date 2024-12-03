import type {CommonActions, DefaultNavigatorOptions, ParamListBase, StackActionType, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type CONST from '@src/CONST';

type CustomRouterActionType =
    | {
          type: typeof CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID;
          payload: {
              policyID: string;
          };
      }
    | {type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL};

type SwitchPolicyIdActionType = CustomRouterActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID;
};

type PushActionType = StackActionType & {type: typeof CONST.NAVIGATION.ACTION_TYPE.PUSH};

type DismissModalActionType = CustomRouterActionType & {
    type: typeof CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
};

type ResponsiveStackNavigatorConfig = {
    isSmallScreenWidth: boolean;
};

type ResponsiveStackNavigatorRouterOptions = StackRouterOptions;

type ResponsiveStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> &
    ResponsiveStackNavigatorConfig;

type CustomRouterAction = CommonActions.Action | StackActionType | CustomRouterActionType;

export type {
    SwitchPolicyIdActionType,
    PushActionType,
    DismissModalActionType,
    CustomRouterAction,
    CustomRouterActionType,
    ResponsiveStackNavigatorRouterOptions,
    ResponsiveStackNavigatorProps,
    ResponsiveStackNavigatorConfig,
};
