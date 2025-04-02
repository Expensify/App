import type {WorkspaceHubSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

// This file is used to define relation between settings split navigator's central screens and RHP screens.
const CENTRAL_PANE_TO_RHP_MAPPING: Partial<Record<keyof WorkspaceHubSplitNavigatorParamList, string[]>> = {
    [SCREENS.WORKSPACE_HUB.SUBSCRIPTION.ROOT]: [
        SCREENS.WORKSPACE_HUB.SUBSCRIPTION.ADD_PAYMENT_CARD,
        SCREENS.WORKSPACE_HUB.SUBSCRIPTION.SIZE,
        SCREENS.WORKSPACE_HUB.SUBSCRIPTION.DISABLE_AUTO_RENEW_SURVEY,
        SCREENS.WORKSPACE_HUB.SUBSCRIPTION.REQUEST_EARLY_CANCELLATION,
        SCREENS.WORKSPACE_HUB.SUBSCRIPTION.CHANGE_BILLING_CURRENCY,
        SCREENS.WORKSPACE_HUB.SUBSCRIPTION.CHANGE_PAYMENT_CURRENCY,
    ],
};

export default CENTRAL_PANE_TO_RHP_MAPPING;
