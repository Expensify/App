<<<<<<< HEAD
import CONST from '@src/CONST';

const {CONCEIRGE_LHN_GBR, RENAME_SAVED_SEARCH, WORKSAPCE_CHAT_CREATE, QUICK_ACTION_BUTTON} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;
=======
>>>>>>> fdd9136 (Merge pull request #54260 from Expensify/revert-54064-and-53396)
/**
 * This type is used to store the timestamp of when the user dismisses a product training ui elements.
 */
type DismissedProductTraining = {
    /**
     * When user dismisses the nudgeMigration Welcome Modal, we store the timestamp here.
     */
<<<<<<< HEAD
    [CONST.MIGRATED_USER_WELCOME_MODAL]: Date;

    /**
     * When user dismisses the conciergeLHNGBR product training tooltip, we store the timestamp here.
     */
    [CONCEIRGE_LHN_GBR]: Date;

    /**
     * When user dismisses the renameSavedSearch product training tooltip, we store the timestamp here.
     */
    [RENAME_SAVED_SEARCH]: Date;

    /**
     * When user dismisses the workspaceChatCreate product training tooltip, we store the timestamp here.
     */
    [WORKSAPCE_CHAT_CREATE]: Date;

    /**
     * When user dismisses the quickActionButton product training tooltip, we store the timestamp here.
     */
    [QUICK_ACTION_BUTTON]: Date;
=======
    migratedUserWelcomeModal: Date;
>>>>>>> fdd9136 (Merge pull request #54260 from Expensify/revert-54064-and-53396)
};

export default DismissedProductTraining;
