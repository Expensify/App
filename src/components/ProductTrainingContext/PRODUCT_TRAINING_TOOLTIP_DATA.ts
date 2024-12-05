import {dismissProductTrainingElement} from '@libs/actions/Welcome';
import CONST from '@src/CONST';

const {CONCEIRGE_LHN_GBR, RENAME_SAVED_SEARCH, WORKSAPCE_CHAT_CREATE, QUICK_ACTION_BUTTON} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

type ShouldShowConditionProps = {
    shouldUseNarrowLayout: boolean;
};

const PRODUCT_TRAINING_TOOLTIP_DATA = {
    [CONCEIRGE_LHN_GBR]: {
        content: 'productTrainingTooltip.conciergeLHNGBR',
        onHideTooltip: () => dismissProductTrainingElement(CONCEIRGE_LHN_GBR),
        name: CONCEIRGE_LHN_GBR,
        priority: 1300,
        shouldShow: ({shouldUseNarrowLayout}: ShouldShowConditionProps) => {
            return shouldUseNarrowLayout;
        },
    },
    [RENAME_SAVED_SEARCH]: {
        content: 'productTrainingTooltip.saveSearchTooltipText',
        onHideTooltip: () => dismissProductTrainingElement(RENAME_SAVED_SEARCH),
        name: RENAME_SAVED_SEARCH,
        priority: 1250,
        shouldShow: ({shouldUseNarrowLayout}: ShouldShowConditionProps) => {
            return !shouldUseNarrowLayout;
        },
    },
    [QUICK_ACTION_BUTTON]: {
        content: 'productTrainingTooltip.quickActionButton',
        onHideTooltip: () => dismissProductTrainingElement(QUICK_ACTION_BUTTON),
        name: QUICK_ACTION_BUTTON,
        priority: 1200,
        shouldShow: () => {
            return true;
        },
    },
    [WORKSAPCE_CHAT_CREATE]: {
        content: 'productTrainingTooltip.workspaceChatCreate',
        onHideTooltip: () => dismissProductTrainingElement(WORKSAPCE_CHAT_CREATE),
        name: WORKSAPCE_CHAT_CREATE,
        priority: 1100,
        shouldShow: () => {
            return true;
        },
    },
};

export default PRODUCT_TRAINING_TOOLTIP_DATA;
