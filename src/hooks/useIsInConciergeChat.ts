import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Returns true when the topmost report in the navigation stack is the Concierge chat.
 * Used to hide the help button when the user is already in Concierge chat.
 */
function useIsInConciergeChat() {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const topmostReportID = useRootNavigationState((state) => Navigation.getTopmostReportId(state));

    return !!conciergeReportID && !!topmostReportID && conciergeReportID === topmostReportID;
}

export default useIsInConciergeChat;
