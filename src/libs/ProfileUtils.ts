/**
 * Helpers shared by the Profile page and the workspace Member details page, so both show a person's
 * local time and chat history entry the same way.
 */
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import getIsNarrowLayout from './getIsNarrowLayout';
import Navigation from './Navigation/Navigation';
import {hasAutomatedExpensifyAccountIDs} from './ReportUtils';
import {buildQueryStringFromFilterFormValues} from './SearchQueryUtils';
import {isAgentEmail} from './SessionUtils';

type ShouldShowLocalTimeParams = {
    accountID: number;
    timezone: Timezone | undefined;
    isCustomAgent: boolean;
    isValidated: boolean;
};

/** Whether a person's local time is shown on their profile, which is only meaningful for validated humans with a timezone */
function shouldShowLocalTime({accountID, timezone, isCustomAgent, isValidated}: ShouldShowLocalTimeParams): boolean {
    return !hasAutomatedExpensifyAccountIDs([accountID]) && !isCustomAgent && !isEmptyObject(timezone) && isValidated;
}

/** Gets the label of the entry that opens the chat history of a person, which reads differently for agents */
function getChatHistoryTranslationKey(isCustomAgent: boolean, login: string | undefined) {
    return isCustomAgent || isAgentEmail(login) ? 'profilePage.viewAgentHistory' : 'profilePage.seeChatHistory';
}

/** Opens a chat search filtered to the messages sent by the given account */
function navigateToChatHistory(accountID: number) {
    const query = buildQueryStringFromFilterFormValues({
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        from: [String(accountID)],
    });
    const route = ROUTES.SEARCH_ROOT.getRoute({query, rawQuery: query});
    // On narrow layouts the reveal keeps browser Back in sync and shows Search under the closing panel, instead of the page below it
    if (getIsNarrowLayout()) {
        Navigation.revealRouteBeforeDismissingModal(route);
        return;
    }
    // On wide layouts the reveal pads the root history, so browser Back changes the URL but not the screen. Close the panel first, then open Search as a normal tab switch.
    Navigation.dismissModal({afterTransition: () => Navigation.navigate(route)});
}

export {shouldShowLocalTime, getChatHistoryTranslationKey, navigateToChatHistory};
