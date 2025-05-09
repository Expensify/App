import CONST from '@src/CONST';

const {
    CONCIERGE_LHN_GBR,
    RENAME_SAVED_SEARCH,
    BOTTOM_NAV_INBOX_TOOLTIP,
    LHN_WORKSPACE_CHAT_TOOLTIP,
    GLOBAL_CREATE_TOOLTIP,
    SCAN_TEST_TOOLTIP,
    SCAN_TEST_TOOLTIP_MANAGER,
    SCAN_TEST_CONFIRMATION,
    OUTSANDING_FILTER,
    SETTINGS_TAB,
    WORKSPACES_SETTINGS,
    ACCOUNT_SWITCHER,
    GBR_RBR_CHAT,
    EXPENSE_REPORTS_FILTER,
} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

/**
 * This type is used to store the timestamp of when the user dismisses a product training ui elements.
 */
type DismissedProductTrainingElement = {
    /** The timestamp of when the user dismissed the product training element. */
    timestamp: string;

    /** The method of how the user dismissed the product training element, click or x. */
    dismissedMethod: 'click' | 'x';
};
/**
 * This type is used to store the timestamp of when the user dismisses a product training ui elements.
 */
type DismissedProductTraining = {
    /**
     * When user dismisses the nudgeMigration Welcome Modal, we store the timestamp here.
     */
    [CONST.MIGRATED_USER_WELCOME_MODAL]: DismissedProductTrainingElement;

    // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
    // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
    /**
     * When user dismisses the conciergeLHNGBR product training tooltip, we store the timestamp here.
     */
    [CONCIERGE_LHN_GBR]: DismissedProductTrainingElement;

    /**
     * When user dismisses the renameSavedSearch product training tooltip, we store the timestamp here.
     */
    [RENAME_SAVED_SEARCH]: DismissedProductTrainingElement;

    /**
     * When user dismisses the bottomNavInboxTooltip product training tooltip, we store the timestamp here.
     */
    [BOTTOM_NAV_INBOX_TOOLTIP]: DismissedProductTrainingElement;

    /**
     * When user dismisses the lhnWorkspaceChatTooltip product training tooltip, we store the timestamp here.
     */
    [LHN_WORKSPACE_CHAT_TOOLTIP]: DismissedProductTrainingElement;

    /**
     * When user dismisses the globalCreateTooltip product training tooltip, we store the timestamp here.
     */
    [GLOBAL_CREATE_TOOLTIP]: DismissedProductTrainingElement;

    /**
     * When user dismisses the globalCreateTooltip product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_TOOLTIP]: DismissedProductTrainingElement;

    /**
     * When user dismisses the test manager tooltip product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_TOOLTIP_MANAGER]: DismissedProductTrainingElement;

    /**
     * When user dismisses the test manager on confirmantion page product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_CONFIRMATION]: DismissedProductTrainingElement;

    /**
     * When user dismisses the outstanding filter product training tooltip, we store the timestamp here.
     */
    [OUTSANDING_FILTER]: DismissedProductTrainingElement;

    /**
     * When user dismisses the settings tab product training tooltip, we store the timestamp here.
     */
    [SETTINGS_TAB]: DismissedProductTrainingElement;

    /**
     * When user dismisses the workspaces settings product training tooltip, we store the timestamp here.
     */
    [WORKSPACES_SETTINGS]: DismissedProductTrainingElement;

    /**
     * When user dismisses the accountSwitcher product training tooltip, we store the timestamp here.
     */
    [ACCOUNT_SWITCHER]: DismissedProductTrainingElement;

    /**
     * When user dismisses the chatGBRRBR product training tooltip, we store the timestamp here.
     */
    [GBR_RBR_CHAT]: DismissedProductTrainingElement;

    /**
     * When user dismisses the expenseReportsFilter product training tooltip, we store the timestamp here.
     */
    [EXPENSE_REPORTS_FILTER]: DismissedProductTrainingElement;

    /**
     * When user dismisses the ChangeReportPolicy feature training modal, we store the timestamp here.
     */
    [CONST.CHANGE_POLICY_TRAINING_MODAL]: DismissedProductTrainingElement;
};

export default DismissedProductTraining;
