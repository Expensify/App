import type {NavigatorScreenParams} from '@react-navigation/native';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type {Screen} from '@src/SCREENS';

type DeepPairsOf<ParamList> = DeepPairsForScreen<ParamList, keyof ParamList>;

type DeepPairsForScreen<ParamList, Key> = Key extends keyof ParamList ? (ParamList[Key] extends NavigatorScreenParams<infer T> ? DeepPairsOf<T> : [Key, keyof ParamList[Key]]) : never;

type DeepPairsOfRoot = DeepPairsOf<RootNavigatorParamList>;

type ScreenToHistoryParamMap = Partial<{
    [TScreen in Screen]: Extract<DeepPairsOfRoot, [TScreen, unknown]>[1];
}>;

// TODO check if this is needed at all ?
// This file maps screens to their history parameters
const SCREEN_TO_HISTORY_PARAM: ScreenToHistoryParamMap = {};

export default SCREEN_TO_HISTORY_PARAM;
