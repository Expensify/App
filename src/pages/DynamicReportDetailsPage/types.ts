import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

const CASES = {
    DEFAULT: 'default',
    MONEY_REQUEST: 'money_request',
    MONEY_REPORT: 'money_report',
} as const;

type CaseID = ValueOf<typeof CASES>;

type DynamicReportDetailsPageMenuItem = {
    key: DeepValueOf<typeof CONST.REPORT_DETAILS_MENU_ITEM>;
    translationKey: TranslationPaths;
    icon: IconAsset;
    isAnonymousAction: boolean;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    subtitle?: number;
    shouldShowRightIcon?: boolean;
    subtitleStyle?: StyleProp<ViewStyle>;
};

export {CASES};
export type {CaseID, DynamicReportDetailsPageMenuItem};
