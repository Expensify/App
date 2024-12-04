import {dismissProductTrainingElement} from '@libs/actions/Welcome';
import CONST from '@src/CONST';

const {CONCEIRGE_LHN_GBR, RENAME_SAVED_SEARCH, WORKSAPCE_CHAT_CREATE, QUICK_ACTION_BUTTON} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

type ShouldShowConditionProps = {
    isDismissed: boolean;
    isOnboardingCompleted: boolean;
    hasBeenAddedToNudgeMigration: boolean;
    shouldUseNarrowLayout: boolean;
};

const PRODUCT_TRAINING_TOOLTIP_DATA = {
    [CONCEIRGE_LHN_GBR]: {
        content: 'productTrainingTooltip.conciergeLHNGBR',
        onHideTooltip: () => dismissProductTrainingElement(CONCEIRGE_LHN_GBR),
        name: CONCEIRGE_LHN_GBR,
        priority: 1300,
        shouldShow: ({isDismissed, isOnboardingCompleted, hasBeenAddedToNudgeMigration, shouldUseNarrowLayout}: ShouldShowConditionProps) => {
            if (isDismissed || !shouldUseNarrowLayout) {
                return false;
            }

            if (!isOnboardingCompleted && !hasBeenAddedToNudgeMigration) {
                return false;
            }

            return true;
        },
    },
    [RENAME_SAVED_SEARCH]: {
        content: 'search.saveSearchTooltipText',
        onHideTooltip: () => dismissProductTrainingElement(RENAME_SAVED_SEARCH),
        name: RENAME_SAVED_SEARCH,
        priority: 1250,
        shouldShow: ({isDismissed, isOnboardingCompleted, hasBeenAddedToNudgeMigration, shouldUseNarrowLayout}: ShouldShowConditionProps) => {
            if (isDismissed || shouldUseNarrowLayout) {
                return false;
            }

            if (!isOnboardingCompleted && !hasBeenAddedToNudgeMigration) {
                return false;
            }

            return true;
        },
    },
    [QUICK_ACTION_BUTTON]: {
        content: 'quickAction.tooltip.subtitle',
        onHideTooltip: () => dismissProductTrainingElement(QUICK_ACTION_BUTTON),
        name: QUICK_ACTION_BUTTON,
        priority: 1200,
        shouldShow: ({isDismissed, isOnboardingCompleted, hasBeenAddedToNudgeMigration}: ShouldShowConditionProps) => {
            if (isDismissed) {
                return false;
            }

            if (!isOnboardingCompleted && !hasBeenAddedToNudgeMigration) {
                return false;
            }

            return true;
        },
    },
    [WORKSAPCE_CHAT_CREATE]: {
        content: 'reportActionCompose.tooltip.subtitle',
        onHideTooltip: () => dismissProductTrainingElement(WORKSAPCE_CHAT_CREATE),
        name: WORKSAPCE_CHAT_CREATE,
        priority: 1100,
        shouldShow: ({isDismissed, isOnboardingCompleted, hasBeenAddedToNudgeMigration}: ShouldShowConditionProps) => {
            if (isDismissed) {
                return false;
            }

            if (!isOnboardingCompleted && !hasBeenAddedToNudgeMigration) {
                return false;
            }

            return true;
        },
    },
};

export default PRODUCT_TRAINING_TOOLTIP_DATA;
