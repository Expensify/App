/**
 * Renders nothing. With the flatNav beta, the Concierge DM and its threads open on the Concierge page, and every other
 * report opens in the Inbox. Links to reports are built as r/:reportID across the app, so this moves the report to
 * the page it belongs on.
 */
import useIsInConciergePage from '@hooks/useIsInConciergePage';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isInConciergeConversation from '@libs/isInConciergeConversation';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

function hasReportSelector(report: OnyxEntry<Report>): boolean {
    return !!report;
}

function ConciergePageRedirectHandler() {
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportID = getNonEmptyStringOnyxID(route.params?.reportID);
    const reportActionID = route.params?.reportActionID;
    const isFocused = useIsFocused();
    const isInSidePanel = useIsInSidePanel();
    const isInConciergePage = useIsInConciergePage();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isConciergePageEnabled = isBetaEnabledOrUnknown(CONST.BETAS.FLAT_NAV);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [hasReport = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: hasReportSelector});
    const isConciergeConversationSelector = (reports: OnyxCollection<Report>) => isInConciergeConversation(reportID, conciergeReportID, reports);
    const [isConciergeConversation = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: isConciergeConversationSelector});

    const shouldOpenInConciergePage = !isInConciergePage && !!isConciergePageEnabled && isConciergeConversation;
    const shouldOpenInInbox = isInConciergePage && (isConciergePageEnabled === false || (hasReport && !isConciergeConversation));

    // Moving to another tab opens the report on top of this screen, so going back shows this screen again. It redirects
    // only once for each report, so the user can go back past it.
    const redirectedReportIDRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!isFocused || isInSidePanel || !reportID || redirectedReportIDRef.current === reportID) {
            return;
        }
        if (shouldOpenInConciergePage) {
            redirectedReportIDRef.current = reportID;
            Navigation.navigate(ROUTES.CONCIERGE_CONVERSATION.getRoute(reportID, reportActionID), {forceReplace: true});
            return;
        }
        if (shouldOpenInInbox) {
            redirectedReportIDRef.current = reportID;
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, reportActionID), {forceReplace: true});
        }
    }, [isFocused, isInSidePanel, reportActionID, reportID, shouldOpenInConciergePage, shouldOpenInInbox]);

    return null;
}

export default ConciergePageRedirectHandler;
