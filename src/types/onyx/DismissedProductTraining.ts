import CONST from '@src/CONST';

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
/**
 * This type is used to store the timestamp of when the user dismisses a product training ui elements.
 */
type DismissedProductTraining = {
    /**
     * When user dismisses the nudgeMigration Welcome Modal, we store the timestamp here.
     */
    [CONST.MIGRATED_USER_WELCOME_MODAL]: string;

    // TODO: CONCEIRGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
    // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
    /**
     * When user dismisses the conciergeLHNGBR product training tooltip, we store the timestamp here.
     */
    [CONCEIRGE_LHN_GBR]: string;

    /**
     * When user dismisses the renameSavedSearch product training tooltip, we store the timestamp here.
     */
    [RENAME_SAVED_SEARCH]: string;

    /**
     * When user dismisses the bottomNavInboxTooltip product training tooltip, we store the timestamp here.
     */
    [BOTTOM_NAV_INBOX_TOOLTIP]: string;

    /**
     * When user dismisses the lhnWorkspaceChatTooltip product training tooltip, we store the timestamp here.
     */
    [LHN_WORKSPACE_CHAT_TOOLTIP]: string;

    /**
     * When user dismisses the globalCreateTooltip product training tooltip, we store the timestamp here.
     */
    [GLOBAL_CREATE_TOOLTIP]: string;

    /**
     * When user dismisses the globalCreateTooltip product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_TOOLTIP]: string;

    /**
     * When user dismisses the test manager tooltip product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_TOOLTIP_MANAGER]: string;

    /**
     * When user dismisses the test manager on confirmantion page product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_CONFIRMATION]: string;

    /**
     * When user dismisses the ChangeReportPolicy feature training modal, we store the timestamp here.
     */
    [CONST.CHANGE_POLICY_TRAINING_MODAL]: string;
};

export default DismissedProductTraining;
