import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getReportActionActorAccountID} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report, ReportAction} from '@src/types/onyx';

function useLastActorDetails(reportAction: OnyxEntry<ReportAction>, report: OnyxEntry<Report>) {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const lastActorAccountID = getReportActionActorAccountID(reportAction, undefined, undefined) ?? report?.lastActorAccountID;
    // If the last actor's details are not currently saved in Onyx Collection,
    // then try to get that from the last report action if that action is valid
    // to get data from.
    let lastActorDetails: Partial<PersonalDetails> | null = lastActorAccountID ? (personalDetails?.[lastActorAccountID] ?? null) : null;

    if (!lastActorDetails && reportAction) {
        const lastActorDisplayName = reportAction?.person?.[0]?.text;
        lastActorDetails = lastActorDisplayName
            ? {
                  displayName: lastActorDisplayName,
                  accountID: report?.lastActorAccountID,
              }
            : null;
    }

    return lastActorDetails;
}

export default useLastActorDetails;
