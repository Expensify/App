import type {ValueOf} from 'type-fest';
import {dismissProductTraining} from '@libs/actions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

const {
    CONCEIRGE_LHN_GBR,
    RENAME_SAVED_SEARCH,
    WORKSAPCE_CHAT_CREATE,
    QUICK_ACTION_BUTTON,
    SEARCH_FILTER_BUTTON_TOOLTIP,
    BOTTOM_NAV_INBOX_TOOLTIP,
    LHN_WORKSPACE_CHAT_TOOLTIP,
    GLOBAL_CREATE_TOOLTIP,
} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

type ProductTrainingTooltipName = ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>;

type ShouldShowConditionProps = {
    shouldUseNarrowLayout?: boolean;
};

type TooltipData = {
    content: Array<{text: TranslationPaths; isBold: boolean}>;
    onHideTooltip: () => void;
    name: ProductTrainingTooltipName;
    priority: number;
    shouldShow: (props: ShouldShowConditionProps) => boolean;
};

const TOOLTIPS: Record<ProductTrainingTooltipName, TooltipData> = {
    [CONCEIRGE_LHN_GBR]: {
        content: [
            {text: 'productTrainingTooltip.conciergeLHNGBR.part1', isBold: false},
            {text: 'productTrainingTooltip.conciergeLHNGBR.part2', isBold: true},
        ],
        onHideTooltip: () => dismissProductTraining(CONCEIRGE_LHN_GBR),
        name: CONCEIRGE_LHN_GBR,
        priority: 1300,
        shouldShow: ({shouldUseNarrowLayout}) => !!shouldUseNarrowLayout,
    },
    [RENAME_SAVED_SEARCH]: {
        content: [
            {text: 'productTrainingTooltip.saveSearchTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.saveSearchTooltip.part2', isBold: false},
        ],
        onHideTooltip: () => dismissProductTraining(RENAME_SAVED_SEARCH),
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
        onHideTooltip: () => dismissProductTraining(GLOBAL_CREATE_TOOLTIP),
        name: GLOBAL_CREATE_TOOLTIP,
        priority: 1200,
        shouldShow: () => true,
    },
    [QUICK_ACTION_BUTTON]: {
        content: [
            {text: 'productTrainingTooltip.quickActionButton.part1', isBold: true},
            {text: 'productTrainingTooltip.quickActionButton.part2', isBold: false},
        ],
        onHideTooltip: () => dismissProductTraining(QUICK_ACTION_BUTTON),
        name: QUICK_ACTION_BUTTON,
        priority: 1150,
        shouldShow: () => true,
    },
    [WORKSAPCE_CHAT_CREATE]: {
        content: [
            {text: 'productTrainingTooltip.workspaceChatCreate.part1', isBold: true},
            {text: 'productTrainingTooltip.workspaceChatCreate.part2', isBold: false},
        ],
        onHideTooltip: () => dismissProductTraining(WORKSAPCE_CHAT_CREATE),
        name: WORKSAPCE_CHAT_CREATE,
        priority: 1100,
        shouldShow: () => true,
    },
    [SEARCH_FILTER_BUTTON_TOOLTIP]: {
        content: [
            {text: 'productTrainingTooltip.searchFilterButtonTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.searchFilterButtonTooltip.part2', isBold: false},
        ],
        onHideTooltip: () => dismissProductTraining(SEARCH_FILTER_BUTTON_TOOLTIP),
        name: SEARCH_FILTER_BUTTON_TOOLTIP,
        priority: 1000,
        shouldShow: () => true,
    },
    [BOTTOM_NAV_INBOX_TOOLTIP]: {
        content: [
            {text: 'productTrainingTooltip.bottomNavInboxTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.bottomNavInboxTooltip.part2', isBold: false},
            {text: 'productTrainingTooltip.bottomNavInboxTooltip.part3', isBold: false},
        ],
        onHideTooltip: () => dismissProductTraining(BOTTOM_NAV_INBOX_TOOLTIP),
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
        onHideTooltip: () => dismissProductTraining(LHN_WORKSPACE_CHAT_TOOLTIP),
        name: LHN_WORKSPACE_CHAT_TOOLTIP,
        priority: 800,
        shouldShow: () => true,
    },
};

export default TOOLTIPS;
export type {ProductTrainingTooltipName};
