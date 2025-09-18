import type {NavigatorScreenParams} from '@react-navigation/native';
import HISTORY_PARAM from '@libs/Navigation/linkingConfig/HISTORY_PARAM';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';

type DeepPairsOf<ParamList> = DeepPairsForScreen<ParamList, keyof ParamList>;

type DeepPairsForScreen<ParamList, Key> = Key extends keyof ParamList ? (ParamList[Key] extends NavigatorScreenParams<infer T> ? DeepPairsOf<T> : [Key, keyof ParamList[Key]]) : never;

type DeepPairsOfRoot = DeepPairsOf<RootNavigatorParamList>;

type ScreenToHistoryParamMap = Partial<{
    [TScreen in Screen]: Extract<DeepPairsOfRoot, [TScreen, unknown]>[1];
}>;

// This file maps screens to their history parameters
const SCREEN_TO_HISTORY_PARAM: ScreenToHistoryParamMap = {
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM]: HISTORY_PARAM.SHOW_VALIDATE_CODE_ACTION_MODAL,
};

export default SCREEN_TO_HISTORY_PARAM;
