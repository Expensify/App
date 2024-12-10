import type {ValueOf} from 'type-fest';
import {dismissProductTraining} from '@libs/actions/Welcome';
import CONST from '@src/CONST';

const {CONCEIRGE_LHN_GBR, RENAME_SAVED_SEARCH, WORKSAPCE_CHAT_CREATE, QUICK_ACTION_BUTTON} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

type ProductTrainingTooltipName = ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>;

type ShouldShowConditionProps = {
    shouldUseNarrowLayout?: boolean;
};

type TooltipData = {
    content: string;
    onHideTooltip: () => void;
    name: ProductTrainingTooltipName;
    priority: number;
    shouldShow: (props: ShouldShowConditionProps) => boolean;
};

const PRODUCT_TRAINING_TOOLTIP_DATA: Record<ProductTrainingTooltipName, TooltipData> = {
    [CONCEIRGE_LHN_GBR]: {
        content: 'productTrainingTooltip.conciergeLHNGBR',
        onHideTooltip: () => dismissProductTraining(CONCEIRGE_LHN_GBR),
        name: CONCEIRGE_LHN_GBR,
        priority: 1300,
        shouldShow: ({shouldUseNarrowLayout}) => !!shouldUseNarrowLayout,
    },
    [RENAME_SAVED_SEARCH]: {
        content: 'productTrainingTooltip.saveSearchTooltipText',
        onHideTooltip: () => dismissProductTraining(RENAME_SAVED_SEARCH),
        name: RENAME_SAVED_SEARCH,
        priority: 1250,
        shouldShow: ({shouldUseNarrowLayout}) => !shouldUseNarrowLayout,
    },
    [QUICK_ACTION_BUTTON]: {
        content: 'productTrainingTooltip.quickActionButton',
        onHideTooltip: () => dismissProductTraining(QUICK_ACTION_BUTTON),
        name: QUICK_ACTION_BUTTON,
        priority: 1200,
        shouldShow: () => true,
    },
    [WORKSAPCE_CHAT_CREATE]: {
        content: 'productTrainingTooltip.workspaceChatCreate',
        onHideTooltip: () => dismissProductTraining(WORKSAPCE_CHAT_CREATE),
        name: WORKSAPCE_CHAT_CREATE,
        priority: 1100,
        shouldShow: () => true,
    },
};

export default PRODUCT_TRAINING_TOOLTIP_DATA;
export type {ProductTrainingTooltipName};
