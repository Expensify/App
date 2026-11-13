/** Loads the Concierge conversations listed on the Concierge page, and opens them. */
import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {IntroSelected, PersonalDetailsList, Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {createChildReport} from './Report';

/** Loads the page of conversations that starts at the cursor, or the first page when there is no cursor. */
function loadConciergeThreads(cursor?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.RAM_ONLY_IS_LOADING_CONCIERGE_THREADS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RAM_ONLY_IS_LOADING_CONCIERGE_THREADS,
            value: true,
        },
    ];
    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.RAM_ONLY_IS_LOADING_CONCIERGE_THREADS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RAM_ONLY_IS_LOADING_CONCIERGE_THREADS,
            value: false,
        },
    ];

    read(READ_COMMANDS.GET_CONCIERGE_THREADS, {cursor}, {optimisticData, finallyData});
}

/** Opens a Concierge conversation on the Concierge page */
function openConciergeConversation(reportID: string) {
    Navigation.navigate(ROUTES.CONCIERGE_CONVERSATION.getRoute(reportID));
}

type OpenConciergeMessageParams = {
    /** A message Concierge posted in its DM that has no thread yet */
    message: ReportAction;
    conciergeReport: OnyxEntry<Report>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    isSelfTourViewed: boolean | undefined;

    /** The personal details of the user and Concierge, who take part in the thread */
    participantsPersonalDetails: OnyxEntry<PersonalDetailsList>;
    delegateAccountID: number | undefined;
};

/** Opens a thread on a Concierge message, so the message becomes its own conversation, even while offline */
function openConciergeMessage({message, conciergeReport, currentUserAccountID, introSelected, isSelfTourViewed, participantsPersonalDetails, delegateAccountID}: OpenConciergeMessageParams) {
    const thread = createChildReport(
        undefined,
        message,
        conciergeReport,
        currentUserAccountID,
        introSelected,
        isSelfTourViewed,
        participantsPersonalDetails,
        conciergeReport,
        delegateAccountID,
    );
    openConciergeConversation(thread.reportID);
}

/** On narrow layouts Concierge opens on top of the screen the user was on, so closing it returns there */
function closeConciergePage(fallbackRoute: Route) {
    const rootState = navigationRef.getRootState();
    if (rootState?.index) {
        Navigation.pop(rootState.key);
        return;
    }
    Navigation.goBack(fallbackRoute);
}

export {closeConciergePage, loadConciergeThreads, openConciergeConversation, openConciergeMessage};
