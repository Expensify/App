import type {ValueOf} from 'type-fest';
import {dismissProductTraining} from '@libs/actions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

const {
    CONCEIRGE_LHN_GBR,
    RENAME_SAVED_SEARCH,
    BOTTOM_NAV_INBOX_TOOLTIP,
    LHN_WORKSPACE_CHAT_TOOLTIP,
    GLOBAL_CREATE_TOOLTIP,
    SCAN_TEST_TOOLTIP,
    SCAN_TEST_TOOLTIP_MANAGER,
    SCAN_TEST_CONFIRMATION,
} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

type ProductTrainingTooltipName = ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>;

type ShouldShowConditionProps = {
    shouldUseNarrowLayout?: boolean;
};

type TooltipData = {
    content: Array<{text: TranslationPaths; isBold: boolean}>;
    onHideTooltip: (isDismissedUsingCloseButton?: boolean) => void;
    name: ProductTrainingTooltipName;
    priority: number;
    shouldShow: (props: ShouldShowConditionProps) => boolean;
    shouldRenderActionButtons?: boolean;
};

const TOOLTIPS: Record<ProductTrainingTooltipName, TooltipData> = {
    [CONCEIRGE_LHN_GBR]: {
        content: [
            {text: 'productTrainingTooltip.conciergeLHNGBR.part1', isBold: false},
            {text: 'productTrainingTooltip.conciergeLHNGBR.part2', isBold: true},
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(CONCEIRGE_LHN_GBR, isDismissedUsingCloseButton),
        name: CONCEIRGE_LHN_GBR,
        priority: 1300,
        // TODO: CONCEIRGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        shouldShow: () => false,
    },
    [RENAME_SAVED_SEARCH]: {
        content: [
            {text: 'productTrainingTooltip.saveSearchTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.saveSearchTooltip.part2', isBold: false},
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(RENAME_SAVED_SEARCH, isDismissedUsingCloseButton),
        name: RENAME_SAVED_SEARCH,
        priority: 1250,
        shouldShow: ({shouldUseNarrowLayout}) => !shouldUseNarrowLayout,
    },
    [GLOBAL_CREATE_TOOLTIP]: {
        content: [
            {text: 'productTrainingTooltip.globalCreateTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.globalCreateTooltip.part2', isBold: false},
            {text: 'productTrainingTooltip.globalCreateTooltip.part3', isBold: false},
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(GLOBAL_CREATE_TOOLTIP, isDismissedUsingCloseButton),
        name: GLOBAL_CREATE_TOOLTIP,
        priority: 1200,
        shouldShow: () => true,
    },
    [BOTTOM_NAV_INBOX_TOOLTIP]: {
        content: [
            {text: 'productTrainingTooltip.bottomNavInboxTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.bottomNavInboxTooltip.part2', isBold: false},
            {text: 'productTrainingTooltip.bottomNavInboxTooltip.part3', isBold: false},
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(BOTTOM_NAV_INBOX_TOOLTIP, isDismissedUsingCloseButton),
        name: BOTTOM_NAV_INBOX_TOOLTIP,
        priority: 900,
        shouldShow: () => true,
    },
    [LHN_WORKSPACE_CHAT_TOOLTIP]: {
        content: [
            {text: 'productTrainingTooltip.workspaceChatTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.workspaceChatTooltip.part2', isBold: false},
            {text: 'productTrainingTooltip.workspaceChatTooltip.part3', isBold: false},
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(LHN_WORKSPACE_CHAT_TOOLTIP, isDismissedUsingCloseButton),
        name: LHN_WORKSPACE_CHAT_TOOLTIP,
        priority: 800,
        shouldShow: () => true,
    },
    [SCAN_TEST_TOOLTIP]: {
        content: [
            {text: 'productTrainingTooltip.scanTestTooltip.part1', isBold: false},
            {text: 'productTrainingTooltip.scanTestTooltip.part2', isBold: true},
        ],
        onHideTooltip: () => dismissProductTraining(SCAN_TEST_TOOLTIP),
        name: SCAN_TEST_TOOLTIP,
        priority: 900,
        shouldShow: () => true,
        shouldRenderActionButtons: true,
    },
    [SCAN_TEST_TOOLTIP_MANAGER]: {
        content: [
            {text: 'productTrainingTooltip.scanTestTooltip.part3', isBold: false},
            {text: 'productTrainingTooltip.scanTestTooltip.part4', isBold: true},
            {text: 'productTrainingTooltip.scanTestTooltip.part5', isBold: false},
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(SCAN_TEST_TOOLTIP_MANAGER, isDismissedUsingCloseButton),
        name: SCAN_TEST_TOOLTIP_MANAGER,
        priority: 1000,
        shouldShow: () => true,
    },
    [SCAN_TEST_CONFIRMATION]: {
        content: [
            {text: 'productTrainingTooltip.scanTestTooltip.part6', isBold: false},
            {text: 'productTrainingTooltip.scanTestTooltip.part7', isBold: true},
            {text: 'productTrainingTooltip.scanTestTooltip.part8', isBold: false},
        ],
        onHideTooltip: (isDismissedUsingCloseButton = false) => dismissProductTraining(SCAN_TEST_CONFIRMATION, isDismissedUsingCloseButton),
        name: SCAN_TEST_CONFIRMATION,
        priority: 1100,
        shouldShow: () => true,
    },
};

export default TOOLTIPS;
export type {ProductTrainingTooltipName};
