import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {canShowReportRecipientLocalTimeSelector} from '@selectors/Report';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

type UseReportRecipientLocalTimeParams = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;
};

function useReportRecipientLocalTime({report}: UseReportRecipientLocalTimeParams): boolean {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [canShowRecipientLocalTime = false] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: canShowReportRecipientLocalTimeSelector(report, currentUserAccountID)});

    return canShowRecipientLocalTime;
}

export default useReportRecipientLocalTime;
