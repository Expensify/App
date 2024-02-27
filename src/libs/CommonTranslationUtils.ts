import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as Localize from './Localize';

/**
 * This file contains common translations that are used in multiple places in the app.
 * This is done to avoid duplicate translations and to keep the translations consistent.
 * This also allows us to not repeatedly translate the same string which may happen due
 * to translations being done for eg, in a loop.
 *
 * This was identified as part of a performance audit.
 * details: https://github.com/Expensify/App/issues/35234#issuecomment-1926911643
 */

let deletedTaskText = '';
let deletedMessageText = '';
let attachmentText = '';
let archivedText = '';
let hiddenText = '';
let unavailableWorkspaceText = '';

function isTranslationAvailable() {
    return deletedTaskText && deletedMessageText && attachmentText && archivedText && hiddenText && unavailableWorkspaceText;
}

Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => {
        if (!val && isTranslationAvailable()) {
            return;
        }

        deletedTaskText = Localize.translateLocal('parentReportAction.deletedTask');
        deletedMessageText = Localize.translateLocal('parentReportAction.deletedMessage');
        attachmentText = Localize.translateLocal('common.attachment');
        archivedText = Localize.translateLocal('common.archived');
        hiddenText = Localize.translateLocal('common.hidden');
        unavailableWorkspaceText = Localize.translateLocal('workspace.common.unavailable');
    },
});

export default {
    deletedTaskText: () => deletedTaskText,
    deletedMessageText: () => deletedMessageText,
    attachmentText: () => attachmentText,
    archivedText: () => archivedText,
    hiddenText: () => hiddenText,
    unavailableWorkspaceText: () => unavailableWorkspaceText,
};
