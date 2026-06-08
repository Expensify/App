import type {ValueOf} from 'type-fest';
import {dismissProductTraining} from '@libs/actions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

const {CONCIERGE_LHN_GBR, RENAME_SAVED_SEARCH, OUTSTANDING_FILTER, ACCOUNT_SWITCHER, SCAN_TEST_DRIVE_CONFIRMATION, GPS_TOOLTIP, HAS_FILTER_NEGATION} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

type ProductTrainingTooltipName = Exclude<ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>, typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL>;

type ShouldShowConditionProps = {
    shouldUseNarrowLayout: boolean;
    isUserPolicyEmployee: boolean;
    isUserPolicyAdmin: boolean;
    hasBeenAddedToNudgeMigration: boolean;
    isUserInPaidPolicy: boolean;
};

type TooltipData = {
    content: TranslationPaths;
    onHideTooltip: (isDismissedUsingCloseButton?: boolean) => void;
    name: ProductTrainingTooltipName;
    priority: number;
    shouldShow: (props: ShouldShowConditionProps) => boolean;
};

const TOOLTIPS: Record<ProductTrainingTooltipName, TooltipData> = {
    [CONCIERGE_LHN_GBR]: {
        content: 'productTrainingTooltip.conciergeLHNGBR',
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(CONCIERGE_LHN_GBR, isDismissedUsingCloseButton),
        name: CONCIERGE_LHN_GBR,
        priority: 1300,
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        shouldShow: () => false,
    },
    [RENAME_SAVED_SEARCH]: {
        content: 'productTrainingTooltip.saveSearchTooltip',
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(RENAME_SAVED_SEARCH, isDismissedUsingCloseButton),
        name: RENAME_SAVED_SEARCH,
        priority: 1250,
        shouldShow: ({shouldUseNarrowLayout}) => !shouldUseNarrowLayout,
    },
    [ACCOUNT_SWITCHER]: {
        content: 'productTrainingTooltip.accountSwitcher',
        onHideTooltip: () => dismissProductTraining(ACCOUNT_SWITCHER),
        name: ACCOUNT_SWITCHER,
        priority: 1600,
        shouldShow: () => true,
    },
    [OUTSTANDING_FILTER]: {
        content: 'productTrainingTooltip.outstandingFilter',
        onHideTooltip: () => dismissProductTraining(OUTSTANDING_FILTER),
        name: OUTSTANDING_FILTER,
        priority: 1925,
        shouldShow: ({isUserPolicyAdmin}) => isUserPolicyAdmin,
    },
    [SCAN_TEST_DRIVE_CONFIRMATION]: {
        content: 'productTrainingTooltip.scanTestDriveTooltip',
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(SCAN_TEST_DRIVE_CONFIRMATION, isDismissedUsingCloseButton),
        name: SCAN_TEST_DRIVE_CONFIRMATION,
        priority: 1200,
        shouldShow: () => true,
    },
    [GPS_TOOLTIP]: {
        content: 'productTrainingTooltip.gpsTooltip',
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(GPS_TOOLTIP, isDismissedUsingCloseButton),
        name: GPS_TOOLTIP,
        priority: 800,
        shouldShow: () => true,
    },
    [HAS_FILTER_NEGATION]: {
        content: 'productTrainingTooltip.hasFilterNegation',
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(HAS_FILTER_NEGATION, isDismissedUsingCloseButton),
        name: HAS_FILTER_NEGATION,
        priority: 1000,
        shouldShow: () => true,
    },
};

export default TOOLTIPS;
export type {ProductTrainingTooltipName};
