import useOnyx from '@hooks/useOnyx';

import getPlatform from '@libs/getPlatform';
import {isOneTransactionReport, isReportTransactionThread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {NavigationRouteContext} from '@react-navigation/native';
import {useContext} from 'react';

// The arrow keys only page between expenses on web, so native keeps its usual composer focus.
const isWeb = getPlatform() === CONST.PLATFORM.WEB;

const hasExpenseCarouselSelector = (transactionIDs: string[] | undefined) => (transactionIDs?.length ?? 0) > 1;

/**
 * Whether the composer should stay unfocused when the screen opens or a modal closes. The left and right arrow keys move
 * between expenses only in the RHP expense view with more than one expense, so only there the composer isn't auto-focused.
 * A report with a single expense is shown as that expense's view.
 */
function useShouldSkipComposerAutoFocus(report: OnyxEntry<Report>): boolean {
    // Read off the context because `useRoute` throws outside a screen.
    const routeName = useContext(NavigationRouteContext)?.name;
    const [hasExpenseCarousel = false] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, {selector: hasExpenseCarouselSelector});

    const isExpenseView = isReportTransactionThread(report) || isOneTransactionReport(report);
    return isWeb && routeName !== SCREENS.REPORT && hasExpenseCarousel && isExpenseView;
}

export default useShouldSkipComposerAutoFocus;
